export default class WebSocketClient {
    constructor() {
        this.webSocket = null;
        this.url = null;
    }

    initialize(service, onMessage, onOpen, onClose, onError) {
        this.url = `wss://${window.location.host}/ws/${service}/`;
        this.webSocket = new window.WebSocket(this.url);  // Correction ici

        this.webSocket.onmessage = onMessage;
        this.webSocket.onopen = onOpen;
        this.webSocket.onclose = onClose;
        this.webSocket.onerror = onError;
    }

    sendMessage(message) {
        if (this.webSocket && this.webSocket.readyState === 1) {
            this.webSocket.send(JSON.stringify(message));
        } else {
            console.warn("WebSocket non prêt à envoyer des messages.");
        }
    }

    close() {
        if (this.webSocket) {
            this.webSocket.close();
        }
    }
}
