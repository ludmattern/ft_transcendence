let ws = null;
let isWsConnected = false;

export function initializeWebSocket() {
    if (ws && isWsConnected) {
        console.log(" WebSocket déjà connecté.");
        return;
    }

    ws = new WebSocket(`wss://${window.location.host}/ws/gateway/`);
    console.log(" Tentative de connexion au WebSocket Gateway...");

    ws.onopen = () => {
      console.log(" Connecté au WebSocket Gateway !");
      ws.send(JSON.stringify({
          type: "chat_message",
          sender_id: "test_user",
          message: "Ceci est un test",
          timestamp: new Date().toISOString()
      }));
      isWsConnected = true;
    };

    ws.onmessage = (event) => {
        console.log(" Message reçu :", JSON.parse(event.data));
    };

    ws.onerror = (error) => {
        console.error(" Erreur WebSocket :", error);
        isWsConnected = false;
    };

    ws.onclose = () => {
        console.log("WebSocket fermé, tentative de reconnexion...");
        isWsConnected = false;
        setTimeout(initializeWebSocket, 5000);
    };
}

export function closeWebSocket() {
    if (ws) {
        ws.close();
        ws = null;
        isWsConnected = false;
        console.log("WebSocket fermé manuellement.");
    }
}