import logging
from django.db import models  # type: ignore
from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore
from channels.db import database_sync_to_async  # type: ignore
from .models import (
    ManualUser,
    ManualFriendsRelations,
    ManualTournament,
    ManualBlockedRelations,
    ManualPrivateGames,
)
from asgiref.sync import sync_to_async  # type: ignore

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_username(user_id):
    try:
        user = ManualUser.objects.get(pk=user_id)
        return user.username
    except ManualUser.DoesNotExist:
        return None


@database_sync_to_async
def get_id(user_username):
    user = ManualUser.objects.filter(username=user_username).first()
    if user:
        return user.id
    return None


@database_sync_to_async
def get_users_id():
    return list(ManualUser.objects.values_list("id", flat=True))


async def get_profile_picture(user_id):
    try:
        user = await sync_to_async(ManualUser.objects.get)(id=user_id)
        return user.profile_picture.url
    except ManualUser.DoesNotExist:
        return "/media/profile_pics/default-profile-150.png"


async def get_non_blocked_users_id(author_id):
    users_blocked_by_author = await database_sync_to_async(
        lambda: list(
            ManualBlockedRelations.objects.filter(initiator_id=author_id).values_list(
                "blocked_user_id", flat=True
            )
        )
    )()
    users_who_blocked_author = await database_sync_to_async(
        lambda: list(
            ManualBlockedRelations.objects.filter(
                blocked_user_id=author_id
            ).values_list("user_id", flat=True)
        )
    )()
    blocked_set = set(users_blocked_by_author + users_who_blocked_author)
    all_users = await get_users_id()
    non_blocked_users = [
        user_id
        for user_id in all_users
        if user_id not in blocked_set and user_id != author_id
    ]

    return non_blocked_users


async def is_blocked(author_id, recipient_id):
    blocked_relation = await database_sync_to_async(
        lambda: ManualBlockedRelations.objects.filter(
            models.Q(
                initiator_id=author_id, blocked_user_id=recipient_id
            )  # Author blocked recipient
            | models.Q(
                initiator_id=recipient_id, blocked_user_id=author_id
            )  # Recipient blocked author
        ).exists()
    )()
    return blocked_relation


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.channel_layer.group_add("chat_service", self.channel_name)
        logger.info(
            f"🔗 Connecté au groupe chat_service sur livechat-service (channel: {self.channel_name})"
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("chat_service", self.channel_name)
        logger.info("Déconnecté du groupe chat_service")

    async def chat_message(self, event):
        logger.info(f"ChatConsumer.chat_message received event: {event}")
        # Need to trim event's message size to 150 characters to avoid long messages
        message = event.get("message")
        if len(message) > 150:
            message = message[:150] + "..."
        event["message"] = message
        author_id = event.get("author")
        username = await get_username(author_id)
        profile_picture = await get_profile_picture(author_id)
        event["username"] = username
        event["profilePicture"] = profile_picture
        non_blocked_users = await get_non_blocked_users_id(author_id)

        for userid in non_blocked_users:
            await self.channel_layer.group_send(f"user_{userid}", event)
        logger.info(
            f"Message transmis aux active users depuis chat_service (General): {event}"
        )

    async def private_message(self, event):
        logger.info(f"ChatConsumer.private_message received event: {event}")

        author_id = event.get("author")
        username = await get_username(author_id)
        recipient = event.get("recipient")
        recipient_id = await get_id(recipient)
        profile_picture = await get_profile_picture(author_id)
        event["profilePicture"] = profile_picture

        if recipient_id is None:
            logger.info(f"No valid recipient id for recipient: {recipient}")
            event["type"] = "error_message"
            event["message"] = "Recipient does not exist"
            event["username"] = username
            await self.channel_layer.group_send(f"user_{author_id}", event)
            return

        event["recipient_id"] = recipient_id

        if str(author_id) == str(recipient_id):
            message = {
                "type": "error_message",
                "error": "You can't send a message to yourself.",
            }
            await self.channel_layer.group_send(f"user_{author_id}", message)
            return

        if await is_blocked(author_id, recipient_id):
            message = {
                "type": "error_message",
                "error": "You cannot send a message to this user.",
            }
            await self.channel_layer.group_send(f"user_{author_id}", message)
            return

        event["username"] = username

        message = event.get("message")
        if len(message) > 150:
            message = message[:150] + "..."
        event["message"] = message

        await self.channel_layer.group_send(f"user_{recipient_id}", event)
        await self.channel_layer.group_send(f"user_{author_id}", event)
        logger.info(
            f"Message transmitted to groups user_{recipient_id} and user_{author_id}: {event}"
        )

    async def info_message(self, event):
        """Send a friend request or accept an existing one if initiated by the other user."""
        logger.info(f"ChatConsumer info message received event: {event}")

        action = event.get("action")
        author_id = event.get("author")
        recipient_id = event.get("recipient")
        author_username = await get_username(author_id)
        event["author_username"] = author_username
        recipient_username = await get_username(recipient_id)
        event["recipient_username"] = recipient_username

        if str(action) == "send_friend_request":
            if not author_id or not recipient_id:
                logger.warning("Author or recipient not provided")
                await self.channel_layer.group_send(
                    f"user_{author_id}",
                    {
                        "type": "error_message",
                        "error": "Author or recipient not provided",
                    },
                )
                return

            if str(author_id) == str(recipient_id):
                logger.warning("You can't send a friend request to yourself")
                await self.channel_layer.group_send(
                    f"user_{author_id}",
                    {
                        "type": "error_message",
                        "error": "You can't send a friend request to yourself",
                    },
                )
                return

            initiator = await database_sync_to_async(ManualUser.objects.get)(
                id=author_id
            )
            recipient_user = await database_sync_to_async(ManualUser.objects.get)(
                id=recipient_id
            )

            if initiator.id > recipient_user.id:
                user, friend = recipient_user, initiator
            else:
                user, friend = initiator, recipient_user

            if await is_blocked(author_id, recipient_id):
                message = {
                    "type": "error_message",
                    "error": "You cannot send a friend request to this user.",
                }
                await self.channel_layer.group_send(f"user_{author_id}", message)
                return

            qs = ManualFriendsRelations.objects.filter(user=user, friend=friend)
            if await database_sync_to_async(qs.exists)():
                relation = await database_sync_to_async(qs.first)()
                if relation.status == "pending":
                    initiator_id = await database_sync_to_async(
                        lambda: relation.initiator.id
                    )()
                    if str(initiator_id) != str(author_id):
                        relation.status = "accepted"
                        await database_sync_to_async(relation.save)()
                        await self.channel_layer.group_send(
                            f"user_{recipient_id}",
                            {
                                "type": "info_message",
                                "info": f"You are now friend with {author_username}",
                            },
                        )
                        await self.channel_layer.group_send(
                            f"user_{author_id}",
                            {
                                "type": "info_message",
                                "info": f"You are now friend with {recipient_username}",
                            },
                        )
                        await self.channel_layer.group_send(
                            f"user_{recipient_id}", event
                        )
                        await self.channel_layer.group_send(f"user_{author_id}", event)
                        logger.info(
                            f"Friend request accepted between {author_id} and {recipient_id} : {event}"
                        )
                    else:
                        await self.channel_layer.group_send(
                            f"user_{author_id}",
                            {
                                "type": "error_message",
                                "error": "Friend request already sent",
                            },
                        )
                    return
                if relation.status == "accepted":
                    await self.channel_layer.group_send(
                        f"user_{author_id}",
                        {"type": "error_message", "error": "You are already friends"},
                    )
                    return

            await database_sync_to_async(ManualFriendsRelations.objects.create)(
                user=user, friend=friend, status="pending", initiator=initiator
            )
            await self.channel_layer.group_send(
                f"user_{author_id}",
                {
                    "type": "info_message",
                    "info": f"Friend request sent to {recipient_username}",
                },
            )
            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {
                    "type": "info_message",
                    "info": f"Friend request received from {author_username}",
                },
            )
            await self.channel_layer.group_send(f"user_{recipient_id}", event)
            await self.channel_layer.group_send(f"user_{author_id}", event)
            logger.info(
                f"Friend request sent from {author_id} to {recipient_id} : {event}"
            )

        elif str(action) in ["reject_friend_request", "remove_friend"]:
            initiator = await database_sync_to_async(ManualUser.objects.get)(
                id=author_id
            )
            recipient_user = await database_sync_to_async(ManualUser.objects.get)(
                id=recipient_id
            )
            author_username = await get_username(author_id)
            event["author_username"] = author_username
            recipient_username = await get_username(recipient_id)
            event["recipient_username"] = recipient_username

            if initiator.id > recipient_user.id:
                user, friend = recipient_user, initiator
            else:
                user, friend = initiator, recipient_user

            qs = ManualFriendsRelations.objects.filter(user=user, friend=friend)
            if await database_sync_to_async(qs.exists)():
                relation = await database_sync_to_async(qs.first)()
                if relation.status == "pending":
                    await database_sync_to_async(relation.delete)()
                    await self.channel_layer.group_send(
                        f"user_{recipient_id}",
                        {
                            "type": "info_message",
                            "info": f"{author_username} rejected your friend request.",
                        },
                    )
                    await self.channel_layer.group_send(
                        f"user_{author_id}",
                        {
                            "type": "info_message",
                            "info": f"Friend request from {recipient_username} rejected.",
                        },
                    )
                    await self.channel_layer.group_send(f"user_{recipient_id}", event)
                    await self.channel_layer.group_send(f"user_{author_id}", event)
                elif relation.status == "accepted":
                    await database_sync_to_async(relation.delete)()
                    await self.channel_layer.group_send(
                        f"user_{recipient_id}",
                        {
                            "type": "info_message",
                            "info": f"{author_username} removed you from friends.",
                        },
                    )
                    await self.channel_layer.group_send(
                        f"user_{author_id}",
                        {
                            "type": "info_message",
                            "info": f"You removed {recipient_username} from friends.",
                        },
                    )
                    await self.channel_layer.group_send(f"user_{recipient_id}", event)
                    await self.channel_layer.group_send(f"user_{author_id}", event)
                else:
                    logger.info(f"Invalid action: {action}")

            else:
                await self.channel_layer.group_send(
                    f"user_{author_id}",
                    {"type": "error_message", "error": "No friend relationship found."},
                )
            return
        elif str(action) == "back_tournament_invite":
            initiator = await database_sync_to_async(ManualUser.objects.get)(
                id=author_id
            )
            recipient_user = await database_sync_to_async(ManualUser.objects.get)(
                id=recipient_id
            )
            author_username = await get_username(author_id)
            event["author_username"] = author_username
            recipient_username = await get_username(recipient_id)
            event["recipient_username"] = recipient_username

            @database_sync_to_async
            def get_initiator_tournament(initiator):
                return ManualTournament.objects.filter(
                    organizer=initiator, status="upcoming"
                ).first()

            initiator_tournament = await get_initiator_tournament(initiator)
            if not initiator_tournament:
                logger.warning(
                    f"No active tournament found for initiator {initiator.username}"
                )
                await self.channel_layer.group_send(
                    f"user_{author_id}",
                    {
                        "type": "error_message",
                        "error": "No active tournament upcoming found.",
                    },
                )
                return

            @database_sync_to_async
            def get_participants(tournament):
                return list(tournament.participants.select_related("user").all())

            participants = await get_participants(initiator_tournament)

            for participant in participants:
                if (
                    participant.user.id != recipient_id
                    and participant.user.id != author_id
                ):
                    await self.channel_layer.group_send(
                        f"user_{participant.user.id}",
                        {
                            "type": "info_message",
                            "info": f"{author_username} invited {recipient_username} to the tournament.",
                        },
                    )
                    await self.channel_layer.group_send(
                        f"user_{participant.user.id}",
                        {
                            "type": "info_message",
                            "action": "updatePlayerList",
                            "tournament_id": initiator_tournament.id,
                            "player": recipient_username,
                        },
                    )

            await self.channel_layer.group_send(
                f"user_{author_id}",
                {
                    "type": "info_message",
                    "action": "updatePlayerList",
                    "tournament_id": initiator_tournament.id,
                    "player": recipient_username,
                },
            )

            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {"type": "info_message", "action": "tournament_invite"},
            )
            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {
                    "type": "info_message",
                    "info": f"You have been invited to a tournament by {author_username}",
                },
            )

        elif str(action) == "back_join_tournament":
            recipient_user = await database_sync_to_async(ManualUser.objects.get)(
                id=recipient_id
            )
            recipient_username = await get_username(recipient_id)
            tournament_id = event.get("tournament_id")
            event["recipient_username"] = recipient_username
            tournament = await database_sync_to_async(ManualTournament.objects.get)(
                id=tournament_id
            )

            @database_sync_to_async
            def get_participants(tournament):
                return list(tournament.participants.select_related("user").all())

            participants = await get_participants(tournament)

            for participant in participants:
                if str(participant.user.id) != recipient_id:
                    await self.channel_layer.group_send(
                        f"user_{participant.user.id}",
                        {
                            "type": "info_message",
                            "info": f"{recipient_username} has joined the tournament.",
                        },
                    )
                    await self.channel_layer.group_send(
                        f"user_{participant.user.id}",
                        {
                            "type": "info_message",
                            "action": "updatePlayerList",
                            "tournament_id": tournament.id,
                            "player": recipient_username,
                        },
                    )

            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {"type": "info_message", "action": "tournament_invite"},
            )
            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {"type": "info_message", "info": "You have joined the tournament."},
            )

        elif str(action) == "back_reject_tournament":
            logger.info("Rejecting tournament invite")
            recipient_user = await database_sync_to_async(ManualUser.objects.get)(
                id=recipient_id
            )
            recipient_username = await get_username(recipient_id)
            tournament_id = event.get("tournament_id")
            event["recipient_username"] = recipient_username

            tournament = await database_sync_to_async(ManualTournament.objects.get)(
                id=tournament_id
            )

            @database_sync_to_async
            def get_participants(tournament):
                return list(tournament.participants.select_related("user").all())

            participants = await get_participants(tournament)

            for participant in participants:
                if participant.user.id != int(recipient_id):
                    logger.info(f"Sending reject message to {participant.user.id}")
                    await self.channel_layer.group_send(
                        f"user_{participant.user.id}",
                        {
                            "type": "info_message",
                            "action": "updatePlayerList",
                            "tournament_id": tournament.id,
                            "player": recipient_username,
                        },
                    )

            await self.channel_layer.group_send(
                f"user_{tournament.organizer_id}",
                {
                    "type": "info_message",
                    "info": f"{recipient_username} refused your tournament invite.",
                },
            )
            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {"type": "info_message", "info": "You refused the tournament invite."},
            )
            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {
                    "type": "info_message",
                    "action": "You refused the tournament invite.",
                },
            )

        elif str(action) == "back_cancel_tournament_invite":
            logger.info("cancelling tournament invite")
            recipient_user = await database_sync_to_async(ManualUser.objects.get)(
                id=recipient_id
            )
            recipient_username = await get_username(recipient_id)
            tournament_id = event.get("tournament_id")
            event["recipient_username"] = recipient_username

            tournament = await database_sync_to_async(ManualTournament.objects.get)(
                id=tournament_id
            )

            @database_sync_to_async
            def get_participants(tournament):
                return list(tournament.participants.select_related("user").all())

            participants = await get_participants(tournament)

            for participant in participants:
                if participant.user.id != int(recipient_id):
                    await self.channel_layer.group_send(
                        f"user_{participant.user.id}",
                        {
                            "type": "info_message",
                            "info": f"invite of {recipient_username} has been cancelled.",
                        },
                    )
                    await self.channel_layer.group_send(
                        f"user_{participant.user.id}",
                        {
                            "type": "info_message",
                            "action": "updatePlayerList",
                            "tournament_id": tournament.id,
                            "player": recipient_username,
                        },
                    )

            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {
                    "type": "info_message",
                    "action": "Your invite has been cancelled",
                },
            )
            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {"type": "info_message", "info": "Your invite has been cancelled."},
            )

        elif str(action) == "back_kick_tournament":
            recipient_user = await database_sync_to_async(ManualUser.objects.get)(
                id=recipient_id
            )
            recipient_username = await get_username(recipient_id)
            tournament_id = event.get("tournament_id")
            event["recipient_username"] = recipient_username

            tournament = await database_sync_to_async(ManualTournament.objects.get)(
                id=tournament_id
            )

            @database_sync_to_async
            def get_participants(tournament):
                return list(tournament.participants.select_related("user").all())

            participants = await get_participants(tournament)

            for participant in participants:
                if participant.user.id != int(recipient_id):
                    await self.channel_layer.group_send(
                        f"user_{participant.user.id}",
                        {
                            "type": "info_message",
                            "info": f"{recipient_username} has been kicked.",
                        },
                    )
                    await self.channel_layer.group_send(
                        f"user_{participant.user.id}",
                        {
                            "type": "info_message",
                            "action": "updatePlayerList",
                            "tournament_id": tournament.id,
                            "player": recipient_username,
                        },
                    )

            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {
                    "type": "info_message",
                    "action": "leavingLobby",
                    "tournament_id": tournament_id,
                    "player": recipient_username,
                },
            )
            await self.channel_layer.group_send(
                f"user_{recipient_id}",
                {"type": "info_message", "info": "You have been kicked."},
            )

        elif str(action) == "back_cancel_tournament":
            logger.info("Cancelling tournament", event)
            author_id = event.get("author")
            participant_list = event.get("participant_list")
            tournament_id = event.get("tournament_id")

            for participant in participant_list:
                participant_username = await get_username(participant)
                await self.channel_layer.group_send(
                    f"user_{participant}",
                    {
                        "type": "info_message",
                        "action": "leavingLobby",
                        "tournament_id": tournament_id,
                        "player": participant_username,
                    },
                )
                await self.channel_layer.group_send(
                    f"user_{participant}",
                    {"type": "info_message", "info": "Tournament has been cancelled."},
                )

        elif str(action) == "back_tournament_game_over":
            logger.info("tournament game over", event)
            tournament_id = event.get("tournament_id")
            participant_list = event.get("participant_list")
            next_match_player_ids = event.get("next_match_player_ids")
            current_match_player_ids = event.get("current_match_player_ids")

            for participant in participant_list:
                logger.info(f"Sending refresh brackets to participant {participant}")
                await self.channel_layer.group_send(
                    f"user_{participant}",
                    {
                        "type": "info_message",
                        "action": "refresh_brackets",
                        "tournament_id": tournament_id,
                    },
                )

            for next_match_player_id in next_match_player_ids:
                logger.info(f"Sending next match ready to {next_match_player_id}")
                await self.channel_layer.group_send(
                    f"user_{next_match_player_id}",
                    {"type": "info_message", "action": "next_match_ready"},
                )
                await self.channel_layer.group_send(
                    f"user_{next_match_player_id}",
                    {"type": "info_message", "info": "Your next game is ready."},
                )

            for current_match_player_id in current_match_player_ids:
                logger.info(f"gameover ready to {current_match_player_id}")
                await self.channel_layer.group_send(
                    f"user_{current_match_player_id}",
                    {"type": "info_message", "action": "gameover"},
                )

        elif str(action) == "back_leave_tournament":
            author_id = event.get("author")
            initiator_user = await database_sync_to_async(ManualUser.objects.get)(
                id=author_id
            )
            initiator_username = initiator_user.username
            initiator_id = initiator_user.id
            tournament_id = event.get("tournament_id")
            event["initiator_username"] = initiator_username

            tournament = await database_sync_to_async(ManualTournament.objects.get)(
                id=tournament_id
            )

            @database_sync_to_async
            def get_participants(tournament):
                return list(tournament.participants.select_related("user").all())

            participants = await get_participants(tournament)

            for participant in participants:
                if participant.user.id != int(initiator_id):
                    await self.channel_layer.group_send(
                        f"user_{participant.user.id}",
                        {
                            "type": "info_message",
                            "info": f"{initiator_username} has left the lobby.",
                        },
                    )
                    await self.channel_layer.group_send(
                        f"user_{participant.user.id}",
                        {
                            "type": "info_message",
                            "action": "updatePlayerList",
                            "tournament_id": tournament.id,
                            "player": initiator_username,
                        },
                    )

            await self.channel_layer.group_send(
                f"user_{initiator_id}",
                {"type": "info_message", "info": "You have left the lobby."},
            )
            await self.channel_layer.group_send(
                f"user_{initiator_id}",
                {
                    "type": "info_message",
                    "action": "leavingLobby",
                    "tournament_id": tournament.id,
                    "player": initiator_username,
                },
            )

        elif str(action) == "block_user":
            author_id = event.get("author")
            recipient_id = event.get("recipient")
            try:
                author_user = await database_sync_to_async(ManualUser.objects.get)(
                    id=author_id
                )
                recipient_user = await database_sync_to_async(ManualUser.objects.get)(
                    id=recipient_id
                )

                if author_user.id > recipient_user.id:
                    user, friend = recipient_user, author_user
                else:
                    user, friend = author_user, recipient_user

                # Check if a block already exists in either direction
                qs = ManualBlockedRelations.objects.filter(
                    models.Q(user=user, blocked_user=friend)
                    | models.Q(user=friend, blocked_user=user)
                )

                if await database_sync_to_async(qs.exists)():
                    relation = await database_sync_to_async(qs.first)()
                    initiator_id = await database_sync_to_async(
                        lambda: relation.initiator_id
                    )()

                    if str(initiator_id) != str(author_id):
                        await self.channel_layer.group_send(
                            f"user_{author_id}",
                            {
                                "type": "info_message",
                                "info": f"You have already been blocked by {recipient_user.username}.",
                            },
                        )
                    else:
                        await self.channel_layer.group_send(
                            f"user_{author_id}",
                            {
                                "type": "info_message",
                                "info": f"You have already blocked {recipient_user.username}.",
                            },
                        )

                else:
                    await database_sync_to_async(ManualBlockedRelations.objects.create)(
                        user=author_user,
                        blocked_user=recipient_user,
                        initiator_id=author_user.id,
                    )
                    await self.channel_layer.group_send(
                        f"user_{author_id}",
                        {
                            "type": "info_message",
                            "info": f"You have blocked {recipient_user.username}.",
                        },
                    )

                # Remove friendship if it exists (both directions)
                await database_sync_to_async(
                    lambda: ManualFriendsRelations.objects.filter(
                        models.Q(user=author_user, friend=recipient_user)
                        | models.Q(user=recipient_user, friend=author_user)
                    ).delete()
                )()
            except ManualUser.DoesNotExist:
                await self.channel_layer.group_send(
                    f"user_{author_user.id}",
                    {"type": "error_message", "error": "No user has been found."},
                )

        elif str(action) == "unblock_user":
            author_id = event.get("author")
            recipient_id = event.get("recipient")

            try:
                author_user = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
                recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)
                # Check if the author has blocked the recipient (using initiator_id)
                qs = ManualBlockedRelations.objects.filter(
                    initiator_id=author_id, blocked_user=recipient_id
                )
                if await database_sync_to_async(qs.exists)():
                    # If the block exists and the author is the initiator, delete the block
                    await database_sync_to_async(qs.delete)()

                    await self.channel_layer.group_send(
                        f"user_{author_id}",
                        {
                            "type": "info_message",
                            "info": f"You have unblocked {recipient_user.username}.",
                        },
                    )
                else:
                    # If no block exists or the recipient initiated the block, inform the user
                    await self.channel_layer.group_send(
                        f"user_{author_id}",
                        {
                            "type": "error_message",
                            "error": f"You cannot unblock {recipient_user.username}.",
                        },
                    )
            except ManualUser.DoesNotExist:
                await self.channel_layer.group_send(
                    f"user_{author_id}",
                    {"type": "error_message", "error": "User not found."},
                )
                
        elif str(action) == "private_game_invite":
            logger.info(f"Private game invite received: {event}")
            recipient_id = event.get("recipient")
            author_id = event.get("author")

            if str(recipient_id) == str(author_id):
                await self.channel_layer.group_send(
                    f"user_{author_id}",
                    {
                        "type": "error_message",
                        "error": f"Cannot send private game invite to yourself.",
                    },
                )
                return;

            if await is_blocked(author_id, recipient_id):
                message = {
                    "type": "error_message",
                    "error": "You cannot send a private game invite to this user.",
                }
                await self.channel_layer.group_send(f"user_{author_id}", message)
                return
            
            author_user = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
            recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)
            
            initiator = author_user
            recipient = recipient_user

            if author_user.id > recipient_user.id:
                user, recipient = recipient_user, author_user
            else:
                user, recipient = author_user, recipient_user

            # Check if a private game invite already exists in either direction
            qs = ManualPrivateGames.objects.filter(
                models.Q(initiator=user, recipient=recipient)
                | models.Q(initiator=recipient, recipient=user)
            )

            if await database_sync_to_async(qs.exists)():
                relation = await database_sync_to_async(qs.first)()
                existing_initiator  = await database_sync_to_async(
                    lambda: relation.initiator_id
                )()

                if str(existing_initiator) != str(author_id):
                    await self.channel_layer.group_send(
                        f"user_{author_id}",
                        {
                            "type": "info_message",
                            "info": f"Private game invite already sent to {recipient_user.username}.",
                        },
                    )
                    return

                else:
                    await self.channel_layer.group_send(
                        f"user_{author_id}",
                        {
                            "type": "info_message",
                            "info": f"Private game invite already received from {recipient_user.username}.",
                        },
                    )
                    return
            else:
                await database_sync_to_async(ManualPrivateGames.objects.create)(initiator=initiator, user=user, recipient=recipient, status="pending")

            await self.channel_layer.group_send(
                f"user_{author_id}",
                {
                    "type": "info_message",
                    "info": f"Private game invite sent to {recipient_id}",
                },
            )
            await self.channel_layer.group_send(f"user_{recipient_id}", event)
            await self.channel_layer.group_send(f"user_{recipient_id}", {"type": "info_message", "info": f"Private game invite received from {author_id}",},)
            logger.info(f"Invite private game sent to user_{recipient_id}")

        elif str(action) == "accept_private_game_invite":
            logger.info(f"Accepting private game invite: {event}")
            recipient_id = event.get("recipient")
            author_id = event.get("author")

            author_user = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
            recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)

            qs = ManualPrivateGames.objects.filter(
                models.Q(user=author_id, recipient_id=recipient_id)
                | models.Q(user=recipient_id, recipient_id=author_id)
            )

            if await database_sync_to_async(qs.exists)():
                relation = await database_sync_to_async(qs.first)()
                if relation.status == "pending":
                    await database_sync_to_async(relation.delete)()

                await self.channel_layer.group_send(f"user_{author_id}",{"type": "info_message","info": f"Private game invite accepted by {recipient_id}",},)
                await self.channel_layer.group_send(f"user_{author_id}", event)
                await self.channel_layer.group_send(f"user_{recipient_id}",{"type": "info_message","info": f"Private game invite accepted by {author_id}",},)
                await self.channel_layer.group_send(f"user_{recipient_id}", {"type": "info_message", "action": "updateAndCompareInfoData"})
            else:
                await self.channel_layer.group_send(f"user_{author_id}",{"type": "error_message","error": "No pending private game invite found.",},)
        
        elif str(action) == "refuse_private_game_invite":
            logger.info(f"Accepting private game invite: {event}")
            recipient_id = event.get("recipient")
            author_id = event.get("author")

            # Has to be pending
            author_user = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
            recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)

            qs = ManualPrivateGames.objects.filter(
                models.Q(user=author_id, recipient_id=recipient_id)
                | models.Q(user=recipient_id, recipient_id=author_id)
            )

            if await database_sync_to_async(qs.exists)():
                relation = await database_sync_to_async(qs.first)()
                if relation.status == "pending":
                    await database_sync_to_async(relation.delete)()
                await self.channel_layer.group_send(f"user_{author_id}",{"type": "info_message","info": f"Private game invite rejected by {recipient_id}",},)
                await self.channel_layer.group_send(f"user_{author_id}", event)
                await self.channel_layer.group_send(f"user_{recipient_id}",{"type": "info_message","info": f"Private game invite rejected by {author_id}",},)
                await self.channel_layer.group_send(f"user_{recipient_id}", {"type": "info_message", "action": "updateAndCompareInfoData"})
            else:
                await self.channel_layer.group_send(f"user_{author_id}",{"type": "error_message","error": "No pending private game invite found.",},)

        else:
            logger.warning(f"Unknown action: {action}")
