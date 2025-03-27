// src/components/hud/chat.js

import { ws } from '/src/services/websocket.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';

const messageHistory = [];
let historyIndex = -1;
let draftMessage = '';

export async function setupChatInput() {
	const container = document.querySelector('#l-tab-content-container');
	if (!container) {
		return;
	}

	if (!container.querySelector('#message-input-container')) {
		const inputContainer = `
			<div class="d-flex" 
				style="flex-wrap: wrap; background: #ffffff07; position: absolute; width: 100%;" 
				id="message-input-container">
			<input type="text" id="message-input" maxlength="150" placeholder="Enter your message..." 
					class="form-control w-50 me-2 p-3" 
					style="flex: auto; color: var(--content-color);" />
			<button id="chat-send-button" class="btn btn-sm">Send</button>
			</div>
		`;
		container.insertAdjacentHTML('beforeend', inputContainer);
	}

	const inputField = container.querySelector('#message-input');
	const sendButton = container.querySelector('#chat-send-button');

	function sendMessage(message) {
		const privateMessageMatch = message.match(/^@(\w+)\s+(.*)/);

		const payload = {
			timestamp: new Date().toISOString(),
		};

		if (privateMessageMatch) {
			const recipient = privateMessageMatch[1];
			const privateMessage = privateMessageMatch[2];

			payload.type = 'private_message';
			payload.message = privateMessage;
			payload.recipient = recipient;
			payload.channel = 'private';
		} else {
			payload.type = 'chat_message';
			payload.message = message;
			payload.channel = 'general';
		}

		messageHistory.push(message);
		historyIndex = messageHistory.length;
		draftMessage = '';

		ws.send(JSON.stringify(payload));
	}

	if (inputField) {
		inputField.addEventListener('keydown', (event) => {
			switch (event.key) {
				case 'ArrowUp':
					if (historyIndex === messageHistory.length) {
						draftMessage = inputField.value;
					}
					if (historyIndex > 0) {
						historyIndex--;
						inputField.value = messageHistory[historyIndex];
					}
					event.preventDefault();
					break;
				case 'ArrowDown':
					if (historyIndex < messageHistory.length - 1) {
						historyIndex++;
						inputField.value = messageHistory[historyIndex];
					} else if (historyIndex === messageHistory.length - 1) {
						historyIndex++;
						inputField.value = draftMessage;
					}
					event.preventDefault();
					break;
				case 'Enter':
					event.preventDefault();
					const trimmedMessage = inputField.value.trim();
					if (trimmedMessage !== '' && trimmedMessage.length <= 150) {
						sendMessage(trimmedMessage);
						historyIndex = messageHistory.length;
						inputField.value = '';
					} else if (trimmedMessage.length > 150) {
						createNotificationMessage('Message is too long, 150 chars max', 2500, true);
					}
					break;
				default:
					break;
			}
		});
	}

	if (sendButton) {
		sendButton.addEventListener('click', () => {
			const trimmedMessage = inputField.value.trim();
			if (trimmedMessage !== '' && trimmedMessage.length <= 150) {
				sendMessage(trimmedMessage);
				historyIndex = messageHistory.length;
				inputField.value = '';
			} else if (trimmedMessage.length > 150) {
				createNotificationMessage('Message is too long, 150 chars max', 2500, true);
			}
		});
	}
}

export function removeChatInput() {
	const inputContainer = document.getElementById('message-input-container');
	if (inputContainer) {
		inputContainer.remove();
	}
}
