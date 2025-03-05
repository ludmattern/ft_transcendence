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

	const handleLogout = () => {
		console.warn('Déconnexion détectée via WebSocket Heartbeat');
		logoutUser();
	};

	const handleGameState = (data) => {
		gameManager.handleGameUpdate(data);
	};

	const handleGameOver = (data) => {
		if (data.game_id.startsWith('tournLocal_')) {
			handleLocalTournamentGameEnding(data);
		} else if (data.game_id.startsWith('tournOnline_')) {
			emit('updateBracket');
		}
		gameManager.handleGameUpdate(data);
	};

	const handleErrorMessage = (data) => {
		if (data.error) {
			createNotificationMessage(data.error, 2500, true);
		} else {
			handleIncomingMessage(data);
		}
	};

	const handleChatOrPrivateMessage = (data) => {
		handleIncomingMessage(data);
	};

	const handlePrivateMatchFound = (data) => {
		startPrivateGame(data.game_id, data.side, data, data.roomCode);
	};

	const handleMatchFound = (data) => {
		startMatchmakingGame(data.game_id, data.side, data);
	};

	const handleInfoMessage = async (data) => {
		if (data.action === 'updatePlayerList') {
			const tournamentData = await getCurrentTournamentInformation();
			emit('updatePlayerList', tournamentData);
			await updateAndCompareInfoData();
		} else if (data.action === 'leavingLobby' || (data.info && data.action === 'You have been kicked.')) {
			emit('leavingLobby');
		} else if (data.action) {
			await updateAndCompareInfoData();
		} else {
			createNotificationMessage(data.info);
		}
	};

	const handleTournamentMessage = async (data) => {
		if (data.action === 'back_create_online_tournament') {
			emit('updateBracket');
		} else if (data.action === 'create_tournament_lobby') {
			handleRoute('/pong/play/tournament-creation');
			componentManagers['Pong'].replaceComponent('#content-window-container', tournamentCreation);
			const tournamentData = await getCurrentTournamentInformation();
			updateOnlinePlayersUI(tournamentData);
		}
	};

	const messageHandlers = {
		logout: handleLogout,
		game_state: handleGameState,
		game_over: handleGameOver,
		error_message: handleErrorMessage,
		chat_message: handleChatOrPrivateMessage,
		private_message: handleChatOrPrivateMessage,
		private_match_found: handlePrivateMatchFound,
		match_found: handleMatchFound,
		info_message: handleInfoMessage,
		tournament_message: handleTournamentMessage,
	};

	ws.onmessage = async (event) => {
		const data = JSON.parse(event.data);
		console.log('Message complet reçu :', data);

		const handler = messageHandlers[data.type];
		if (handler) {
			await handler(data);
		} else {
			console.warn('Unhandled message type:', data.type);
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
