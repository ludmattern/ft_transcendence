import { gameManager } from "/src/pongGame/gameManager.js";
import { leaveMatchmaking, leaveRoom} from "/src/components/pong/play/multiplayerContent.js";




export async function startPrivateGame(gameId,side,userId, roomCode) {
    leaveRoom(roomCode);
    console.log(roomCode);
    const gameConfig = {
      mode: "private",
      gameId: gameId,
      side: side,
      map: document.getElementById("mapSelect-private").value,
      playerCount: parseInt(document.getElementById("playerCount-private").value, 10),
    };
    document.getElementById("privateRoomCode").disabled = false;
    document.getElementById("leavePrivate").style.display = "none";
    document.getElementById("createPrivate").style.display = "block"
    gameManager.startGame(gameConfig);
  }


  

  export async function startMatchmakingGame(gameId, side, userId) {
    leaveMatchmaking();

    const gameConfig = {
      mode: "matchmaking",
      map: document.getElementById("mapSelect-matchmaking").value,
      playerCount: 2,
      gameId: gameId,
      side: side
  
    };
    document.getElementById("leaveMatch").style.display = "none";
    document.getElementById("launchMatch").style.display = "block"
    gameManager.startGame(gameConfig);
  }

