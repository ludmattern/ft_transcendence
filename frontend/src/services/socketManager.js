export let ws = null;
let isWsConnected = false;
import { gameManager } from '/src/pongGame/gameManager.js';
import { handleIncomingMessage } from '/src/components/hud/sideWindow/left/tabContent.js';
import { startMatchmakingGame, startPrivateGame } from '/src/services/multiplayerPong.js';
import { createNotificationMessage, updateAndCompareInfoData } from '/src/components/hud/sideWindow/left/notifications.js';
import { handleLocalTournamentGameEnding } from '/src/services/tournamentHandler.js';

export async function initializeWebSocket(userId) {
	if (ws) {
		if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING || isWsConnected == true) {
			return;
		} else {
			closeWebSocket();
		}
	}

	const tournamentSerialKey = await fetch(`/api/tournament-service/getTournamentSerialKey/${encodeURIComponent(userId)}/`)
		.then(response => response.json())
		.then(data => data.serial_key)
		.catch(error => {
			console.error('Error fetching tournament serial key:', error);
		});

	let wsUrl = `wss://${window.location.host}/ws/gateway/`;
	console.log('Tournament serial key:', tournamentSerialKey);

	if (tournamentSerialKey) {
		wsUrl += `?serial_key=${encodeURIComponent(tournamentSerialKey)}`;
	}

	console.log('Connexion WebSocket à :', wsUrl);

	ws = new WebSocket(wsUrl);

	ws.onopen = () => {
		console.log(' WebSocket connecté !');
		isWsConnected = true;
		const userId = sessionStorage.getItem('userId');
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

		if (data.type === 'game_state' || data.type === 'game_over') {
			if (data.type === 'game_over' && data.game_id.startsWith('tournLocal_')) {
				handleLocalTournamentGameEnding(data);
			}
			gameManager.handleGameUpdate(data);
			return;
		} else if (data.type === 'error_message') {
			if (data.error) {
				createNotificationMessage(data.error, 2500, true);
			} else {
				handleIncomingMessage(data);
			}
		} else if (data.type === 'chat_message' || data.type === 'private_message') {
			handleIncomingMessage(data);
		} else if (data.type === 'private_match_found') {
			console.log('Private match found:', data);
			startPrivateGame(data.game_id, data.side, data, data.roomCode);
		} else if (data.type === 'match_found') {
			startMatchmakingGame(data.game_id, data.side, data);
		} else if (data.type === 'info_message') {
			if (data.action) {
				await updateAndCompareInfoData();
			} else {
				createNotificationMessage(data.info);
			}
		} else if (data.type === 'tournament_lobby_created') {
			console.log("Lobby créé :", data.tournamentLobbyId);
			handleRoute('/pong/play/tournament-creation');
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
		console.log(' Fermeture manuelle du WebSocket...');
		ws.close();
		ws = null;
		isWsConnected = false;
	}
}
