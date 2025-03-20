import { gameManager } from '/src/pongGame/gameManager.js';
import { leaveMatchmaking } from '/src/components/pong/play/multiplayerContent.js';

export async function startPrivateGame(gameId, side, data, roomCode) {
	const gameConfig = {
		mode: 'private',
		gameId: gameId,
		side: side,
		user_id: data.user_id,
		opponent_id: data.opponent_id,
	};
	console.log('gameId', gameId);
	gameManager.startGame(gameConfig);
}

export async function startMatchmakingGame(gameId, side, data) {
	leaveMatchmaking();
	const gameConfig = {
		mode: 'matchmaking',
		gameId: gameId,
		side: side,
		user_id: data.user_id,
		opponent_id: data.opponent_id,
	};
	gameManager.startGame(gameConfig);
}
