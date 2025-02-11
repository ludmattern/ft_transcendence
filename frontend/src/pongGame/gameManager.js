import { switchwindow } from "/src/3d/animation.js";
import { buildGameScene } from "/src/3d/pongScene.js";
import Store from "/src/3d/store.js";
import { ws } from "/src/services/socketManager.js";
import { showCountdown } from "/src/components/midScreen.js";

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
    if (this.moveInterval) return; // 🔄 Évite les doublons

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
        if (this.activeKeys["a"] || this.activeKeys["ArrowLeft"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "left", player_id: playerId, game_id: this.gameId }));
        }
        if (this.activeKeys["d"] || this.activeKeys["ArrowRight"]) {
          ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "right", player_id: playerId, game_id: this.gameId }));
        }
      }
    }, 50);
}


  stopMovement() {
    clearInterval(this.moveInterval);
    this.moveInterval = null;
  }

  startGame(gameConfig) {
    console.log("Starting game with config:", gameConfig);

    if (this.activeGame) this.endGame();

    this.activeGame = gameConfig;
    this.gameId = this.generateGameId(gameConfig);

    buildGameScene(gameConfig);
    switchwindow("game");
    setTimeout(() => {
      showCountdown();
    }, 2200);

    if (gameConfig.mode === "local") {
      document.addEventListener("keydown", this.localKeydownHandler);
      document.addEventListener("keyup", this.localKeyupHandler);
    } else {
      document.addEventListener("keydown", this.matchMakingKeydownHandler);
      document.addEventListener("keyup", this.matchMakingKeyupHandler);
    }

    ws.send(JSON.stringify({
      type: "game_event",
      action: "start_game",
      game_id: this.gameId,
      mode: gameConfig.mode,
    }));
  }

  endGame() {
    console.log("Ending current game...");

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
      const { x, y, z } = gameState.ball;  // 🔄 Ajout du z
      if (Store.meshBall) {
        Store.meshBall.position.set(x, y, z);  // 🔄 Applique la nouvelle position 3D
      }
    }
    
    if (gameState.players) {
      const p1 = gameState.players["1"];
      if (p1 && Store.player1Paddle) {
        Store.player1Paddle.position.set(p1.x, p1.y, p1.z);  // 🔄 Ajout de la dimension Z
      }
      const p2 = gameState.players["2"];
      if (p2 && Store.player2Paddle) {
        Store.player2Paddle.position.set(p2.x, p2.y, p2.z);  // 🔄 Ajout de la dimension Z
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
