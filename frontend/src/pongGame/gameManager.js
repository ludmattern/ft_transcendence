import { switchwindow } from "/src/3d/animation.js";
import { buildGameScene } from "/src/3d/pongScene.js";
import Store from "/src/3d/store.js";
import { ws } from "/src/services/socketManager.js";

class GameManager {
  constructor() {
    this.activeGame = null;

    this.localKeydownHandler = (e) => {
      if (e.key === "w") {
        ws.send(JSON.stringify({type: "game_event",action: "move",direction: "up",player_id: 1,game_id: this.gameId,}));
      } else if (e.key === "s") {
        ws.send(JSON.stringify({type: "game_event",action: "move",direction: "down",player_id: 1,game_id: this.gameId,}));
      } else if (e.key === "ArrowUp") {
        ws.send(JSON.stringify({type: "game_event",action: "move",direction: "up",player_id: 2, game_id: this.gameId,}));
      } else if (e.key === "ArrowDown") {
        ws.send(JSON.stringify({type: "game_event",action: "move",direction: "down",player_id: 2,game_id: this.gameId,}));
      }
    };

    this.matchMakingKeydownHandler = (e) => {
      if (!this.activeGame) return;
      const playerId = (this.activeGame.side === "left") ? 1 : 2;

      if (e.key === "w") {
        ws.send(JSON.stringify({type: "game_event",action: "move",direction: "up", player_id: playerId,game_id: this.gameId,
        }));
      } else if (e.key === "s") {
        ws.send(JSON.stringify({type: "game_event",action: "move",direction: "down", player_id: playerId,game_id: this.gameId,}));
      }
    };
  }

  startGame(gameConfig) {
    console.log("Starting game with config:", gameConfig);

    if (this.activeGame) 
      this.endGame();

    this.activeGame = gameConfig;
    this.gameId = this.generateGameId(gameConfig);

    buildGameScene(gameConfig);
    switchwindow("game");

    if (gameConfig.mode === "local") 
      document.addEventListener("keydown", this.localKeydownHandler);
    else 
      document.addEventListener("keydown", this.matchMakingKeydownHandler);
    

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
    } else {
      document.removeEventListener("keydown", this.matchMakingKeydownHandler);
    }

    ws.send(JSON.stringify({
      type: "game_event",
      action: "leave_game",
      game_id: this.gameId,
    }));

    this.activeGame = null;
    this.gameId = null;
  }


  updateGameState(gameState) {
    console.log("Updating game state:", gameState);
    if (gameState.ball) {
      const { x, y } = gameState.ball;
      if (Store.meshBall) {
        Store.meshBall.position.set(x, y, 0);
      }
    }

    if (gameState.players) {
      const p1 = gameState.players["1"];
      if (p1 && Store.player1Paddle) {
        Store.player1Paddle.position.set(p1.x, p1.y, 0);
      }
      const p2 = gameState.players["2"];
      if (p2 && Store.player2Paddle) {
        Store.player2Paddle.position.set(p2.x, p2.y, 0);
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
