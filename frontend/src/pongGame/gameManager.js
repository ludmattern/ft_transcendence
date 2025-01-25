import { switchwindow } from "/src/3d/animation.js";
import {buildGameScene} from "/src/3d/pongScene.js";
import Store  from "/src/3d/store.js";

class GameManager {
  constructor() {
    this.activeGame = null; // Référence à l'instance de la partie en cours
    this.socket = null; // Référence au WebSocket en cours


  }

  startGame(gameConfig) {
    console.log("Starting game with config:", gameConfig);

    if (gameConfig.mode == "local")
    {
      document.addEventListener("keydown", (e) => {
        if (!this.socket) return;

        if (e.key === "w") {
          this.socket.send(JSON.stringify({ type: "move", direction: "up", player_id: 1 }));
        } else if (e.key === "s") {
          this.socket.send(JSON.stringify({ type: "move", direction: "down", player_id: 1 }));
        } else if (e.key === "ArrowUp") {
          this.socket.send(JSON.stringify({ type: "move", direction: "up", player_id: 2 }));
        } else if (e.key === "ArrowDown") {
          this.socket.send(JSON.stringify({ type: "move", direction: "down", player_id: 2 }));
        }
      });
    }
    else
    {
      document.addEventListener("keydown", (e) => {
        if (!this.socket) return;

        if (e.key === "w") {
          this.socket.send(JSON.stringify({ type: "move", direction: "up", player_id: 1 }));
        } else if (e.key === "s") {
          this.socket.send(JSON.stringify({ type: "move", direction: "down", player_id: 1 }));
        }
      });
    }

    if (this.activeGame) {
      this.endGame();
    }

    this.activeGame = gameConfig;

    buildGameScene(gameConfig);

    this.initWebSocket(gameConfig);

    switchwindow("game");
  }


  initWebSocket(gameConfig) {

    const gameId = gameConfig.gameId ? gameConfig.gameId : this.generateGameId(gameConfig);
    const wsUrl = `ws://localhost:3004/ws/pong/${gameId}/`;

    console.log("Connecting to WebSocket:", wsUrl);
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("WebSocket connected for game:", gameId);
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "game_state") {
        this.updateGameState(data.payload);
      }
    };
    

    this.socket.onclose = () => {
      console.log("WebSocket connection closed.");
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  updateGameState(gameState) {
    console.log("Updating game state:", gameState);
  
    // 1) Mettre la balle
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
  
    if (gameState.scores) {

    }
  }


  endGame() {
    console.log("Ending current game...");

    if (this.socket) 
    {
      this.socket.close();
      this.socket = null;
    }

    this.activeGame = null;

   
  }

  generateGameId(gameConfig) {
    if (gameConfig.mode === "private") {
      return `private_${Date.now()}`;
    }
    if (gameConfig.mode === "matchmaking") {
      return `matchmaking_${Date.now()}`;
    }
    return `game_${Date.now()}`;
  }



}

export const gameManager = new GameManager();
