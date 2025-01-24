// liveChat.js
import { getSocket } from "/src/services/socketManager.js";

export function setupLiveChatEvents() {
  const chatSocket = getSocket("chat");
  if (!chatSocket) {
    console.warn("Chat socket not initialized or user not authenticated.");
    return;
  }

  // Add listeners or message sending logic:
  chatSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleIncomingMessage(data);
  };

  function handleIncomingMessage(data) {
    console.log("Incoming chat message:", data);
    // ...update DOM...
  }

  function sendMessage(message, username) {
    chatSocket.send(JSON.stringify({
      type: "chat_message",
      message,
      username
    }));
  }

  // Example: attach a "Send" button
  const sendButton = document.getElementById("send-button");
  if (sendButton) {
    sendButton.addEventListener("click", () => {
      const input = document.getElementById("message-input");
      sendMessage(input.value, "CurrentUser");
      input.value = "";
    });
  }
}