import { gameManager } from "/src/pongGame/gameManager.js";	
import { ws } from "/src/services/socketManager.js";

export function gameModeSelector(config)
{
    if (config.gameMode === "local")
    {
        const gameConfig = {
            mode: "local", 
          };

          gameManager.startGame(gameConfig);
    }
    else if ( config.gameMode === "matchmaking")
    {
        const userId = sessionStorage.getItem("userId");
        ws.send(JSON.stringify({
            type: "matchmaking",
            action: "join",
            user_id: userId
        }));
        console.log("launch matchmaking")
    }
    else if(config.gameMode === "private")
    {
        const userId = sessionStorage.getItem("userId");
        ws.send(JSON.stringify({
          type: "private_event",
          action: "join",
          room_code: roomCode,
          user_id: userId
        }));
    }
}



export function cancelMode(config)
{
    if ( config.gameMode === "matchmaking")
    {
        const userId = sessionStorage.getItem("userId");
        ws.send(JSON.stringify({
          type: "matchmaking",
          action: "leave",
          user_id: userId
        }));
        console.log("Sent 'leave matchmaking' via WebSocket");
    }
    else if ( config.gameMode === "private")
 
    {
        const userId = sessionStorage.getItem("userId");
        ws.send(JSON.stringify({
          type: "private_event",
          action: "leave",
          room_code: roomCode,
          user_id: userId
        }));
        console.log("Sent leave room event for room:", roomCode);
    }
}