
let matchmakingPollId = null;
let isInMatchmaking = false;

let privatePollId = null;
let isInPrivateRoom = false;



export async function joinRoom(roomCode) 
{
  isInPrivateRoom = true;
  const userId = sessionStorage.getItem("userId");
  if (!userId) 
  {
    console.error("No userId");
    return;
  }
  const response = await fetch("/api/pong-service/join_private_room/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_code: roomCode, user_id: userId })
  });
  const data = await response.json();
  if (data.status === "matched") {
    console.log("Matched room:", data.game_id);
    isInPrivateRoom = false;
    if (privatePollId) {
      clearTimeout(privatePollId);
      privatePollId = null;
    }
    leavePrivateButton.style.display = "none";
    startPrivateGame(data.game_id, data.side, userId, roomCode);
  } else {
    console.log("Waiting in room", roomCode);
    if (isInPrivateRoom) {
      privatePollId = setTimeout(() => joinRoom(roomCode), 2000);
    }
  }
}
export async function startPrivateGame(gameId,side,userId, roomCode) {
    const response = await fetch(`/api/pong-service/leave_private_room/` , {
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
    gameManager.startGame(gameConfig);
  }

  export async function launchMatchmaking() {
    isInMatchmaking = true;
    const userId = sessionStorage.getItem("userId"); 
    if (!userId) 
    {
      console.error("No userId found in sessionStorage");
      return;
    }  
    const response = await fetch(`/api/pong-service/join_matchmaking/${userId}/`);
    const data = await response.json();
  
    if (data.status === "matched") {
      console.log("Matched! game_id=", data.game_id);
      isInMatchmaking = false;
      if (matchmakingPollId) {
        clearTimeout(matchmakingPollId);
        matchmakingPollId = null;
      }
      leaveMatchButton.style.display = "none";  
      startMatchmakingGame(data.game_id, data.side, userId);
    } else {
      console.log("Waiting for another player...");
      if (isInMatchmaking) 
      {
        matchmakingPollId = setTimeout(() => launchMatchmaking(), 1000);
      }
    }
  }

  export async function startMatchmakingGame(gameId, side, userId) {
  
    const response = await fetch(`/api/pong-service/leave_matchmaking/${userId}/`);
    const responseData = await response.json();
  
    console.log(responseData);
  
    const gameConfig = {
      mode: "matchmaking",
      map: document.getElementById("mapSelect-matchmaking").value,
      playerCount: 2,
      gameId: gameId,
      side: side
  
    };
    gameManager.startGame(gameConfig);
  }

  export async function leaveMatchmaking() {
    isInMatchmaking = false;
    if (matchmakingPollId) {
      clearTimeout(matchmakingPollId);
      matchmakingPollId = null;
    }
    const userId = sessionStorage.getItem("userId"); 
    if (!userId) 
      return;
    const resp = await fetch(`/api/pong-service/leave_matchmaking/${userId}/`);
    console.log("Left matchmaking:", await resp.json());
  }

  export async function leavePrivate() {
      isInPrivateRoom = false;
      if (privatePollId) {
        clearTimeout(privatePollId);
        privatePollId = null;
      }
      const userId = sessionStorage.getItem("userId");
      const roomCode = document.getElementById("privateRoomCode").value;
      await fetch("/api/pong-service/leave_private_room/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_code: roomCode, user_id: userId })
      });
      console.log("Left private room");
  }