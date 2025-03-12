import { messageHandlers } from '/src/services/wsHandlers.js';
import { getInfo } from '/src/services/infoStorage.js';

export let ws = null;
let isWsConnected = false;

export async function initializeWebSocket(userId) {
	if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING || isWsConnected)) {
		return;
	} else {
		closeWebSocket();
	}

	const wsUrl = `wss://${window.location.host}/wss/gateway/`;
	ws = new WebSocket(wsUrl);

	ws.onopen = async () => {
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
		const handler = messageHandlers[data.type];
		if (handler) {
			await handler(data);
		}
	};

	ws.onerror = (error) => {
		isWsConnected = false;
	};

	ws.onclose = () => {
		isWsConnected = false;
		ws = null;
	};
}

export function closeWebSocket() {
	if (ws) {
		ws.close();
		ws = null;
		isWsConnected = false;
	}
}
