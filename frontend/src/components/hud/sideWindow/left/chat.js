// src/components/hud/chat.js

import { ws } from '/src/services/websocket.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';

export async function setupChatInput() {
	const container = document.querySelector('#l-tab-content-container');
	if (!container) {
		console.error('l-tab-content-container not found.');
		return;
	}

	if (!container.querySelector('#message-input-container')) {
		const inputContainer = `
		  <div class="d-flex" 
			  style="flex-wrap: wrap; background: #ffffff07; position: absolute; width: 100%;" 
			  id="message-input-container">
		  <input type="text" id="message-input" placeholder="Enter your message..." 
				  class="form-control w-50 me-2 p-3" 
				  style="flex: auto; color: var(--content-color);" />
		  <button id="chat-send-button" class="btn btn-sm">Send</button>
		  </div>
	  `;
		container.insertAdjacentHTML('beforeend', inputContainer);
	}

	const inputField = container.querySelector('#message-input');
	const sendButton = container.querySelector('#chat-send-button');

	const userId = await getUserIdFromCookieAPI();
	if (!userId) {
		console.error('No userId. Cannot send message.');
		return;
	}

	function sendMessage(message) {
		const privateMessageMatch = message.match(/^@(\w+)\s+(.*)/);

		// Common payload structure
		const payload = {
			type: null,
			message: null,
			author: userId,
			recipient: null,
			channel: null,
			timestamp: new Date().toISOString(),
		};

		if (privateMessageMatch) {
			// Private message case
			const recipient = privateMessageMatch[1];
			const privateMessage = privateMessageMatch[2];

			payload.type = 'private_message';
			payload.message = privateMessage;
			payload.recipient = recipient;
			payload.channel = 'private';
		} else {
			// General chat message case
			payload.type = 'chat_message';
			payload.message = message;
			payload.channel = 'general';
		}

		console.log('Sending message:', payload);

		// Send the payload
		ws.send(JSON.stringify(payload));
	}

	if (inputField) {
		inputField.addEventListener('keydown', (event) => {
			if (event.key === 'Enter') {
				event.preventDefault();
				if (inputField.value.trim() !== '') {
					sendMessage(inputField.value.trim());
					inputField.value = '';
				}
			}
		});
	}

	if (sendButton) {
		sendButton.addEventListener('click', () => {
			if (inputField && inputField.value.trim() !== '') {
				sendMessage(inputField.value.trim());
				inputField.value = '';
			}
		});
	}
}

/**
 * Supprime la zone de saisie pour les onglets autres que "COMM".
 */
export function removeChatInput() {
	const inputContainer = document.getElementById('message-input-container');
	if (inputContainer) {
		inputContainer.remove();
	}
}
