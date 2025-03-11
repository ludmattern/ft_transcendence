import { gameManager } from '/src/pongGame/gameManager.js';
import { ws } from '/src/services/websocket.js';

export async function gameModeSelector(config) {
	if (config.gameMode === 'local') {
		const gameConfig = {
			mode: 'local',
		};

		gameManager.startGame(gameConfig);
	} else if (config.gameMode === 'solo') {
		const gameConfig = {
			mode: 'solo',
			side: 'left',
		};
		gameManager.startGame(gameConfig);
	} else if (config.gameMode === 'matchmaking') {
		ws.send(
			JSON.stringify({
				type: 'matchmaking',
				action: 'join',
			})
		);
	} else if (config.gameMode === 'private') {
		if (config.action === 'create') {
			ws.send(
				JSON.stringify({
					type: 'private_event',
					action: 'join',
					room_code: config.matchkey,
				})
			);
		} else if (config.action === 'join') {
			ws.send(
				JSON.stringify({
					type: 'private_event',
					action: 'join',
					subaction: 'accept',
					room_code: config.matchkey,
				})
			);
		}
	} else if (config.gameMode === 'local-tournament') {
		const gameConfig = {
			mode: 'local',
			subMode: 'local-tournament',
			player1: config.player1,
			player2: config.player2,
			tournament_id: config.tournament_id,
		};
		gameManager.startGame(gameConfig);
	}
}

export async function cancelMode(config) {
	if (config.gameMode === 'matchmaking') {
		ws.send(
			JSON.stringify({
				type: 'matchmaking',
				action: 'leave',
			})
		);
	} else if (config.gameMode === 'private') {
		ws.send(
			JSON.stringify({
				type: 'private_event',
				action: 'leave',
				room_code: config.matchkey,
			})
		);
	}
}
