export let ws = null;
let isWsConnected = false;
import { gameManager } from "/src/pongGame/gameManager.js";
import { handleIncomingMessage } from "/src/components/hud/sideWindow/left/tabContent.js";
import { startMatchmakingGame, startPrivateGame} from "/src/services/multiplayerPong.js";
import { createNotificationMessage, updateAndCompareInfoData } from "/src/components/hud/sideWindow/left/notifications.js";



function parseGameId(gameId) {
  const regex = /^tournLocal_(.+)_vs_tournLocal_(.+)_id_(.+)$/;
  const match = gameId.match(regex);
  if (match) {
    const player1 = match[1];
    const player2 = match[2];
    const tournamentId = match[3];
    return { player1, player2, tournamentId };
  } else {
    throw new Error("Invalid gameId format");
  }
}


function handleLocalTourn_end(data)
{
  try {
    const { player1, player2, tournamentId } = parseGameId(data.game_id);
    
    const payload = {
      game_id: data.game_id,
      tournament_id: tournamentId,
      winner_id: data.winner_id,  
      loser_id: data.loser_id, 
      final_scores: data.final_scores,
      type: "game_over",
      player1: player1,
      player2: player2
    };
    
    fetch('/api/tournament-service/update_match_result/', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(result => {
      console.log("Match result updated:", result);
    })
    .catch(err => {
      console.error("Error updating match result:", err);
    });
  } catch (error) {
    console.error("Error parsing gameId:", error);
  }
}

export function initializeWebSocket() {
  if (ws) {
    if (
      ws.readyState === WebSocket.OPEN ||
      ws.readyState === WebSocket.CONNECTING ||
      isWsConnected == true
    ) {
      return;
    } else {
      closeWebSocket();
    }
  }

  ws = new WebSocket(`wss://${window.location.host}/ws/gateway/`);

  ws.onopen = () => {
    console.log(" WebSocket connecté !");
    isWsConnected = true;

    const userId = sessionStorage.getItem("userId");
    const username = sessionStorage.getItem("username");

    const initPayload = {
      type: "init",
      userId: userId,
      username: username,
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(initPayload));
  };

  ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "game_state" || data.type === "game_over") {
      if (data.type === "game_over" && data.game_id.startsWith("tournLocal_")) {
        handleLocalTourn_end(data)
      }
      gameManager.handleGameUpdate(data);
      return;
    } else if (data.type === "error_message") {
      if (data.error) {
        createNotificationMessage(data.error, 2500, true);
      } else {
        handleIncomingMessage(data);
      }
    } else if (data.type === "chat_message" || data.type === "private_message") {
      handleIncomingMessage(data);
    } else if (data.type === "private_match_found") {
      console.log("Private match found:", data);
      startPrivateGame(data.game_id, data.side, data, data.roomCode);
    } else if (data.type === "match_found") {
      startMatchmakingGame(data.game_id, data.side, data);
    } else if (data.type === "info_message") {
      await updateAndCompareInfoData();

      if (data.action === "send_friend_request") {
        const isSender = data.author === sessionStorage.getItem("userId");
        if (isSender) {
          console.log(
            `Friend request sent to ${data.recipient} by ${data.author}`
          );
        } else {
          console.log(
            `Friend request received from ${data.author} to ${data.recipient}`
          );
          createNotificationMessage(
            `Friend request received from ${data.author}!`
          );
        }
      }
    }

    console.log("Message complet reçu :", data);
  };

  ws.onerror = (error) => {
    console.error(" Erreur WebSocket :", error);
    isWsConnected = false;
  };

  ws.onclose = () => {
    console.log("WebSocket fermé.");
    isWsConnected = false;
    ws = null;
  };
}

export function closeWebSocket() {
  if (ws) {
    console.log(" Fermeture manuelle du WebSocket...");
    ws.close();
    ws = null;
    isWsConnected = false;
  }
}
