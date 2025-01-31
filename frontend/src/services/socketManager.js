// socketManager.js

const sockets = {};

// Simple Event Emitter Implementation
const eventListeners = {};

function emit(event, data) {
  if (eventListeners[event]) {
    eventListeners[event].forEach((callback) => callback(data));
  }
}

function on(event, callback) {
  if (!eventListeners[event]) {
    eventListeners[event] = [];
  }
  eventListeners[event].push(callback);
}

export function initializeWebSocket(key, url) {
  if (!sockets[key]) {
    console.log(`Initializing [${key}] Web Socket...`);
    connect(key, url);
  }

  return sockets[key];
}

function connect(key, url, reconnectAttempts = 0) {
  const maxReconnectAttempts = 5;
  const reconnectDelay = Math.pow(2, reconnectAttempts) * 1000; // Exponential backoff

  const newSocket = new WebSocket(url);

  newSocket.onopen = () => {
    console.log(`WebSocket [${key}] connected.`);
    emit('open', { key, socket: newSocket });
    sockets[key] = newSocket;
  };

  newSocket.onclose = () => {
    console.log(`WebSocket [${key}] closed.`);
    emit('close', { key });
    delete sockets[key];

    if (reconnectAttempts < maxReconnectAttempts) {
      setTimeout(() => {
        connect(key, url, reconnectAttempts + 1);
      }, reconnectDelay);
    } else {
      console.error(`Max reconnection attempts reached for WebSocket [${key}].`);
    }
  };

  newSocket.onerror = (err) => {
    console.error(`WebSocket [${key}] error:`, err);
    emit('error', { key, error: err });
    newSocket.close(); // Trigger onclose for reconnection
  };

  newSocket.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      console.error(`Invalid JSON received on [${key}]:`, event.data);
      return;
    }
    emit('message', { key, data });
  };
}

export function getSocket(key) {
  return sockets[key] || null;
}

// Event Emitter Functions
export function onSocketEvent(event, callback) {
  on(event, callback);
}

export function offSocketEvent(event, callback) {
  if (eventListeners[event]) {
    eventListeners[event] = eventListeners[event].filter((cb) => cb !== callback);
  }
}
