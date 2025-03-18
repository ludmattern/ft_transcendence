import json
from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore
from asgiref.sync import sync_to_async  # type: ignore
from .models import (
    ManualTournament,
    ManualUser,
    ManualTournamentParticipants,
    TournamentMatch,
)
import logging
from channels.db import database_sync_to_async  # type: ignore
from cryptography.fernet import Fernet #type: ignore
from django.conf import settings  # type: ignore
import secrets
import random
import string
from django.db.models import Q  # type: ignore

logger = logging.getLogger(__name__)


def generate_online_match_key():
    random_part = secrets.token_hex(4)
    return f"tournOnline_{random_part}"


@database_sync_to_async
def get_username(user_id):
    try:
        user = ManualUser.objects.get(pk=user_id)
        return user.username
    except ManualUser.DoesNotExist:
        return None


cipher = Fernet(settings.FERNET_KEY)


@database_sync_to_async
def get_single_user_tournament(user_id):
    return ManualTournament.objects.filter(participants__user_id=user_id, status="upcoming").order_by("-created_at").first()


@database_sync_to_async
def get_accepted_participants(tournament_id):
    participants_qs = ManualTournamentParticipants.objects.filter(tournament_id=tournament_id, status="accepted").select_related(
        "user"
    )

    return [p.user.username for p in participants_qs]


@database_sync_to_async
def get_accepted_participants_id(tournament_id):
    participants_qs = ManualTournamentParticipants.objects.filter(tournament_id=tournament_id, status="accepted").select_related(
        "user"
    )
    logger.info("participants_qs: %s", participants_qs)
    return [p.user.id for p in participants_qs]


@database_sync_to_async
def set_tournament_mode(tournament_id, mode):
    tournament = ManualTournament.objects.get(id=tournament_id)
    tournament.mode = mode
    tournament.save()
    return tournament

@database_sync_to_async
def create_matches_for_tournament(tournament_id, participant_ids):
    import math

    n = len(participant_ids)
    if n not in [4, 8, 16]:
        raise ValueError("val error.")

    tournament = ManualTournament.objects.get(id=tournament_id)
    tournament.status = "ongoing"
    tournament.size = n // 2
    tournament.save()

    random.shuffle(participant_ids)

    for i in range(0, n, 2):
        match_order = (i // 2) + 1
        p1_id = participant_ids[i]
        p2_id = participant_ids[i + 1]

        TournamentMatch.objects.create(
            tournament=tournament,
            round_number=1,
            match_order=match_order,
            player1_id=p1_id,
            player2_id=p2_id,
            status="ready",
            match_key=generate_online_match_key(),
        )

    size_count = int(math.log2(n))
    previous_matches = n // 2
    for round_number in range(2, size_count + 1):
        num_matches = previous_matches // 2
        for match_order in range(1, num_matches + 1):
            TournamentMatch.objects.create(
                tournament=tournament,
                round_number=round_number,
                match_order=match_order,
                player1_id=None,
                player2_id=None,
                status="pending",
                match_key=generate_online_match_key(),
            )
        previous_matches = num_matches

    return tournament



class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "tournament_service"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info("Connected to tournament_service group (channel=%s)", self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        logger.info("Disconnected from tournament_service group (channel=%s)", self.channel_name)

    async def tournament_message(self, event):
        logger.info("Tournament message received: %s", event)
        action = event.get("action")
        logger.info("Action received: %s", action)
        if str(action) == "create_tournament_lobby":
            await self.handle_create_tournament_lobby(event)
        elif str(action) == "join_tournament":
            await self.handle_participant_status_change(event, "accepted", "back_join_tournament")
        elif str(action) == "reject_tournament":
            await self.handle_participant_status_change(event, "rejected", "back_reject_tournament")
        elif str(action) == "cancel_tournament_invite":
            await self.handle_participant_status_change(event, "rejected", "back_cancel_tournament_invite")
        elif str(action) == "tournament_invite":
            await self.handle_tournament_invite(event)
        elif str(action) == "kick_tournament":
            await self.handle_kick_tournament(event)
        elif str(action) == "create_online_tournament":
            await self.create_online_tournament(event)
        elif str(action) == "leave_online_tournament":
            await self.handle_leave_online_tournament(event)
        elif str(action) == "cancel_tournament":
            await self.handle_cancel_tournament(event)
        elif str(action) == "leave_tournament":
            await self.handle_leave_tournament(event)
        else:
            logger.warning("Unknown action: %s", action)
            await self.send(json.dumps({"error": "Unknown action"}))

    async def handle_create_tournament_lobby(self, event):
        user_id = event.get("userId")
        tournament_size = event.get("tournamentSize")
        user = await self.get_user(user_id)
        serial_key = await self.generate_unique_serial_key()
        tournament = await self.create_tournament(serial_key, user, tournament_size)
        user.current_tournament_id = tournament.id
        await sync_to_async(user.save)()
        await self.add_participant(tournament, user)
        await self.update_user_status(user, "lobby")
        await self.channel_layer.group_send(
            f"user_{user_id}",
            {
                "type": "tournament_message",
                "action": "create_tournament_lobby",
                "tournamentLobbyId": tournament.serial_key,
                "organizer": user.username,
                "tournamentSize": tournament_size,
                "message": f"Tournament lobby created successfully by {user.username}",
            },
        )
        logger.info("Tournament lobby created successfully")

    async def handle_participant_status_change(self, event, new_status, callback_action):
        invited_id = event.get("userId")
        invited_user = await self.get_user(invited_id)
        invited_tournament = event.get("tournamentId")

        if new_status == "accepted" and invited_user.current_tournament_id != 0:
            logger.warning(f"User {invited_user.username} is already in a tournament")
            return

        participant = await self.update_invited_participant_status(invited_user, invited_tournament, new_status)
        if not participant:
            logger.warning(f"User {invited_user.username} not found in tournament {invited_tournament}")
            return
        if new_status == "accepted":
            invited_user.current_tournament_id = invited_tournament
        await sync_to_async(invited_user.save)()
        logger.info(f"Participant {invited_user.username} status updated to {new_status}")
        logger.info(f"Parameters: {invited_id}, {callback_action}, {invited_tournament}, {invited_id}")
        await self.send_info(invited_id, callback_action, tournament_id=invited_tournament, recipient=invited_id)

    async def handle_tournament_invite(self, event):
        author_id = event.get("author")
        recipient_id = event.get("recipient")
        initiator = await self.get_user(author_id)
        recipient_user = await self.get_user(recipient_id)

        if(str(recipient_id) == str(author_id) ):
            logger.warning("You can't invite yourself to a tournamnet.")
            await self.channel_layer.group_send(f"user_{author_id}", {"type": "info_message", "info": "You can't invite yourself to a tournamnet."})
            return

        event["author_username"] = (await get_username(author_id))
        event["recipient_username"] = (await get_username(recipient_id))

        tournament = await self.get_initiator_tournament(initiator)
        logger.info("Tournament	: %s", tournament)
        if not tournament:
            logger.warning(f"No active tournament found for initiator {initiator.username}")
            return

        await self.invite_participant(tournament, recipient_user)
        await self.send_info(author_id, "back_tournament_invite", author=author_id, recipient=recipient_id)
        logger.info("Tournament invite sent to %s", event["recipient_username"])

    async def handle_kick_tournament(self, event):
        author_id = event.get("author")
        recipient_id = event.get("recipient")
        initiator = await self.get_user(author_id)
        recipient_user = await self.get_user(recipient_id)

        event["author_username"] = await get_username(author_id)
        event["recipient_username"] = await get_username(recipient_id)
        logger.info("Author: %s, Recipient: %s", event["author_username"], event["recipient_username"])

        tournament = await self.get_initiator_tournament(initiator)
        if not tournament:
            logger.warning(f"No active tournament found for initiator {initiator.username}")
            return

        recipient_user.current_tournament_id = 0
        await sync_to_async(recipient_user.save)()
        await self.kick_participant(tournament, recipient_user)
        await self.send_info(
            author_id, "back_kick_tournament", author=author_id, recipient=recipient_id, tournament_id=tournament.id
        )
        logger.info("%s is kicked from tournament.", event["recipient_username"])

    async def handle_cancel_tournament(self, event):
        logger.info("Cancel tournament event received: %s", event)
        author_id = event.get("userId")
        initiator = await self.get_user(author_id)
        if not initiator.current_tournament_id:
            logger.warning(f"No active tournament found for initiator {initiator.username}")
            return

        tournament = await self.get_initiator_tournament(initiator)
        if not tournament:
            logger.warning(f"No active tournament found for initiator {initiator.username}")
            return

        tournament_id = tournament.id

        participant_list = await get_accepted_participants_id(tournament_id)
        for participant_id in participant_list:
            participant = await self.get_user(participant_id)
            participant.current_tournament_id = 0
            await sync_to_async(participant.save)()

        logger.info("Participant list: %s", participant_list)
        await self.cancel_tournament(tournament)
        await self.send_info(
            author_id,
            "back_cancel_tournament",
            author=author_id,
            tournament_id=tournament.id,
            participant_list=participant_list,
        )
        logger.info("Tournament has been cancelled")

    async def handle_leave_tournament(self, event):
        author_id = event.get("userId")
        initiator = await self.get_user(author_id)

        if not initiator.current_tournament_id:
            logger.warning(f"No active tournament found for initiator {initiator.username}")
            return

        tournament = await self.get_tournament_from_id(initiator.current_tournament_id)
        if not tournament:
            logger.warning(f"No active tournament found for initiator {initiator.username}")
            return

        initiator.current_tournament_id = 0
        await sync_to_async(initiator.save)()
        await self.kick_participant(tournament, initiator)
        await self.send_info(
            author_id,
            "back_leave_tournament",
            author=author_id,
            tournament_id=tournament.id,
        )
        logger.info("%s has left the tournament.", initiator.username)

    async def send_info(self, user_id, action, **kwargs):
        logger.info(f"paremeters recieved: {user_id}, {action}, {kwargs}")
        payload = {"type": "info_message", "action": action, **kwargs}
        await self.channel_layer.group_send(f"user_{0}", payload)

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return ManualUser.objects.get(id=user_id)
        except ManualUser.DoesNotExist:
            return None

    @database_sync_to_async
    def create_tournament(self, serial_key, user, tournament_size):
        return ManualTournament.objects.create(
            serial_key=serial_key,
            organizer=user,
            size=tournament_size,
            mode="online",
        )

    @database_sync_to_async
    def cancel_tournament(self, tournament):
        try:
            tournament.delete()
            return f"Tournament '{tournament.name}' and all its participants have been deleted."
        except ManualTournament.DoesNotExist:
            return "Tournament not found."

    @database_sync_to_async
    def add_participant(self, tournament, user):
        return ManualTournamentParticipants.objects.get_or_create(tournament=tournament, user=user, status="accepted")

    @database_sync_to_async
    def kick_participant(self, tournament, user):
        return ManualTournamentParticipants.objects.filter(tournament=tournament, user=user).delete()

    @database_sync_to_async
    def invite_participant(self, tournament, user):
        participant, created = ManualTournamentParticipants.objects.get_or_create(
            tournament=tournament, user=user, defaults={"status": "pending"}
        )
        if not created and participant.status == "rejected":
            participant.status = "pending"
            participant.save()
        return participant

    @database_sync_to_async
    def update_user_status(self, user, status):
        user.tournament_status = status
        user.save()

    @database_sync_to_async
    def get_initiator_tournament(self, initiator):
        return ManualTournament.objects.filter(organizer=initiator, status="upcoming").first()

    @database_sync_to_async
    def get_tournament_from_id(self, tournament_id):
        return ManualTournament.objects.get(id=tournament_id)

    @database_sync_to_async
    def update_invited_participant_status(self, user, tournament, new_status):
        participant = ManualTournamentParticipants.objects.filter(user=user, tournament=tournament, status="pending").first()
        if participant:
            participant.status = new_status
            participant.save()
        return participant

    async def create_online_tournament(self, event):
        try:
            user_id = event.get("organizer_id")
            user = await self.get_user(user_id)
            if not user:
                logger.warning(f"User {user_id} not found.")
                return

            tournament = await get_single_user_tournament(user.id)
            if not tournament:
                logger.warning(f"No upcoming tournament found for organizer {user.username}")
                return

            participant_ids = await get_accepted_participants_id(tournament.id)
            if not participant_ids:
                logger.warning(f"No participants found with status 'accepted' for tournament {tournament.id}")
                return
            
            await set_tournament_mode(tournament.id, "online")

            updated_tournament = await create_matches_for_tournament(tournament.id, participant_ids)
            logger.info(
                f"Online tournament bracket created successfully for tournament {updated_tournament.id} "
                f"with {len(participant_ids)} participants."
            )

            await self.send_info(
                user.id,
                "back_create_online_tournament",
                author=user.id,
                tournament_id=tournament.id,
                participant_list=participant_ids,
            )

        except ValueError as ve:
            logger.error(f"Bracket creation failed: {str(ve)}")

        except Exception:
            logger.exception("Error while creating online tournament bracket:")

    async def handle_leave_online_tournament(self, event):
        try:
            user_id = event.get("user_id")
            if not user_id:
                await self.send(json.dumps({"error": "user_id is required"}))
                return

            user = await self.get_user(user_id)
            if not user:
                await self.send(json.dumps({"error": "User not found"}))
                return

            tournament_id = user.current_tournament_id
            if tournament_id == 0:
                logger.warning(f"No active tournament found for user {user.username}")
                return

            participant = await sync_to_async(
                lambda: ManualTournamentParticipants.objects.filter(tournament_id=tournament_id, user=user).first()
            )()

            if not participant:
                await self.send(json.dumps({"error": "User not found in tournament"}))
                return

            participant.status = "left"
            await sync_to_async(participant.save)()

            match = await sync_to_async(
                lambda: TournamentMatch.objects.filter(tournament_id=tournament_id)
                .filter(Q(status="pending") | Q(status="ready"))
                .filter(Q(player1_id=user.id) | Q(player2_id=user.id))
                .first()
            )()

            next_match_player_ids = []
            current_match_player_ids = []

            if match:
                if match.player1_id == user.id:
                    opponent_id = match.player2_id
                else:
                    opponent_id = match.player1_id

                if opponent_id is None:
                    current_match_player_ids = [user.id]
                else:
                    current_match_player_ids = [user.id, opponent_id]

                match.winner_id = opponent_id
                match.score = "Forfeit"
                match.status = "completed"
                await sync_to_async(match.save)()

                next_round = match.round_number + 1
                next_match_order = (match.match_order + 1) // 2
                next_match = await sync_to_async(
                    lambda: TournamentMatch.objects.filter(
                        tournament_id=tournament_id,
                        round_number=next_round,
                        match_order=next_match_order
                    ).first()
                )()

                if next_match and opponent_id is not None:
                    if match.match_order % 2 == 1:
                        next_match.player1_id = opponent_id
                        match.score = "Forfeit"
                    else:
                        next_match.player2_id = opponent_id

                    if next_match.player1_id is not None and next_match.player2_id is not None:
                        next_match_player_ids = [next_match.player1_id, next_match.player2_id]

                    await sync_to_async(next_match.save)()

            user.current_tournament_id = 0
            await sync_to_async(user.save)()

            active_players_count = await sync_to_async(
                lambda: ManualTournamentParticipants.objects.filter(
                    tournament_id=tournament_id,
                    status__in=["accepted", "eliminated", "left"],
                ).count()
            )()

            left_players_count = await sync_to_async(
                lambda: ManualTournamentParticipants.objects.filter(tournament_id=tournament_id, status="left").count()
            )()

            logger.info(
                f"Tournament {tournament_id} - Active Players: {active_players_count}, Left Players: {left_players_count}"
            )

            if active_players_count > 0 and active_players_count == left_players_count:
                logger.info(f"Deleting tournament {tournament_id} since all players have left.")
                await sync_to_async(lambda: ManualTournament.objects.filter(id=tournament_id).delete())()

            participant_list = await sync_to_async(
                lambda: list(
                    ManualTournamentParticipants.objects.filter(tournament_id=tournament_id)
                    .exclude(Q(status="rejected") | Q(status="left"))
                    .values_list("user_id", flat=True)
                )
            )()

            payload = {
                "type": "info_message",
                "action": "back_tournament_game_over",
                "tournament_id": tournament_id,
                "participant_list": participant_list,
                "next_match_player_ids": next_match_player_ids,
                "current_match_player_ids": current_match_player_ids,
            }
            logger.info(f"back_tournament_game_over sent to gateway: {payload}")
            await self.channel_layer.group_send(f"user_{0}", payload)

        except Exception as e:
            logger.exception("Error handling online tournament abandonment:")
            await self.send(json.dumps({"error": str(e)}))


    async def generate_unique_serial_key(self, length=8):
        from service.models import ManualTournament

        while True:
            key = "".join(random.choices(string.ascii_uppercase + string.digits, k=length))
            exists = await sync_to_async(ManualTournament.objects.filter(serial_key=key).exists)()
            if not exists:
                return key
