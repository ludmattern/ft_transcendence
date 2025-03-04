export let ws = null;
let isWsConnected = false;
import { gameManager } from '/src/pongGame/gameManager.js';
import { handleIncomingMessage } from '/src/components/hud/sideWindow/left/tabContent.js';
import { handleRoute, getCurrentTournamentInformation } from '/src/services/router.js';
import { startMatchmakingGame, startPrivateGame } from '/src/services/multiplayerPong.js';
import { createNotificationMessage, updateAndCompareInfoData } from '/src/components/hud/sideWindow/left/notifications.js';
import { handleLocalTournamentGameEnding } from '/src/services/tournamentHandler.js';
import componentManagers from '/src/index.js';
import { tournamentCreation } from '/src/components/pong/play/tournamentCreation.js';
import { emit } from '/src/services/eventEmitter.js';
import { updateOnlinePlayersUI } from '/src/components/pong/play/onlineTournamentCreation.js';

export async function initializeWebSocket(userId) {
	if (ws) {
		if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING || isWsConnected == true) {
			return;
		} else {
			closeWebSocket();
		}
	}

	let wsUrl = `wss://${window.location.host}/ws/gateway/`;
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
		console.log('Message complet reçu :', data);
		if (data.type === 'logout') {
			console.warn('Déconnexion détectée via WebSocket Heartbeat');
			logoutUser();
		} else if (data.type === 'game_state' || data.type === 'game_over') {
			if (data.type === 'game_over' && data.game_id.startsWith('tournLocal_')) {
				handleLocalTournamentGameEnding(data);
			} else if (data.type === 'game_over' && data.game_id.startsWith('tournOnline_')) {
				emit('updateBracket');
			}
			gameManager.handleGameUpdate(data);
		} else if (data.type === 'error_message') {
			if (data.error) {
				createNotificationMessage(data.error, 2500, true);
			} else {
				handleIncomingMessage(data);
			}
		} else if (data.type === 'chat_message' || data.type === 'private_message') {
			handleIncomingMessage(data);
		} else if (data.type === 'private_match_found') {
			startPrivateGame(data.game_id, data.side, data, data.roomCode);
		} else if (data.type === 'match_found') {
			startMatchmakingGame(data.game_id, data.side, data);
		} else if (data.type === 'info_message') {
			if (data.action && data.action === 'updatePlayerList') {
				const tournamentData = await getCurrentTournamentInformation();
				emit('updatePlayerList', tournamentData);
				await updateAndCompareInfoData();
			} else if (data.action && data.action === 'leavingLobby') {
				emit('leavingLobby');
			} else if (data.info && data.action === "You have been kicked.") {
				emit('leavingLobby');
			} else if (data.action) {
				await updateAndCompareInfoData();
			} else {
				createNotificationMessage(data.info);
			}
		} else if (data.type === 'tournament_message') {
			if (data.action === 'back_create_online_tournament') {
				emit('updateBracket');
			} else if (data.action === 'create_tournament_lobby') {
				handleRoute('/pong/play/tournament-creation');
				componentManagers['Pong'].replaceComponent('#content-window-container', tournamentCreation);
				const data = await getCurrentTournamentInformation();
				updateOnlinePlayersUI(data);
			}
		}
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
