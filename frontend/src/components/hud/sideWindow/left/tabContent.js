// src/components/hud/tabContent.js

import { commMessage } from '/src/components/hud/sideWindow/left/commMessage.js';
import { infoPanelItem } from '/src/components/hud/sideWindow/left/infoPanelItem.js';
import { setupChatInput, removeChatInput } from '/src/components/hud/sideWindow/left/chat.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { escapeHtml } from '/src/components/hud/sideWindow/left/commMessage.js';

/**
 * Charge dynamiquement le contenu de l'onglet spécifié.
 *
 * @param {string} tabName - Le nom de l'onglet
 * @param {HTMLElement} container - Conteneur pour le contenu de l'onglet
 */
export async function loadTabContent(tabName, container) {
	container.innerHTML = '';

	if (tabName === 'info') {
		fetchAndStoreInfoData(container);
		removeChatInput();
	} else if (tabName === 'comm') {
		let tabItems = [];
		const storedHistory = sessionStorage.getItem('chatHistory');

		if (storedHistory) {
			try {
				tabItems = JSON.parse(storedHistory);
			} catch (err) {
				sessionStorage.removeItem('chatHistory');
				tabItems = [];
			}
		}

		const userIdRaw = await getUserIdFromCookieAPI();
		const userId = userIdRaw ? userIdRaw.toString() : 'unknown';

		tabItems.forEach((item) => {
			renderCommMessage(item, container, userId);
		});

		setupChatInput(container);
	}
}

export async function fetchAndStoreInfoData(container) {
	try {
		const response = await fetch(`/api/user-service/info-getter/`, {
			method: 'GET',
			credentials: 'include',
		});
		const data = await response.json();
		if (data.info) {
			sessionStorage.setItem('infoTabData', JSON.stringify(data.info));
			renderInfoTab(data.info, container);
		}
	} catch (error) {
		console.error('Error fetching information: ', error);
	}
}

function renderInfoTab(tabItems, container) {
	tabItems.forEach((item) => {
		const panelItem = infoPanelItem.render(item);
		container.insertAdjacentHTML('beforeend', panelItem);
		infoPanelItem.attachEvents(container.lastElementChild, item);
	});
}

function renderCommMessage(item, container, currentUserId) {
	const authorAsString = item.author ? item.author.toString() : '';

	let isUser = authorAsString === currentUserId;
	const displayAuthor = isUser ? 'USER' : authorAsString;

	let displayChannel = 'General';
	let conversationId = 'General';

	if (item.channel && item.channel.toLowerCase() === 'private') {
		displayChannel = 'Private';
		conversationId = item.recipient_id ? `private-${item.recipient_id}` : 'private';
	}

	const extendedItem = {
		...item,
		isUser,
		author: displayAuthor,
		channel: displayChannel,
		conversationId,
		timestamp: item.timestamp,
		username: item.username,
	};

	const lastChild = container.lastElementChild;
	let isSameAuthorAndConversation = lastChild && lastChild.dataset && lastChild.dataset.author === displayAuthor && lastChild.dataset.conversation === conversationId;

	if (isSameAuthorAndConversation) {
		const lastTimeStr = lastChild.dataset.rawtimestamp;
		if (lastTimeStr) {
			const lastDate = new Date(lastTimeStr);
			const newDate = new Date(extendedItem.timestamp);
			if (!isNaN(lastDate) && !isNaN(newDate)) {
				const diffMs = newDate - lastDate;
				if (diffMs > 60_000) {
					isSameAuthorAndConversation = false;
				}
			}
		}
	}

	if (isSameAuthorAndConversation) {
		const msgText = `
		<div class="message-text" style="margin-top: 0.5rem;">
			${escapeHtml(extendedItem.message)}
		</div>
	  `;
		lastChild.querySelector('.message-content-wrapper').insertAdjacentHTML('beforeend', msgText);
	} else {
		const panelItem = commMessage.render(extendedItem);
		container.insertAdjacentHTML('beforeend', panelItem);

		const appendedItem = container.lastElementChild;
		appendedItem.dataset.author = displayAuthor;
		appendedItem.dataset.channel = displayChannel;
		appendedItem.dataset.conversation = conversationId;

		const newDate = new Date(extendedItem.timestamp);
		if (!isNaN(newDate)) {
			appendedItem.dataset.timestamp = newDate.toISOString();
		}

		commMessage.attachEvents(appendedItem, extendedItem);
	}

	container.scrollTop = container.scrollHeight;
}

export async function storeMessageInSessionStorage(msg) {
	try {
		const historyString = sessionStorage.getItem('chatHistory');
		let history = [];
		if (historyString) {
			history = JSON.parse(historyString);
		}
		history.push(msg);
		sessionStorage.setItem('chatHistory', JSON.stringify(history));
	} catch (err) {
		console.error('Failed to store message: ', err);
	}
}

export async function handleIncomingMessage(data) {
	const userId = await getUserIdFromCookieAPI();
	const container = document.getElementById('l-tab-content');

	if (data.type === 'error_message') {
		createErrorInput(data.message);
		return;
	}

	const activeTab = document.querySelector('.nav-link.active');
	if (activeTab && activeTab.dataset.tab === 'comm') {
		renderCommMessage(data, container, userId.toString());
	} else {
		if (data.channel === 'private') {
			createNotificationMessage(`New private message from ${data.username} !`);
		}
	}

	if (activeTab && activeTab.dataset.tab !== 'comm' && data.type !== 'error_message') {
		const infoTab = document.querySelector('.nav-link[data-tab="comm"]');
		if (infoTab && 
			!infoTab.classList.contains('active') && 
			!infoTab.classList.contains('flashing-menu')) {
			infoTab.classList.add('flashing-menu');
		}
	}

	storeMessageInSessionStorage(data);
}

export function createErrorInput(error_message) {
	let inputElement = document.getElementById('message-input');

	inputElement.placeholder = error_message;

	inputElement.classList.add('error');

	setTimeout(() => {
		inputElement.classList.remove('error');
		inputElement.placeholder = 'Enter your message...';
	}, 5000);
}
