
let ws = null;
let isWsConnected = false;

export function initializeWebSocket() {
    if (ws) {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING || isWsConnected == true)  {
            return;
        } else {
            closeWebSocket();
        }
    }

    ws = new WebSocket(`wss://${window.location.host}/ws/gateway/`);

    ws.onopen = () => {
        console.log(" WebSocket connecté !");
        ws.send(JSON.stringify({
          type: "chat_message",
          sender_id: "userA",
          message: "Salut tout le monde !",
          timestamp: new Date().toISOString()
      }));
        isWsConnected = true;
    };

    ws.onmessage = (event) => {
        console.log("📩 Message reçu :", JSON.parse(event.data));
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
