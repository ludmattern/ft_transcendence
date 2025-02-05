import { switchwindow } from "/src/3d/animation.js";
import {buildGameScene} from "/src/3d/pongScene.js";
import Store  from "/src/3d/store.js";
import { ws } from "/src/services/socketManager.js"

class GameManager {
  constructor() {
    this.activeGame = null;
  }

  startGame(gameConfig) {
    console.log("Starting game with config:", gameConfig);

    if (this.activeGame) {
      this.endGame();
    }
    this.activeGame = gameConfig;
    buildGameScene(gameConfig);
    switchwindow("game");
    this.gameId = this.generateGameId(gameConfig);
    if (gameConfig.mode == "local")
      {
        document.addEventListener("keydown", (e) => {
  
          if (e.key === "w") {
            ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "up", player_id: 1  ,game_id: this.gameId }));
          } else if (e.key === "s") {
            ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "down", player_id: 1  ,game_id: this.gameId }));
          } else if (e.key === "ArrowUp") {
            ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "up", player_id: 2 ,game_id: this.gameId }));
          } else if (e.key === "ArrowDown") {
            ws.send(JSON.stringify({ type: "game_event", action: "move", direction: "down", player_id: 2 , game_id: this.gameId}));
          }
        });
      }
      else if (gameConfig.mode == "matchmaking" || gameConfig.mode == "private")
      {
        document.addEventListener("keydown", (e) => {
          const playerId = (gameConfig.side === "left") ? 1 : 2;
  
          if (e.key === "w") {
            ws.send(JSON.stringify({ type: "game_event", action: "move",direction: "up", player_id: playerId, game_id: this.gameId }));
          } else if (e.key === "s") {
            ws.send(JSON.stringify({ type: "game_event", action: "move",direction: "down", player_id: playerId, game_id: this.gameId }));
          }
        });
      }
    
    ws.send(JSON.stringify({
      type: "game_event",
      action: "start_game",
      game_id: this.gameId,
      mode: gameConfig.mode
    }));
  }

  handleKeydown(e, gameConfig) {
    const direction = this.mapKeyToDirection(e.key);
    if (!direction) return;

    ws.send(JSON.stringify({
      type: "game_event",
      action: "move",
      direction: direction,
      player_id: (gameConfig.side === "left") ? 1 : 2,
      game_id: this.gameId
    }));
  }

  mapKeyToDirection(key) {
    // Convertit la touche en "up"/"down"...
    if (key === "w" || key === "ArrowUp") return "up";
    if (key === "s" || key === "ArrowDown") return "down";
    return null;
  }



  handleGameUpdate(data) {
    if (data.type === "game_state") {
      this.updateGameState(data.payload);
    } else if (data.type === "game_over") {
      console.log("Game over! Winner is player:", data.winner);
      console.log("Final scores:", data.final_scores);
      switchwindow("home");
    }
  }

  updateGameState(gameState) 
  {

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
      this.endGame()
      console.log("Game over! Winner is player:", data.winner);
      console.log("Final scores:", data.final_scores);
      switchwindow("home");
    }
  }


  endGame() {
    console.log("Ending current game...");
    ws.send(JSON.stringify({
      type: "game_event",
      action: "leave_game",
      game_id: this.generateGameId(this.activeGame)
    }));
    this.activeGame = null;
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
