import logging
from django.db import models, DatabaseError  # type: ignore
from channels.generic.websocket import AsyncWebsocketConsumer  # type: ignore
from channels.db import database_sync_to_async  # type: ignore
from .models import ManualUser, ManualFriendsRelations, ManualTournament, ManualBlockedRelations, ManualTournamentParticipants, ManualPrivateGames
from asgiref.sync import sync_to_async  # type: ignore

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_username(user_id):
    try:
        if not user_id:
            return None
        try:
            user_id = int(user_id)
        except ValueError:
            return None
        user = ManualUser.objects.get(pk=user_id)
        return user.username
    except ManualUser.DoesNotExist:
        return None


@database_sync_to_async
def get_id(user_username):
    try:
        user = ManualUser.objects.filter(username=user_username).first()
        if user:
            return user.id
        return None

    except DatabaseError as e:
        logger.exception(f"Database error in get_id for username '{user_username}': {e}")
        return None
    except Exception as e:
        logger.exception(f"Unexpected error in get_id for username '{user_username}': {e}")
        return None


@database_sync_to_async
def get_users_id():
    try:
        return list(ManualUser.objects.values_list("id", flat=True))
    except DatabaseError as e:
        logger.exception(f"Database error in get_users_id: {e}")
        return []
    except Exception as e:
        logger.exception(f"Unexpected error in get_users_id: {e}")
        return []


@database_sync_to_async
def get_accepted_participants(tournament_id):
    try:
        participants_qs = ManualTournamentParticipants.objects.filter(tournament_id=tournament_id, status="accepted").select_related("user")

        return [p.user.id for p in participants_qs]

    except DatabaseError as e:
        logger.exception(f"Database error in get_accepted_participants (tournament_id={tournament_id}): {e}")
        return []
    except Exception as e:
        logger.exception(f"Unexpected error in get_accepted_participants (tournament_id={tournament_id}): {e}")
        return []


async def get_profile_picture(user_id):
    try:
        user = await sync_to_async(ManualUser.objects.get)(id=user_id)
        return user.profile_picture.url
    except ManualUser.DoesNotExist:
        return "/media/profile_pics/default-profile-150.png"


async def get_non_blocked_users_id(author_id):
    try:
        users_blocked_by_author = await database_sync_to_async(lambda: list(ManualBlockedRelations.objects.filter(initiator_id=author_id).values_list("blocked_user_id", flat=True)))()
        users_who_blocked_author = await database_sync_to_async(lambda: list(ManualBlockedRelations.objects.filter(blocked_user_id=author_id).values_list("user_id", flat=True)))()
        blocked_set = set(users_blocked_by_author + users_who_blocked_author)
        all_users = await get_users_id()
        non_blocked_users = [user_id for user_id in all_users if user_id not in blocked_set and user_id != author_id]

        return non_blocked_users

    except Exception as e:
        logger.error(f"Failed to get non-blocked users for author_id={author_id}: {e}")
        return []


async def is_blocked(author_id, recipient_id):
    try:
        blocked_relation = await database_sync_to_async(lambda: ManualBlockedRelations.objects.filter(models.Q(initiator_id=author_id, blocked_user_id=recipient_id) | models.Q(initiator_id=recipient_id, blocked_user_id=author_id)).exists())()
        return blocked_relation

    except DatabaseError as e:
        logger.exception(f"Database error checking block status between {author_id} and {recipient_id}: {e}")
        return False
    except Exception as e:
        logger.exception(f"Unexpected error in is_blocked({author_id}, {recipient_id}): {e}")
        return False


async def safe_group_send(consumer, user_id, message):
    try:
        user_id = int(user_id)
        await consumer.channel_layer.group_send(f"user_{user_id}", message)
    except Exception as e:
        logger.exception("group_send failed to user_%s: %s", user_id, e)


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            await self.accept()
            await self.channel_layer.group_add("chat_service", self.channel_name)
        except Exception as e:
            logger.exception("Error during WebSocket connect: %s", e)
            await self.close()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard("chat_service", self.channel_name)
        except Exception as e:
            logger.exception("Error during WebSocket disconnect: %s", e)

    async def chat_message(self, event):
        try:
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
                try:
                    await self.channel_layer.group_send(f"user_{userid}", event)
                except Exception as e:
                    logger.exception(f"Failed to send chat message to user_{userid}: {e}")

        except Exception as e:
            logger.exception("Failed to handle chat_message: %s", e)

    async def private_message(self, event):
        try:
            author_id = event.get("author")
            username = await get_username(author_id)
            recipient = event.get("recipient")
            recipient_id = await get_id(recipient)
            profile_picture = await get_profile_picture(author_id)
            event["profilePicture"] = profile_picture

            if recipient_id is None:
                event["type"] = "error_message"
                event["message"] = "Recipient does not exist"
                event["username"] = username
                await self.channel_layer.group_send(f"user_{author_id}", event)
                return

            event["recipient_id"] = recipient_id

            if str(author_id) == str(recipient_id):
                message = {"type": "error_message", "error": "You can't send a message to yourself"}
                await self.channel_layer.group_send(f"user_{author_id}", message)
                return

            if await is_blocked(author_id, recipient_id):
                message = {"type": "error_message", "error": "You cannot send a message to this user"}
                await self.channel_layer.group_send(f"user_{author_id}", message)
                return

            event["username"] = username

            message = event.get("message")
            if len(message) > 150:
                message = message[:150] + "..."
            event["message"] = message

            await self.channel_layer.group_send(f"user_{recipient_id}", event)
            await self.channel_layer.group_send(f"user_{author_id}", event)

        except Exception as e:
            logger.exception("Failed to handle private_message: %s", e)
            try:
                error_event = {"type": "error_message", "error": "An error occurred while sending your message"}
                await self.channel_layer.group_send(f"user_{event.get('author')}", error_event)
            except Exception as inner_e:
                logger.exception("Also failed to send fallback error message: %s", inner_e)

    async def info_message(self, event):
        """Send a friend request or accept an existing one if initiated by the other user."""

        try:
            action = event.get("action")
            author_id = event.get("author")
            if author_id is not None:
                author_id = int(author_id)
                author_username = await get_username(author_id)
                event["author_username"] = author_username

            recipient_id = event.get("recipient")
            if recipient_id is not None:
                recipient_id = int(recipient_id)
                recipient_username = await get_username(recipient_id)
                event["recipient_username"] = recipient_username

            if str(action) == "send_friend_request":
                if not author_id or not recipient_id:
                    logger.warning("Author or recipient not provided")
                    await safe_group_send(self, author_id, {"type": "error_message", "error": "Author or recipient not provided"})
                    return

                if str(author_id) == str(recipient_id):
                    logger.warning("You can't send a friend request to yourself")
                    await safe_group_send(self, author_id, {"type": "error_message", "error": "You can't send a friend request to yourself"})
                    return

                initiator = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
                recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)

                if initiator.id > recipient_user.id:
                    user, friend = recipient_user, initiator
                else:
                    user, friend = initiator, recipient_user

                if await is_blocked(author_id, recipient_id):
                    message = {"type": "error_message", "error": "You cannot send a friend request to this user"}
                    await safe_group_send(self, author_id, message)
                    return

                qs = ManualFriendsRelations.objects.filter(user=user, friend=friend)
                if await database_sync_to_async(qs.exists)():
                    relation = await database_sync_to_async(qs.first)()
                    if relation.status == "pending":
                        initiator_id = await database_sync_to_async(lambda: relation.initiator.id)()
                        if str(initiator_id) != str(author_id):
                            relation.status = "accepted"
                            await database_sync_to_async(relation.save)()
                            await safe_group_send(self, recipient_id, {"type": "info_message", "info": f"You are now friend with {author_username}"})
                            await safe_group_send(self, author_id, {"type": "info_message", "info": f"You are now friend with {recipient_username}"})
                            await safe_group_send(self, recipient_id, event)
                            await safe_group_send(self, author_id, event)
                        else:
                            await safe_group_send(self, author_id, {"type": "error_message", "error": "Friend request already sent"})
                        return
                    if relation.status == "accepted":
                        await safe_group_send(self, author_id, {"type": "error_message", "error": "You are already friends"})
                        return

                await database_sync_to_async(ManualFriendsRelations.objects.create)(user=user, friend=friend, status="pending", initiator=initiator)
                await safe_group_send(self, author_id, {"type": "info_message", "info": f"Friend request sent to {recipient_username}"})
                await safe_group_send(self, recipient_id, {"type": "info_message", "info": f"Friend request received from {author_username}"})
                await safe_group_send(self, recipient_id, event)
                await safe_group_send(self, author_id, event)

            elif str(action) in ["reject_friend_request", "remove_friend"]:
                initiator = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
                recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)
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
                        await safe_group_send(self, recipient_id, {"type": "info_message", "info": f"{author_username} rejected your friend request"})
                        await safe_group_send(self, author_id, {"type": "info_message", "info": f"Friend request from {recipient_username} rejected"})
                        await safe_group_send(self, recipient_id, event)
                        await safe_group_send(self, author_id, event)
                    elif relation.status == "accepted":
                        await database_sync_to_async(relation.delete)()
                        await safe_group_send(self, recipient_id, {"type": "info_message", "info": f"{author_username} removed you from friends"})
                        await safe_group_send(self, author_id, {"type": "info_message", "info": f"You removed {recipient_username} from friends"})
                        await safe_group_send(self, recipient_id, event)
                        await safe_group_send(self, author_id, event)
                    else:
                        logger.info(f"Invalid action: {action}")

                else:
                    await safe_group_send(self, author_id, {"type": "error_message", "error": "No friend relationship found"})
                return

            elif str(action) == "back_tournament_invite":
                initiator = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
                recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)
                author_username = await get_username(author_id)
                event["author_username"] = author_username
                recipient_username = await get_username(recipient_id)
                event["recipient_username"] = recipient_username

                @database_sync_to_async
                def get_initiator_tournament(initiator):
                    return ManualTournament.objects.filter(organizer=initiator, status="upcoming").first()

                initiator_tournament = await get_initiator_tournament(initiator)
                if not initiator_tournament:
                    logger.warning(f"No active tournament found for initiator {initiator.username}")
                    await safe_group_send(self, author_id, {"type": "error_message", "error": "No active tournament upcoming found"})
                    return

                participants = await get_accepted_participants(initiator_tournament.id)

                for participant_id in participants:
                    if participant_id != recipient_id and participant_id != author_id:
                        await safe_group_send(self, participant_id, {"type": "info_message", "info": f"{author_username} invited {recipient_username} to the tournament"})
                        await safe_group_send(self, participant_id, {"type": "info_message", "action": "updatePlayerList", "tournament_id": initiator_tournament.id, "player": recipient_username})

                await safe_group_send(self, author_id, {"type": "info_message", "action": "updatePlayerList", "tournament_id": initiator_tournament.id, "player": recipient_username})

                await safe_group_send(self, recipient_id, {"type": "info_message", "action": "tournament_invite"})
                await safe_group_send(self, recipient_id, {"type": "info_message", "info": f"You have been invited to a tournament by {author_username}"})

            elif str(action) == "back_join_tournament":
                recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)
                recipient_username = await get_username(recipient_id)
                tournament_id = event.get("tournament_id")
                event["recipient_username"] = recipient_username
                tournament = await database_sync_to_async(ManualTournament.objects.get)(id=tournament_id)

                participants = await get_accepted_participants(tournament.id)

                for participant_id in participants:
                    if str(participant_id) != recipient_id:
                        await safe_group_send(self, participant_id, {"type": "info_message", "info": f"{recipient_username} has joined the tournament"})
                        await safe_group_send(self, participant_id, {"type": "info_message", "action": "updatePlayerList", "tournament_id": tournament.id, "player": recipient_username})

                await safe_group_send(self, recipient_id, {"type": "info_message", "action": "tournament_invite", "subaction": "join_tournament"})

                await safe_group_send(self, recipient_id, {"type": "info_message", "info": "You have joined the tournament"})

            elif str(action) == "back_reject_tournament":
                recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)
                recipient_username = await get_username(recipient_id)
                tournament_id = event.get("tournament_id")
                event["recipient_username"] = recipient_username

                tournament = await database_sync_to_async(ManualTournament.objects.get)(id=tournament_id)

                participants = await get_accepted_participants(tournament.id)

                for participant_id in participants:
                    if participant_id != int(recipient_id):
                        await safe_group_send(self, participant_id, {"type": "info_message", "action": "updatePlayerList", "tournament_id": tournament.id, "player": recipient_username})

                await safe_group_send(self, tournament.organizer_id, {"type": "info_message", "info": f"{recipient_username} refused your tournament invite"})
                await safe_group_send(self, recipient_id, {"type": "info_message", "info": "You refused the tournament invite"})
                await safe_group_send(self, recipient_id, {"type": "info_message", "action": "You refused the tournament invite"})

            elif str(action) == "back_cancel_tournament_invite":
                logger.info("Cancelling tournament invite")
                recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)
                recipient_username = await get_username(recipient_id)
                tournament_id = event.get("tournament_id")
                event["recipient_username"] = recipient_username

                tournament = await database_sync_to_async(ManualTournament.objects.get)(id=tournament_id)

                participants = await get_accepted_participants(tournament.id)

                for participant_id in participants:
                    if participant_id != int(recipient_id):
                        await safe_group_send(self, participant_id, {"type": "info_message", "info": f"invite of {recipient_username} has been cancelled"})
                        await safe_group_send(self, participant_id, {"type": "info_message", "action": "updatePlayerList", "tournament_id": tournament.id, "player": recipient_username})

                await safe_group_send(self, recipient_id, {"type": "info_message", "action": "Your invite has been cancelled"})
                await safe_group_send(self, recipient_id, {"type": "info_message", "info": "Your invite has been cancelled"})

            elif str(action) == "back_kick_tournament":
                recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)
                recipient_username = await get_username(recipient_id)
                tournament_id = event.get("tournament_id")
                event["recipient_username"] = recipient_username

                tournament = await database_sync_to_async(ManualTournament.objects.get)(id=tournament_id)

                participants = await get_accepted_participants(tournament.id)

                for participant_id in participants:
                    if participant_id != int(recipient_id):
                        await safe_group_send(self, participant_id, {"type": "info_message", "info": f"{recipient_username} has been kicked"})
                        await safe_group_send(self, participant_id, {"type": "info_message", "action": "updatePlayerList", "tournament_id": tournament.id, "player": recipient_username})

                await safe_group_send(self, recipient_id, {"type": "info_message", "action": "leavingLobby", "tournament_id": tournament_id, "player": recipient_username})
                await safe_group_send(self, recipient_id, {"type": "info_message", "info": "You have been kicked"})

            elif str(action) == "back_cancel_tournament":
                logger.info("Cancelling tournament", event)
                participant_list = event.get("participant_list")
                tournament_id = event.get("tournament_id")

                for participant in participant_list:
                    participant_username = await get_username(participant)
                    await safe_group_send(self, participant, {"type": "info_message", "action": "leavingLobby", "tournament_id": tournament_id, "player": participant_username})
                    await safe_group_send(self, participant, {"type": "info_message", "info": "Tournament has been cancelled"})

            elif str(action) == "back_tournament_game_over":
                logger.info("Tournament game over", event)
                tournament_id = event.get("tournament_id")
                participant_list = event.get("participant_list")
                next_match_player_ids = event.get("next_match_player_ids")
                current_match_player_ids = event.get("current_match_player_ids")

                logger.info(f"participant_list: {participant_list}")

                for user_id in participant_list:
                    await safe_group_send(self, user_id, {"type": "info_message", "action": "refresh_brackets", "tournament_id": tournament_id})

                for next_match_player_id in next_match_player_ids:
                    await safe_group_send(self, next_match_player_id, {"type": "info_message", "action": "next_match_ready"})
                    await safe_group_send(self, next_match_player_id, {"type": "info_message", "info": "Your next game is ready"})

                for current_match_player_id in current_match_player_ids:
                    await safe_group_send(self, current_match_player_id, {"type": "info_message", "action": "gameover"})

            elif str(action) == "back_leave_tournament":
                author_id = event.get("author")
                initiator_user = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
                initiator_username = initiator_user.username
                initiator_id = initiator_user.id
                tournament_id = event.get("tournament_id")
                event["initiator_username"] = initiator_username

                tournament = await database_sync_to_async(ManualTournament.objects.get)(id=tournament_id)

                participants = await get_accepted_participants(tournament.id)

                for participant_id in participants:
                    if participant_id != int(initiator_id):
                        await safe_group_send(self, participant_id, {"type": "info_message", "info": f"{initiator_username} has left the lobby"})
                        await safe_group_send(self, participant_id, {"type": "info_message", "action": "updatePlayerList", "tournament_id": tournament.id, "player": initiator_username})

                await safe_group_send(self, initiator_id, {"type": "info_message", "info": "You have left the lobby"})
                await safe_group_send(self, initiator_id, {"type": "info_message", "action": "leavingLobby", "tournament_id": tournament.id, "player": initiator_username})

            elif str(action) == "back_create_online_tournament":
                author_id = event.get("author")
                initiator_user = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
                initiator_username = initiator_user.username
                initiator_id = initiator_user.id
                participant_list = event.get("participant_list")
                event["initiator_username"] = initiator_username

                for participant_id in participant_list:
                    if participant_id != int(initiator_id):
                        await safe_group_send(self, participant_id, {"type": "info_message", "info": f"{initiator_username} has started the tournament"})
                        await safe_group_send(self, participant_id, {"type": "info_message", "action": "startTournament"})

                await safe_group_send(self, initiator_id, {"type": "info_message", "info": "You have started the tournament"})
                await safe_group_send(self, initiator_id, {"type": "info_message", "action": "startTournament"})

            elif str(action) == "block_user":
                try:
                    author_id = event.get("author")
                    recipient_id = event.get("recipient")
                    try:
                        author_id = int(author_id)
                        recipient_id = int(recipient_id)
                    except ValueError:
                        logger.warning("Invalid author or recipient id")
                        return
                    if author_id == recipient_id:
                        await safe_group_send(self, author_id, {"type": "error_message", "error": "You cannot block yourself"})
                        return
                    author_user = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
                    recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)

                    if author_user.id > recipient_user.id:
                        user, friend = recipient_user, author_user
                    else:
                        user, friend = author_user, recipient_user

                    qs = ManualBlockedRelations.objects.filter(models.Q(user=user, blocked_user=friend) | models.Q(user=friend, blocked_user=user))

                    if await database_sync_to_async(qs.exists)():
                        relation = await database_sync_to_async(qs.first)()
                        initiator_id = await database_sync_to_async(lambda: relation.initiator_id)()

                        if initiator_id != author_id:
                            await safe_group_send(self, author_id, {"type": "info_message", "info": f"You have already been blocked by {recipient_user.username}"})
                        else:
                            await safe_group_send(self, author_id, {"type": "info_message", "info": f"You have already blocked {recipient_user.username}"})

                    else:
                        await database_sync_to_async(ManualBlockedRelations.objects.create)(user=author_user, blocked_user=recipient_user, initiator_id=author_user.id)
                        await safe_group_send(self, author_id, {"type": "info_message", "info": f"You have blocked {recipient_user.username}"})

                    await database_sync_to_async(lambda: ManualFriendsRelations.objects.filter(models.Q(user=author_user, friend=recipient_user) | models.Q(user=recipient_user, friend=author_user)).delete())()

                except ManualUser.DoesNotExist:
                    await safe_group_send(self, author_user.id, {"type": "error_message", "error": "No user has been found"})
                except Exception as e:
                    logger.error(f"Error while unblocking user: {e}")

            elif str(action) == "unblock_user":
                try:
                    author_id = event.get("author")
                    recipient_id = event.get("recipient")
                    try:
                        author_id = int(author_id)
                        recipient_id = int(recipient_id)
                    except ValueError:
                        logger.warning("Invalid author or recipient id")
                        return
                    if author_id == recipient_id:
                        await safe_group_send(self, author_id, {"type": "error_message", "error": "You cannot unblock yourself"})
                        return

                    author_user = await database_sync_to_async(ManualUser.objects.get)(id=author_id)
                    recipient_user = await database_sync_to_async(ManualUser.objects.get)(id=recipient_id)
                    qs = ManualBlockedRelations.objects.filter(initiator_id=author_id, blocked_user=recipient_id)
                    if await database_sync_to_async(qs.exists)():
                        await database_sync_to_async(qs.delete)()

                        await safe_group_send(self, author_id, {"type": "info_message", "info": f"You have unblocked {recipient_user.username}"})
                    else:
                        await safe_group_send(self, author_id, {"type": "error_message", "error": f"You cannot unblock {recipient_user.username}"})
                except ManualUser.DoesNotExist:
                    await safe_group_send(self, author_id, {"type": "error_message", "error": "User not found"})
                except Exception as e:
                    logger.error(f"Error while unblocking user: {e}")

            elif str(action) == "private_game_invite":
                await private_game_invite(self, event)

            elif str(action) in ["accept_private_game_invite", "refuse_private_game_invite"]:
                await private_game_invite_action(self, event, action)

            else:
                logger.warning(f"Unknown action: {action}")

        except Exception as e:
            logger.exception("Unhandled error in info_message: %s", e)


async def private_game_invite(self, event):
    try:
        inviter_id = event.get("author")
        if not inviter_id:
            logger.warning("Author not provided")
            return
        invitee_id = event.get("recipient")
        if not invitee_id:
            logger.warning("Recipient not provided")
            return
        inviter_id = int(inviter_id)
        invitee_id = int(invitee_id)
    except ValueError:
        logger.warning("Invalid author or recipient id")
        return

    if inviter_id == invitee_id:
        await safe_group_send(self, inviter_id, {"type": "error_message", "error": "Cannot send private game invite to yourself"})
        return

    if await is_blocked(inviter_id, invitee_id):
        await safe_group_send(self, inviter_id, {"type": "error_message", "error": "You cannot send a private game invite to this user"})
        return

    try:
        inviter = await database_sync_to_async(ManualUser.objects.get)(id=inviter_id)
    except ManualUser.DoesNotExist:
        await safe_group_send(self, inviter_id, {"type": "error_message", "error": "Inviter not found"})
        return

    try:
        invitee = await database_sync_to_async(ManualUser.objects.get)(id=invitee_id)
    except ManualUser.DoesNotExist:
        await safe_group_send(self, inviter_id, {"type": "error_message", "error": "Invitee not found"})
        return

    sorted_users = sorted([inviter, invitee], key=lambda u: u.id)
    user, recipient = sorted_users[0], sorted_users[1]

    qs = ManualPrivateGames.objects.filter(user=user, recipient=recipient)
    if await database_sync_to_async(qs.exists)():
        existing_relation = await database_sync_to_async(qs.first)()
        if inviter.id == user.id:
            other_user = recipient
        else:
            other_user = user

        if existing_relation.initiator_id != inviter_id:
            await safe_group_send(self, inviter_id, {"type": "error_message", "error": f"Game invite already received from {other_user.username}"})
        else:
            await safe_group_send(self, inviter_id, {"type": "error_message", "error": f"Game invite already sent to {other_user.username}"})
        return

    await database_sync_to_async(ManualPrivateGames.objects.create)(initiator=inviter, user=user, recipient=recipient, status="pending")

    await safe_group_send(self, invitee_id, event)
    await safe_group_send(self, inviter_id, {"type": "info_message", "info": f"Game invite sent to {invitee.username}"})
    await safe_group_send(self, invitee_id, {"type": "info_message", "info": f"Game invite received from {inviter.username}"})


async def private_game_invite_action(self, event, action):
    actor_id = event.get("author")
    inviter_id = event.get("recipient")
    user_action = str(action)

    try:
        actor_user = await database_sync_to_async(ManualUser.objects.get)(id=actor_id)
    except ManualUser.DoesNotExist:
        await safe_group_send(self, actor_id, {"type": "error_message", "error": "Your user record was not found. Invitation cancelled"})
        return

    try:
        inviter_user = await database_sync_to_async(ManualUser.objects.get)(id=inviter_id)
    except ManualUser.DoesNotExist:
        await safe_group_send(self, actor_id, {"type": "error_message", "error": "Inviter not found. Invitation cancelled"})
        return

    sorted_users = sorted([actor_user, inviter_user], key=lambda u: u.id)
    user, recipient = sorted_users[0], sorted_users[1]
    invite = await database_sync_to_async(ManualPrivateGames.objects.filter(user=user, recipient=recipient).first)()
    if not invite:
        await safe_group_send(self, actor_id, {"type": "error_message", "error": "No pending game invite found"})
        return

    if invite.status == "pending":
        await database_sync_to_async(invite.delete)()

    if user_action == "accept_private_game_invite":
        message_inviter = f"Your game invite has been accepted by {actor_user.username}"
        message_actor = f"You accepted the game invite from {inviter_user.username}"
    else:  # refuse_private_game_invite
        message_inviter = f"Your game invite has been rejected by {actor_user.username}"
        message_actor = f"You rejected the game invite from {inviter_user.username}"

    await safe_group_send(self, inviter_id, {"type": "info_message", "info": message_inviter})
    await safe_group_send(self, actor_id, {"type": "info_message", "info": message_actor})
    await safe_group_send(self, actor_id, event)
    await safe_group_send(self, actor_id, {"type": "info_message", "action": "updateAndCompareInfoData"})
