import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import ManualTournament, ManualUser, ManualTournamentParticipants, TournamentMatch
import logging
from channels.db import database_sync_to_async 
from cryptography.fernet import Fernet
from django.conf import settings
import secrets

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
    return ManualTournament.objects.filter(participants__user_id=user_id).first()

@database_sync_to_async
def get_accepted_participants(tournament_id):
    participants_qs = ManualTournamentParticipants.objects.filter(
        tournament_id=tournament_id, 
        status='accepted'
    ).select_related('user')

    return [p.user.username for p in participants_qs]


@database_sync_to_async
def set_tournament_mode(tournament_id, mode):
    """
    Récupère un tournoi, met à jour son mode et le sauvegarde.
    Retourne le tournoi mis à jour.
    """
    tournament = ManualTournament.objects.get(id=tournament_id)
    tournament.mode = mode
    tournament.save()
    return tournament


@database_sync_to_async
def create_matches_for_tournament(tournament_id, usernames):

    import math
    n = len(usernames)
    if n not in [4, 8, 16]:
        raise ValueError("val error.")

    tournament = ManualTournament.objects.get(id=tournament_id)
    tournament.status = "ongoing"
    tournament.rounds = n // 2
    tournament.save()
    match_key = generate_online_match_key()

    for i in range(0, n, 2):
        match_order = (i // 2) + 1
        player1 = usernames[i]
        player2 = usernames[i+1]

        TournamentMatch.objects.create(
            tournament=tournament,
            round_number=1,
            match_order=match_order,
            player1=player1,
            player2=player2,
            status="pending",
            match_key=match_key
        )
    
    rounds_count = int(math.log2(n))
    previous_matches = n // 2
    for round_number in range(2, rounds_count + 1):
        num_matches = previous_matches // 2
        for match_order in range(1, num_matches + 1):
            TournamentMatch.objects.create(
                tournament=tournament,
                round_number=round_number,
                match_order=match_order,
                player1="TBD",
                player2="TBD",
                status="pending",
                match_key=match_key
            )
        previous_matches = num_matches

    return tournament


def encrypt_thing(args):
    """Encrypts the args."""
    return cipher.encrypt(args.encode('utf-8')).decode('utf-8')

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
        elif str(action) == "tournament_invite":
            await self.handle_tournament_invite(event)
        elif str(action) == "kick_tournament":
            await self.handle_kick_tournament(event)
        elif str(action) == "create_online_tournament":
            await self.create_online_tournament(event)
        else:
            logger.warning("Unknown action: %s", action)
            await self.send(json.dumps({"error": "Unknown action"}))

    async def handle_create_tournament_lobby(self, event):
        user_id = event.get("userId")
        tournament_size = event.get("tournamentSize")
        user = await self.get_user(user_id)
        serial_key = str(user_id)
        tournament = await self.create_tournament(serial_key, user, tournament_size)
        await self.add_participant(tournament, user)
        await self.update_user_status(user, "lobby")
        await self.channel_layer.group_send(f"user_{user_id}", {
            "type": "tournament_message",
            "action": "create_tournament_lobby",
            "tournamentLobbyId": tournament.serial_key,
            "organizer": user.username,
            "tournamentSize": tournament_size,
            "message": f"Tournament lobby created successfully by {user.username}",
        })
        logger.info("Tournament lobby created successfully")

    async def handle_participant_status_change(self, event, new_status, callback_action):
        invited_id = event.get("userId")
        invited_user = await self.get_user(invited_id)
        invited_tournament = event.get("tournamentId")
        participant = await self.update_invited_participant_status(invited_user, invited_tournament, new_status)
        if not participant:
            logger.warning(f"User {invited_user.username} not found in tournament {invited_tournament}")
            return
        logger.info(f"Participant {invited_user.username} status updated to {new_status}")
        logger.info(f"Parameters: {invited_id}, {callback_action}, {invited_tournament}, {invited_id}")
        await self.send_info(invited_id, callback_action, tournament_id=invited_tournament, recipient=invited_id)

    async def handle_tournament_invite(self, event):
        author_id = event.get("author")
        recipient_id = event.get("recipient")
        initiator = await self.get_user(author_id)
        recipient_user = await self.get_user(recipient_id)

        event["author_username"] = await get_username(author_id)
        event["recipient_username"] = await get_username(recipient_id)
        logger.info("Author: %s, Recipient: %s", event["author_username"], event["recipient_username"])

        tournament = await self.get_initiator_tournament(initiator)
        logger.info("Tournament: %s", tournament)
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
        
        await self.kick_participant(tournament, recipient_user)
        await self.send_info(author_id, "back_kick_tournament", author=author_id, recipient=recipient_id, tournament_id=tournament.id)
        logger.info("%s is kicked from tournament.", event["recipient_username"])
        


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
            rounds=tournament_size,
            mode="online",
        )

    @database_sync_to_async
    def add_participant(self, tournament, user):
        return ManualTournamentParticipants.objects.get_or_create(
            tournament=tournament,
            user=user,
            status="accepted"
        )
        
    @database_sync_to_async
    def kick_participant(self, tournament, user):
        return ManualTournamentParticipants.objects.filter(
            tournament=tournament,
            user=user
        ).delete()
    
    @database_sync_to_async
    def invite_participant(self, tournament, user):
        participant, created = ManualTournamentParticipants.objects.get_or_create(
            tournament=tournament,
            user=user,
            defaults={'status': 'pending'}
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
    def update_invited_participant_status(self, user, tournament, new_status):
        participant = ManualTournamentParticipants.objects.filter(
            user=user,
            tournament=tournament,
            status="pending"
        ).first()
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

            usernames = await get_accepted_participants(tournament.id)
            if not usernames:
                logger.warning(f"No participants found with status 'accepted' for tournament {tournament.id}")
                return
            
            await set_tournament_mode(tournament.id, "online")

            updated_tournament = await create_matches_for_tournament(tournament.id, usernames)
            logger.info(
                f"Online tournament bracket created successfully for tournament {updated_tournament.id} "
                f"with {len(usernames)} participants."
            )

            # await self.send_info(
            #     user_id, 
            #     "back_create_online_tournament", 
            #     tournament_id=updated_tournament.id,
            #     bracket_created=True
            # )

        except ValueError as ve:
            logger.error(f"Bracket creation failed: {str(ve)}")

        except Exception as e:
            logger.exception("Error while creating online tournament bracket:")

