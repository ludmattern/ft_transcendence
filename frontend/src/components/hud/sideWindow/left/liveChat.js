import { getSocket } from "/src/services/socketManager.js";

export function setupLiveChatEvents() {

  const userId = sessionStorage.getItem("userId");
  const chatSocket = getSocket("chat/" + userId);

  if (!chatSocket) {
    console.warn("Chat socket not initialized or user not authenticated.");
    return;
  }

  /**
 * Sends a message to the backend via WebSocket.
 * @param {string} message - The message content.
 * @param {string} channel - The target channel ('General' by default).
 */

  function sendMessage(message, channel = 'general') {
    if (!userId) {
      console.error("Username is not set. Cannot send message.");
      return;
    }

    const payload = {
      message: message,
      author: stringify(userId),
      channel: channel,
    };

    chatSocket.send(JSON.stringify(payload));
    if (channel === 'private') {
      appendMessageToChatBox(payload, true);
    }
  }

  const inputField = document.getElementById("message-input");
  inputField.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (inputField.value !== '') {
        event.preventDefault(); // Prevent default behavior of Enter
        sendMessage(inputField.value); // Trigger the send logic
        inputField.value = "";
      }
    }
  });

  // Attach a "Send" button
  const sendButton = document.getElementById("send-button");
  if (sendButton) {
    sendButton.addEventListener("click", () => {
      const input = document.getElementById("message-input");
      if (input.value !== '') {
        sendMessage(input.value);
        input.value = "";
      }
    });
  }

  /**
   * Sanitizes a string to prevent XSS attacks by escaping HTML.
   * @param {string} str - The string to sanitize.
   * @returns {string} - The sanitized string.
   */

  function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  /**
   * Generates the current timestamp in 'HH:MM' format.
   * @returns {string} - The current timestamp.
   */

  function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Appends a message to the chat box in the DOM.
   * @param {Object} payload - The message payload.
   * @param {boolean} isOutgoing - Indicates if the message is sent by the current user.
   */

  function appendMessageToChatBox(payload, isOutgoing) {
    const { message, author, channel } = payload;
  
    const chatBox = document.getElementById("messages-container");
    if (!chatBox) {
      console.error("Messages container not found.");
      return;
    }
  
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("message-content-wrapper");
    messageWrapper.classList.add(isOutgoing ? "outgoing" : "incoming");
  
    const messageHeader = `
      <div class="message-header">
        <span class="sender">${isOutgoing ? "You" : `User ${author}`}</span>
        <span class="timestamp">${getCurrentTimestamp()}</span>
      </div>
    `;
  
    const messageText = `
      <div class="message-text">${sanitizeHTML(message)}</div>
    `;
  
    messageWrapper.innerHTML = messageHeader + messageText;
  
    chatBox.appendChild(messageWrapper);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
  }
  /**
   * Handles incoming messages from the WebSocket.
   * @param {Object} data - The incoming message data.
   */

  function handleIncomingMessage(data) {
    console.log("Incoming data: ", data);

    // Destructure necessary fields from data
    const { message, sender_id, channel, timestamp } = data;

    // Basic validation
    if (!message || !sender_id || !channel || !timestamp) {
      console.error("Invalid message format:", data);
      return;
    }

    // Determine if the message is outgoing or incoming
    const isOutgoing = sender_id === userId;

    // If the message is from the current user and sent to 'General', skip appending to avoid duplication
    if (isOutgoing && channel.toLowerCase() === 'general') {
        return;
    }
    // Append the message to the chatbox
    appendMessageToChatBox({ message, sender_id, channel, timestamp }, isOutgoing);
  }

  // Add listeners or message sending logic
  chatSocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleIncomingMessage(data);
    }
    catch (error) {
      console.error("Error parsing incoming message:", error);
    }
  };

}