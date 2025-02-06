import { gameManager } from "/src/pongGame/gameManager.js";





export async function startPrivateGame(gameId,side,userId, roomCode) {
    const response = await fetch(`/api/matchmaking-service/leave_private_room/` , {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ room_code: roomCode, user_id: userId })
    });
    const responseData = await response.json();
  
    console.log(responseData);
    const gameConfig = {
      mode: "private",
      gameId: gameId,
      side: side,
      map: document.getElementById("mapSelect-private").value,
      playerCount: parseInt(document.getElementById("playerCount-private").value, 10),
    };
    document.getElementById("leavePrivate").style.display = "none";
    document.getElementById("createPrivate").style.display = "block"
    gameManager.startGame(gameConfig);
  }


  

  export async function startMatchmakingGame(gameId, side, userId) {
  
    const response = await fetch(`/api/matchmaking-service/leave_matchmaking/${userId}/`);
    const responseData = await response.json();
  
    console.log(responseData);
  
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

