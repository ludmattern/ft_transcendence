export let ws = null;
let isWsConnected = false;
import { gameManager } from '/src/pongGame/gameManager.js';
import { handleIncomingMessage } from '/src/components/hud/sideWindow/left/tabContent.js';
import { handleRoute } from '/src/services/router.js';
import { startMatchmakingGame, startPrivateGame } from '/src/services/multiplayerPong.js';
import { createNotificationMessage, updateAndCompareInfoData } from '/src/components/hud/sideWindow/left/notifications.js';
import { handleLocalTournamentGameEnding } from '/src/services/tournamentHandler.js';
import componentManagers from '/src/index.js';
import { tournamentCreation } from '/src/components/pong/play/tournamentCreation.js';
import { updateOnlinePlayersUI } from '/src/components/pong/play/tournamentCreation.js';
import { fetchTournamentParticipants } from '/src/components/pong/play/tournamentCreation.js'

export async function initializeWebSocket(userId) {
	if (ws) {
		if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING || isWsConnected == true) {
			return;
		} else {
			closeWebSocket();
		}
	}

	// const tournamentSerialKey = await fetch(`/api/tournament-service/getTournamentSerialKey/${encodeURIComponent(userId)}/`)
	// 	.then((response) => response.json())
	// 	.then((data) => data.serial_key)
	// 	.catch((error) => {
	// 		console.error('Error fetching tournament serial key:', error);
	// 	});

	// console.log('Tournament serial key:', tournamentSerialKey);
	
	let wsUrl = `wss://${window.location.host}/ws/gateway/`;
	
	// if (tournamentSerialKey) {
	// 	wsUrl += `?serial_key=${encodeURIComponent(tournamentSerialKey)}`;
	// }

	console.log('Connexion WebSocket à :', wsUrl);

	ws = new WebSocket(wsUrl);

	ws.onopen = () => {
		console.log(' WebSocket connecté !');
		isWsConnected = true;
		const username = sessionStorage.getItem('username');

		const initPayload = {
			type: 'init',
			userId: userId,
			username: username,
			timestamp: new Date().toISOString(),
		};
		ws.send(JSON.stringify(initPayload));
	};

	ws.onmessage = async (event) => {
		const data = JSON.parse(event.data);
		console.log('Message reçu :', data);

		if (data.type === 'logout') {
			console.warn('Déconnexion détectée via WebSocket Heartbeat');
			logoutUser();
		} else if (data.type === 'game_state' || data.type === 'game_over') {
			if (data.type === 'game_over' && data.game_id.startsWith('tournLocal_')) {
				handleLocalTournamentGameEnding(data);
			}
			gameManager.handleGameUpdate(data);
		} else if (data.type === 'error_message') {
			if (data.error) {
				createNotificationMessage(data.error, 2500, true);
			} else {
				handleIncomingMessage(data);
			}
		} else if (data.type === 'chat_message' || data.type === 'private_message') {
			console.log("this is data ;" , data)
			handleIncomingMessage(data);
		} else if (data.type === 'private_match_found') {
			console.log('Private match found:', data);
			startPrivateGame(data.game_id, data.side, data, data.roomCode);
		} else if (data.type === 'match_found') {
			startMatchmakingGame(data.game_id, data.side, data);
		} else if (data.type === 'info_message') {
			if (data.action) {
				if (data.action === 'tournament_invite')
				{
					if(data.message === "Successfully invited.")
					{
						onlinePlayers.push({ name: inviteMessage, pending: true });
						fetchTournamentParticipants();
					}
				}
				await updateAndCompareInfoData();
			} else {
				createNotificationMessage(data.info);
			}
		} else if (data.type === 'tournament_message') {
			console.log('Message de tournoi reçu :', data);
			if (data.action === 'create_tournament_lobby') {
				console.log('Lobby créé :', data.tournamentLobbyId);
				handleRoute('/pong/play/tournament-creation');
				componentManagers['Pong'].replaceComponent('#content-window-container', tournamentCreation);
				fetchTournamentParticipants(data.tournamentLobbyId);
			}
		}
		console.log('Message complet reçu :', data);
	};

	ws.onerror = (error) => {
		console.error(' Erreur WebSocket :', error);
		isWsConnected = false;
	};

	ws.onclose = () => {
		console.log('WebSocket fermé.');
		isWsConnected = false;
		ws = null;
	};
}

export function closeWebSocket() {
	if (ws) {
		console.log('Fermeture manuelle du WebSocket...');
		ws.close();
		ws = null;
		isWsConnected = false;
	}
}
