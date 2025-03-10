import { messageHandlers } from '/src/services/wsHandlers.js';
import { pushInfo,getInfo, deleteInfo} from '/src/services/infoStorage.js';

export let ws = null;
let isWsConnected = false;

export async function initializeWebSocket(userId) {
	if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING || isWsConnected)) {
		return;
	} else {
		closeWebSocket();
	}

	const wsUrl = `wss://${window.location.host}/wss/gateway/`;
	console.log('Connexion WebSocket à :', wsUrl);
	ws = new WebSocket(wsUrl);

	ws.onopen = async () => {
		console.log('WebSocket connecté !');
		isWsConnected = true;
		const username = (await getInfo('username')).success ? (await getInfo('username')).value : null;
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

		const handler = messageHandlers[data.type];
		if (handler) {
			await handler(data);
		} else {
			console.warn('Unhandled message type:', data.type);
		}
	};

	ws.onerror = (error) => {
		console.error('Erreur WebSocket :', error);
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
