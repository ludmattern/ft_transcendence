export let ws = null;
let isWsConnected = false;
import { gameManager } from "/src/pongGame/gameManager.js";



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
        isWsConnected = true;
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === "game_state" || data.type === "game_over") {
            gameManager.handleGameUpdate(data);
            console.log(data);
            return;
          }
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
