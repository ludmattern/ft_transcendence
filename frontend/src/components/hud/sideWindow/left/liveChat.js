import { getSocket } from "/src/services/socketManager.js";

export function setupLiveChatEvents() {
  
  const chatSocket = getSocket("chat");
  if (!chatSocket) {
    console.warn("Chat socket not initialized or user not authenticated.");
    return;
  }
  
  // Add listeners or message sending logic
  chatSocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleIncomingMessage(data);
  };
  
  function handleIncomingMessage(data) {
    console.log("Incoming chat message:", data);
    // ...update DOM...
  }
  
  const currentUsername = sessionStorage.getItem("registered_user");
  console.log(currentUsername);

  function sendMessage(message) {
    if (!currentUsername) {
      console.error("Username is not set. Cannot send message.");
      return;
    }

    chatSocket.send(JSON.stringify({
      type: "chat_message",
      message,
      username: currentUsername, // Use the stored username
    }));
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
}