import json
import random
import string
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import ManualTournament, ManualUser, ManualTournamentParticipants, TournamentMatch
import logging
from cryptography.fernet import Fernet
from django.conf import settings
import math

logger = logging.getLogger(__name__)

cipher = Fernet(settings.FERNET_KEY)


def encrypt_thing(args):
    """Encrypts the args."""
    return cipher.encrypt(args.encode('utf-8')).decode('utf-8')


class TournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "tournament"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info(f"🔗 Connecté au groupe 'local_tournament' (channel={self.channel_name})")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        logger.info(f"🔌 Déconnecté du groupe 'local_tournament' (channel={self.channel_name})")


    async def create_local_tournament(self, data):
        organizer_id = data.get("organizer_id")
        players = data.get("players", [])

        if not organizer_id:
            await self.send(json.dumps({"error": "Organizer ID is required"}))
            logger.error("Organizer ID is missing in the request data.")
            return

        if len(players) not in [4, 8, 16]:
            await self.send(json.dumps({"error": "Invalid tournament size"}))
            logger.error(f"Invalid tournament size: {len(players)} players provided. Expected 4, 8 ou 16.")
            return
        
        try:
            organizer = await sync_to_async(ManualUser.objects.get)(id=organizer_id)
            if organizer.in_tournament:
                error_msg = f"L'utilisateur {organizer.id} est déjà dans un tournoi actif."
                logger.warning(error_msg)
                await self.send(json.dumps({"error": error_msg}))
                return
        except ManualUser.DoesNotExist:
            await self.send(json.dumps({"error": "Organizer not found"}))
            return


        #TODO ici  c est pour le local faudra changer le fonctionement pour le online
        # to next TODO 
        serial_key = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
        logger.info(f"🔑 Génération de serial_key: {serial_key}")
        
        tournament = await sync_to_async(ManualTournament.objects.create)(
            serial_key=serial_key,
            name="Local Tournament",
            organizer_id=organizer_id,
            rounds=len(players) // 2, 
            status="ongoing",
            mode="local"
        )
        logger.info(f"🏆 Tournament créé: ID={tournament.id}, serial_key={serial_key}, organizer_id={organizer_id}")

        for username in players:
            user, created = await sync_to_async(ManualUser.objects.get_or_create)(
                username=username,
                defaults={
                    "email": encrypt_thing(f"{username.lower()}@local.fake"),
                    "password": "fakepassword",
                    "is_dummy": True
                }
            )
            if created:
                logger.info(f"👤 Utilisateur créé: username={user.username}")
            else:
                logger.info(f"👤 Utilisateur récupéré: username={user.username}")
            user.in_tournament = True
            await sync_to_async(user.save)()
            participant = await sync_to_async(ManualTournamentParticipants.objects.create)(
                tournament=tournament,
                user=user,
                status="accepted"
            )
            logger.info(f"✅ Participant ajouté: TournamentID={tournament.id}, User={user.username}, status=accepted")
            
        # TODO
        
        
        n = len(players)
        rounds_count = int(math.log2(n))  

        for i in range(0, n, 2):
            match_order = (i // 2) + 1
            player1 = players[i]
            player2 = players[i+1]
            await sync_to_async(TournamentMatch.objects.create)(
                tournament=tournament,
                round_number=1,
                match_order=match_order,
                player1=player1,
                player2=player2,
                status="pending"
            )
            logger.info(f"🏅 Round 1, Match {match_order} créé: {player1} vs {player2}")

        previous_matches = n // 2
        for round_number in range(2, rounds_count + 1):
            num_matches = previous_matches // 2
            for match_order in range(1, num_matches + 1):
                await sync_to_async(TournamentMatch.objects.create)(
                    tournament=tournament,
                    round_number=round_number,
                    match_order=match_order,
                    player1="TBD",
                    player2="TBD",
                    status="pending"
                )
                logger.info(f"🏅 Round {round_number}, Match {match_order} créé: TBD vs TBD")
            previous_matches = num_matches

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "tournament_created",
                "serial_key": serial_key,
                "players": players
            }
        )

    async def tournament_created(self, event):
        #TODO notif 
        #ici app systeme de notif pour prevenir les joueurs que le tournois a commencer 
        logger.info(f" Notif a tout les client ")
