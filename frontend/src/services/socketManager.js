export let ws = null;
let isWsConnected = false;
import { gameManager } from "/src/pongGame/gameManager.js";
import { handleIncomingMessage } from "/src/components/hud/sideWindow/left/tabContent.js";
import { startMatchmakingGame, startPrivateGame } from "/src/services/multiplayerPong.js";
import { createNotificationMessage } from "/src/components/hud/sideWindow/left/notifications.js";

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
	  gameManager.handleGameUpdate(data);
	  console.log(data);
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
	  console.log("Match found! game_id =", data.game_id, "side =", data.side);
	  startMatchmakingGame(data.game_id, data.side, data);
	} else if (data.type === "info_message") {
	  console.log("Info message reçu :", data);
  
	  await updateAndCompareInfoData();
  
	  if (data.action === "send_friend_request") {
		const isSender = data.author === sessionStorage.getItem("userId");
		if (isSender) {
		  console.log(`Friend request sent to ${data.recipient} by ${data.author}`);
		} else {
		  console.log(`Friend request received from ${data.author} to ${data.recipient}`);
		  createNotificationMessage(`Friend request received from ${data.author}!`);
		}
	  }
	} else {
	  console.log("Message reçu :", data);
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

async function updateAndCompareInfoData() {
	const userId = sessionStorage.getItem("userId");
  
	try {
	  const response = await fetch(`/api/user-service/info-getter/${encodeURIComponent(userId)}/`, {
		method: "GET",
		credentials: "include",
	  });
	  const result = await response.json();
  
	  if (result.info) {
		let localInfo = [];
		const localInfoStr = sessionStorage.getItem("infoTabData");
		if (localInfoStr) {
		  try {
			const parsedInfo = JSON.parse(localInfoStr);
			localInfo = Array.isArray(parsedInfo) ? parsedInfo : [];
		  } catch (err) {
			localInfo = [];
		  }
		}
  
		const serverInfo = Array.isArray(result.info) ? result.info : [];
  
		const newMessages = serverInfo.filter(newMsg => 
		  !localInfo.some(localMsg => localMsg.id === newMsg.id)
		);
  
		if (newMessages.length > 0) {
		  console.log("Nouveaux messages :", newMessages);
		} else {
		  console.log("Aucun nouveau message.");
		}
  
		sessionStorage.setItem("infoTabData", JSON.stringify(serverInfo));
	  } else {
		console.log("Erreur lors de la récupération des informations depuis le serveur.");
	  }
	} catch (error) {
	  console.error("Erreur lors de la mise à jour des informations :", error);
	}
  }
  