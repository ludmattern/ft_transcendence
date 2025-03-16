import { buildGameScene } from '/src/3d/pongScene.js';
import Store from '/src/3d/store.js';
import { ws } from '/src/services/websocket.js';
import { endGameScreen, showCountdown } from '/src/components/midScreen.js';
import * as THREE from 'https://esm.sh/three';
import componentManagers from '/src/index.js';
import { handleRoute, getPreviousPongPlaySubRoute } from '/src/services/router.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { emit } from '/src/services/eventEmitter.js';
import { triggerBallColorChange, triggerPaddleColorChange} from '/src/3d/pongScene.js';
import { getUsername } from '/src/services/auth.js';


class GameManager {
	constructor()  {
		this.gameMode = null;
		this.activeGame = null;
		this.activeKeys = {};
		this.moveInterval = null;
		this.username1 = null;
		this.username2 = null;
		this.localKeydownHandler = (e) => {
			this.activeKeys[e.key] = true;
			this.startMovement('local');
		};
		this.clientId = null;
		this.clientName = null;
		this.localKeyupHandler = (e) => {
			delete this.activeKeys[e.key];
			if (Object.keys(this.activeKeys).length === 0) {
				this.stopMovement();
			}
		};
		this.matchMakingKeydownHandler = (e) => {
			if (!this.activeGame) return;
			this.activeKeys[e.key] = true;
			this.startMovement('matchmaking');
		};
		this.matchMakingKeyupHandler = (e) => {
			delete this.activeKeys[e.key];
			if (Object.keys(this.activeKeys).length === 0) {
				this.stopMovement();
			}
		};
	}
	async initClientData() {
		this.clientId = await getUserIdFromCookieAPI();
		this.clientName = await getUsername(this.clientId);
	}
	startMovement(mode) {
		if (this.moveInterval) return;
	
		const movementMapping = {
			'w': { direction: 'down', player: 1 },
			's': { direction: 'up', player: 1 },
			'a': { direction: 'left', player: 1 },
			'd': { direction: 'right', player: 1 },
			'ArrowUp': { direction: 'down', player: 2 },
			'ArrowDown': { direction: 'up', player: 2 },
			'ArrowLeft': { direction: 'right', player: 2 },
			'ArrowRight': { direction: 'left', player: 2 },
		};
	
		this.moveInterval = setInterval(() => {
			if (mode === 'local') {
				Object.keys(movementMapping).forEach((key) => {
					if (this.activeKeys[key]) {
						const { direction, player } = movementMapping[key];
						ws.send(JSON.stringify({ type: 'game_event', action: 'move', direction, local_player: player }));
					}
				});
			} else {
				const playerId = this.activeGame.side === 'left' ? 1 : 2;
	
				const movementKeys = {
					up: ['s', 'ArrowDown'],
					down: ['w', 'ArrowUp'],
					left: playerId === 1 ? ['a', 'ArrowLeft'] : ['d', 'ArrowRight'],
					right: playerId === 1 ? ['d', 'ArrowRight'] : ['a', 'ArrowLeft'],
				};
	
				Object.entries(movementKeys).forEach(([direction, keys]) => {
					if (keys.some((key) => this.activeKeys[key])) {
						ws.send(JSON.stringify({ type: 'game_event', action: 'move', direction }));
					}
				});
			}
		}, 40);
	}
	

	stopMovement() {
		clearInterval(this.moveInterval);
		this.moveInterval = null;
	}

	isGameActive() {
		return this.activeGame !== null;
	}

	startGame(gameConfig) {
		this.initClientData() 
		
		console.log('Starting game with config:', gameConfig);
		componentManagers['HUD'].unloadComponent('pongTuto');
		this.gameMode = gameConfig.mode;
		console.log('gameMode:', this.gameMode);
		if (this.activeGame) 
			this.endGame();
		
		this.activeGame = gameConfig;
		this.gameId = this.generateGameId(gameConfig);
		
		buildGameScene(gameConfig);
		emit('gameStarted', gameConfig);
		showCountdown();
		const scoreTextEl = document.getElementById('scoreText');
		scoreTextEl.style.display = 'block';

		let player1 = gameConfig.side === 'left' ? gameConfig.user_id : gameConfig.opponent_id;
		let player2 = gameConfig.side === 'right' ? gameConfig.user_id : gameConfig.opponent_id;
		console.log('player1:', player1, 'player2:', player2);

		if (gameConfig.mode === 'local') {
			document.addEventListener('keydown', this.localKeydownHandler);
			document.addEventListener('keyup', this.localKeyupHandler);
			this.username1 = 'Player Right';
			this.username2 = ' Player Left';
			if (gameConfig.subMode === 'local-tournament') {
				this.username1 = gameConfig.player1;
				this.username2 = gameConfig.player2;
			}
		} 
		else if (gameConfig.mode === 'solo') {
			document.addEventListener('keydown', this.matchMakingKeydownHandler);
			document.addEventListener('keyup', this.matchMakingKeyupHandler);
		}
		else {
			document.addEventListener('keydown', this.matchMakingKeydownHandler);
			document.addEventListener('keyup', this.matchMakingKeyupHandler);
			Promise.all([getUsername(player1), getUsername(player2)])
				.then(([player1Name, player2Name]) => {
					this.username1 = player1Name;
					this.username2 = player2Name;
				})
				.catch((error) => {
					console.error('Error retrieving usernames:', error);
					this.username1 = player1;
					this.username2 = player2;
				});
		}
		if (gameConfig.subMode === 'local-tournament') {
			player1 = gameConfig.player1;
			player2 = gameConfig.player2;
		}
		console.log("difficulity:", gameConfig.difficulty);
		console.log(` Sending start_game event: player1=${player1}, player2=${player2}, with game_id=${this.gameId}`);	
		ws.send(
			JSON.stringify({
				type: 'game_event',
				action: 'start_game',
				game_id: this.gameId,
				mode: gameConfig.mode,
				player1: player1,
				player2: player2,
				difficulty: gameConfig.difficulty,
			})
		);

	}

	endGame() {
		console.log('Ending current game...');
		endGameScreen();
		if (!this.activeGame) {
			return;
		}
		const scoreTextEl = document.getElementById('scoreText');
		scoreTextEl.style.display = 'none';

		if (this.activeGame.mode === 'local') {
			document.removeEventListener('keydown', this.localKeydownHandler);
			document.removeEventListener('keyup', this.localKeyupHandler);
		} else {
			document.removeEventListener('keydown', this.matchMakingKeydownHandler);
			document.removeEventListener('keyup', this.matchMakingKeyupHandler);
		}
		console.log('gameId on endin:', this.gameId);
		this.stopMovement();
		ws.send(
			JSON.stringify({
				type: 'game_event',
				action: 'leave_game',
			})
		);
		this.activeGame = null;
		this.gameId = null;
	}

	updateGameState(gameState) {
		if (gameState.ball) {
			const { x, y, z, vx } = gameState.ball;
			if (Store.meshBall)
			{
				Store.meshBall.position.set(x, y, z);
				Store.plaqueTop.position.set(x, 1.5 / 2 - 0.01, z);
				Store.plaqueBottom.position.set(x, -1.5 / 2 + 0.01, z);
				Store.plaqueLeft.position.set(x, y, 1.5 / 2 - 0.01);
				Store.plaqueRight.position.set(x, y, -1.5 / 2 + 0.01);
			}
		}
		if (gameState.ball_hit_paddle) {
			if (gameState.ball.vx < 0)
				triggerPaddleColorChange(Store.player2Paddle, new THREE.Color(0xff007f));
			else 
				triggerPaddleColorChange(Store.player1Paddle, new THREE.Color(0x7f00ff));
		}
		if (gameState.ball_hit_wall)
			triggerBallColorChange();

		if (gameState.players) {
			const p1 = gameState.players['1'];
			const p2 = gameState.players['2'];

			if (p1) {
				if (!Store.p1Target) Store.p1Target = new THREE.Vector3();
				Store.p1Target.set(p1.x, p1.y, p1.z);
			}
			if (p2) {
				if (!Store.p2Target) Store.p2Target = new THREE.Vector3();
				Store.p2Target.set(p2.x, p2.y, p2.z);
			}
		}
		if (!gameState || !gameState.user_scores) return;

		if (this.gameMode === 'local' || this.gameMode === 'solo'){
			const scores = Object.values(gameState.user_scores);
			const score1 = scores[0];
			const score2 = scores[1];
			const scoreTextEl = document.getElementById('scoreText');
			if (scoreTextEl && this.gameMode === 'local') 
				scoreTextEl.innerHTML = `${this.username1} ${score1}  -  ${score2} ${this.username2}`;
			else if (scoreTextEl && this.gameMode === 'solo')
				scoreTextEl.innerHTML = `<strong>You</strong> ${score1}  -  ${score2} Terminator`;

		} else {
			let oppennentName = null;
			const scores = gameState.user_scores;
			const clientScore = scores[this.clientId] ?? 0;
			const opponentId = Object.keys(scores).find(id => id !== this.clientId);
			const opponentScore = opponentId ? scores[opponentId] : 0;
			const scoreTextEl = document.getElementById('scoreText');
			
			if (this.username1 === this.clientName)
			{
				oppennentName = this.username2;
			}
			else
				oppennentName = this.username1;
			if (scoreTextEl) 
				scoreTextEl.innerHTML = `<strong>You</strong> ${clientScore}  -  ${opponentScore} ${oppennentName}`;
		}
	}

	handleGameUpdate(data) {
		if (data.type === 'game_state') {
			this.updateGameState(data.payload);
		} else if (data.type === 'game_over') {
			console.log('Game over! Winner is player:', data.winner);
			console.log('Final scores:', data.final_scores);
			this.endGame();
			if (Store.pongScene) Store.pongScene.clear();
			const previousPongPlaySubRoute = getPreviousPongPlaySubRoute();
			console.log(previousPongPlaySubRoute);
			emit('updateBracket');
			handleRoute(previousPongPlaySubRoute);
		}
	}

	generateGameId(gameConfig) {
		console.log('Generating game in:', gameConfig.mode);
		if (!gameConfig.gameId) {
			if (gameConfig.mode === 'private')
				return gameConfig.matchkey;
			if (gameConfig.mode === 'matchmaking')
				return `matchmaking_${Date.now()}`;
			if (gameConfig.mode === 'solo') 
				return `solo_${Date.now()}`;
			if (gameConfig.subMode === 'local-tournament') 
				return `tournLocal_${gameConfig.player1}_vs_tournLocal_${gameConfig.player2}_id_${gameConfig.tournament_id}`;	
			return `game_${Date.now()}`;
		}
		return gameConfig.gameId;
	}
}

export const gameManager = new GameManager();






