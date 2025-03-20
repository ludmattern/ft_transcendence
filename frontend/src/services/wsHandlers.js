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
import { playGame } from '/src/components/pong/play/utils.js';

const handleLogout = () => {
	handleRoute('/');
};

const handleGameState = (data) => {
	gameManager.handleGameUpdate(data);
};

const handleGameOver = async (data) => {
	emit('gameOver');
	if (data.game_id.startsWith('tournLocal_')) {
		await handleLocalTournamentGameEnding(data);
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
	} else if (data.action === 'tournament_invite' && data.subaction === 'join_tournament') {
		handleRoute('/pong/play/current-tournament');
		const tournamentData = await getCurrentTournamentInformation();
		emit('updatePlayerList', tournamentData);
	} else if (data.action === 'refresh_brackets') {
		emit('updateBracket');
	} else if (data.action === 'leavingLobby' || (data.info && data.action === 'You have been kicked.')) {
		emit('leavingLobby');
	} else if (data.action === 'accept_private_game_invite') {
		const config = {
			gameMode: 'private',
			action: 'join',
			matchkey: data.recipient,
			type: 'fullScreen',
		};
		playGame(config);
	} else if (data.action == 'startTournament') {
		handleRoute('/pong/play/current-tournament');
		emit('updateBracket');
	}
	if (data.action) {
		await updateAndCompareInfoData();
		emit('updateFriendsList');
	} else {
		createNotificationMessage(data.info);
	}
};

const handleTournamentMessage = async (data) => {
	if (data.action === 'create_tournament_lobby') {
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

export { messageHandlers };
