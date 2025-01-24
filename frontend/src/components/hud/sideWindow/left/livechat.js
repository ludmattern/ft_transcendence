// WebSocket Connection
const livechat_socket = new WebSocket('wss://' + window.location.host + '/ws/chat/');

// Event Listeners
livechat_socket.onopen = function(e) {
    console.log('WebSocket connection established');
};

livechat_socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    handleIncomingMessage(data);
};

livechat_socket.onclose = function(event) {
    console.log('WebSocket connection closed:', event);
};

// Send Message Function:
function sendMessage(message, username) {
    livechat_socket.send(JSON.stringify({
        'type': 'chat_message',
        'message': message,
        'username': username
    }));
}

// Handle incoming Message Function
function handleIncomingMessage(data) {
    // Process and display the received message
    const chatLog = document.querySelector('#chat-log');
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.username}: ${data.message}`;
    chatLog.appendChild(messageElement);
}

// Event Listener for Sending Messages.
document.querySelector('#send-message-button').onclick = function() {
    const messageInput = document.querySelector('#message-input');
    const message = messageInput.value;
    const username = 'CurrentUser'; // Replace with actual username
    sendMessage(message, username);
    messageInput.value = '';
};
