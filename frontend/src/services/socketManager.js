// socketManager.js

// Dictionary to hold multiple sockets keyed by "purpose"
const sockets = {};

/**
 * Initialize a WebSocket for a given key (purpose).
 * If it's already created, return the existing one.
 */
export function initializeWebSocket(key, url) {
  console.log("Initializing Web Socket...")
  if (!sockets[key]) {
    const newSocket = new WebSocket(url);

    // Optional: set up default event listeners
    newSocket.onopen = () => console.log(`WebSocket [${key}] connected.`);
    newSocket.onclose = () => console.log(`WebSocket [${key}] closed.`);
    newSocket.onerror = (err) => console.error(`WebSocket [${key}] error:`, err);

    sockets[key] = newSocket;
  }

  return sockets[key];
}

/**
 * Retrieve an existing socket by key.
 * Returns null if it has not been initialized.
 */
export function getSocket(key) {
  return sockets[key] || null;
}