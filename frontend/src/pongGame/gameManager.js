import { switchwindow } from "/src/3d/animation.js";
import { buildGameScene } from "/src/3d/pongScene.js";
import Store from "/src/3d/store.js";
import { ws } from "/src/services/socketManager.js";
import {endGameScreen, showCountdown } from "/src/components/midScreen.js";
import * as THREE from "https://esm.sh/three";
import componentManagers from "/src/index.js";

class GameManager {
  constructor() {
    this.activeGame = null;
    this.activeKeys = {}; // 🔹 Stocke les touches enfoncées
    this.moveInterval = null; // 🔹 Intervalle pour envoyer les requêtes

    this.localKeydownHandler = (e) => {
      this.activeKeys[e.key] = true;
      this.startMovement("local");
    };

    this.localKeyupHandler = (e) => {
      delete this.activeKeys[e.key];
      if (Object.keys(this.activeKeys).length === 0) {
        this.stopMovement();
      }
    };

    this.matchMakingKeydownHandler = (e) => {
      if (!this.activeGame) return;
      this.activeKeys[e.key] = true;
      this.startMovement("matchmaking");
    };

    this.matchMakingKeyupHandler = (e) => {
      delete this.activeKeys[e.key];
      if (Object.keys(this.activeKeys).length === 0) {
        this.stopMovement();
      }
    };
  }

  startMovement(mode) {
    if (this.moveInterval) return; 

    this.moveInterval = setInterval(() => {

      if (mode === "local") 
      {
        if (this.activeKeys["w"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "down", player_id: 1, game_id: this.gameId }));
        }
        if (this.activeKeys["s"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "up", player_id: 1, game_id: this.gameId }));
        }
        if (this.activeKeys["a"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "left", player_id: 1, game_id: this.gameId }));
        }
        if (this.activeKeys["d"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "right", player_id: 1, game_id: this.gameId }));
        }

        if (this.activeKeys["ArrowUp"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "down", player_id: 2, game_id: this.gameId }));
        }
        if (this.activeKeys["ArrowDown"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "up", player_id: 2, game_id: this.gameId }));
        }
        if (this.activeKeys["ArrowRight"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "left", player_id: 2, game_id: this.gameId }));
        }
        if (this.activeKeys["ArrowLeft"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "right", player_id: 2, game_id: this.gameId }));
        }

      } else if (mode === "matchmaking") {
        const playerId = (this.activeGame.side === "left") ? 1 : 2;

        if (this.activeKeys["w"] || this.activeKeys["ArrowUp"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "down", player_id: playerId, game_id: this.gameId }));
        }
        if (this.activeKeys["s"] || this.activeKeys["ArrowDown"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "up", player_id: playerId, game_id: this.gameId }));
        }
        if( playerId == 1)
        {
          if (this.activeKeys["a"] || this.activeKeys["ArrowLeft"]) {
            ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "left", player_id: playerId, game_id: this.gameId }));
          }
          if (this.activeKeys["d"] || this.activeKeys["ArrowRight"]) {
            ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "right", player_id: playerId, game_id: this.gameId }));
          }
        }
        else
        {
          if (this.activeKeys["d"] || this.activeKeys["ArrowRight"]) {
            ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "left", player_id: playerId, game_id: this.gameId }));
          }
          if (this.activeKeys["a"] || this.activeKeys["ArrowLeft"]) {
            ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "right", player_id: playerId, game_id: this.gameId }));
          }
        }
      }
    }, 40);
}


  stopMovement() {
    clearInterval(this.moveInterval);
    this.moveInterval = null;
  }

  startGame(gameConfig) {
    console.log("Starting game with config:", gameConfig);
    componentManagers['HUD'].unloadComponent('pongTuto');

    if (this.activeGame) this.endGame();

    this.activeGame = gameConfig;
    this.gameId = this.generateGameId(gameConfig);

    buildGameScene(gameConfig);
    showCountdown();

    if (gameConfig.mode === "local") {
      document.addEventListener("keydown", this.localKeydownHandler);
      document.addEventListener("keyup", this.localKeyupHandler);
    } else {
      document.addEventListener("keydown", this.matchMakingKeydownHandler);
      document.addEventListener("keyup", this.matchMakingKeyupHandler);
    }
    const player1 = gameConfig.side === "left" ? gameConfig.user_id : gameConfig.opponent_id;
    const player2 = gameConfig.side === "right" ? gameConfig.user_id : gameConfig.opponent_id;

    console.log(`🟢 Sending start_game event: player1=${player1}, player2=${player2}`);    ws.send(JSON.stringify({
      type: "game_event",
      action: "start_game",
      game_id: this.gameId,
      mode: gameConfig.mode,
      player1: player1,
      player2: player2
    }));
  }

  endGame() {
    console.log("Ending current game...");
    endGameScreen();
    if (!this.activeGame) {
      return;
    }

    if (this.activeGame.mode === "local") {
      document.removeEventListener("keydown", this.localKeydownHandler);
      document.removeEventListener("keyup", this.localKeyupHandler);
    } else {
      document.removeEventListener("keydown", this.matchMakingKeydownHandler);
      document.removeEventListener("keyup", this.matchMakingKeyupHandler);
    }

    this.stopMovement();

    ws.send(JSON.stringify({
      type: "game_event",
      action: "leave_game",
      game_id: this.gameId,
    }));

    this.activeGame = null;
    this.gameId = null;
  }


  updateGameState(gameState) {
    if (gameState.ball) {
      const { x, y, z } = gameState.ball; 
      if (Store.meshBall) {
        Store.meshBall.position.set(x, y, z);
      }
    }
    const lerpFactorPaddle = 0.2;
    if (gameState.players) {
      const p1 = gameState.players["1"];
      if (p1 && Store.player1Paddle) {
        if (!Store.p1Target) Store.p1Target = new THREE.Vector3();
        Store.p1Target.set(p1.x, p1.y, p1.z);
        Store.player1Paddle.position.lerp(Store.p1Target, lerpFactorPaddle);

      }
      const p2 = gameState.players["2"];
      if (p2 && Store.player2Paddle) {
        if (!Store.p2Target) Store.p2Target = new THREE.Vector3();
        Store.p2Target.set(p2.x, p2.y, p2.z);
        Store.player2Paddle.position.lerp(Store.p2Target, lerpFactorPaddle);

      }
    }
    if (!gameState || !gameState.user_scores) return;

    const players = Object.keys(gameState.user_scores);
    const scores = Object.values(gameState.user_scores);

    if (players.length >= 2) {
        const player1 = players[0]; 
        const player2 = players[1]; 

        const score1 = scores[0]; 
        const score2 = scores[1]; 

        const scoreTextEl = document.getElementById("scoreText");
        if (scoreTextEl) {
            scoreTextEl.textContent = `${player1} ${score1}  -  ${score2} ${player2}`;
        }
    }
  }
  

  handleGameUpdate(data) {
    if (data.type === "game_state") {
      this.updateGameState(data.payload);
    } else if (data.type === "game_over") {
      console.log("Game over! Winner is player:", data.winner);
      console.log("Final scores:", data.final_scores);
      this.endGame();
      switchwindow("home");
    }
  }

  generateGameId(gameConfig) {
    if (!gameConfig.gameId) {
      if (gameConfig.mode === "private") {
        return `private_${Date.now()}`;
      }
      if (gameConfig.mode === "matchmaking") {
        return `matchmaking_${Date.now()}`;
      }
      return `game_${Date.now()}`;
    }
    return gameConfig.gameId;
  }
}

export const gameManager = new GameManager();
