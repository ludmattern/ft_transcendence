// src/components/hud/tabContent.js

import { commMessage, infoPanelItem } from '/src/components/hud/index.js';
import { setupChatInput, removeChatInput } from '/src/components/hud/sideWindow/left/chat.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';

/**
 * Charge dynamiquement le contenu de l'onglet spécifié.
 *
 * @param {string} tabName - Le nom de l'onglet
 * @param {HTMLElement} container - Conteneur pour le contenu de l'onglet
 */
export async function loadTabContent(tabName, container) {
	container.innerHTML = '';

	if (tabName === 'info') {
		let infoTabData = sessionStorage.getItem('infoTabData');
		console.log('Info tab loading');

		if (infoTabData && infoTabData !== '[]') {
			try {
				const parsedData = JSON.parse(infoTabData);
				if (!parsedData) {
					throw new Error('Données corrompues ou incomplètes !');
				}
				renderInfoTab(parsedData, container);
				console.log('Info tab loaded from sessionStorage');
				console.log(parsedData);
			} catch (err) {
				console.warn('SessionStorage corrompu, rechargement depuis le serveur...', err);
				fetchAndStoreInfoData(container);
			}
		} else {
			fetchAndStoreInfoData(container);
			console.log('Info tab loaded from server');
		}

		removeChatInput();
	} else if (tabName === 'comm') {
		let tabItems = [];
		const storedHistory = sessionStorage.getItem('chatHistory');

		if (storedHistory) {
			try {
				tabItems = JSON.parse(storedHistory);
			} catch (err) {
				console.warn("Erreur lors de la récupération de 'chatHistory', réinitialisation...", err);
				sessionStorage.removeItem('chatHistory');
				tabItems = [];
			}
		}

		const userIdRaw = await getUserIdFromCookieAPI();
		const userId = userIdRaw ? userIdRaw.toString() : 'unknown';

		console.log('UserId récupéré :', userId);
		tabItems.forEach((item) => {
			renderCommMessage(item, container, userId);
		});

		setupChatInput(container);
	}
}

export async function fetchAndStoreInfoData(container) {
	const userId = await getUserIdFromCookieAPI();

	const response = await fetch(`/api/user-service/info-getter/${encodeURIComponent(userId)}/`, {
		method: 'GET',
		credentials: 'include',
	});

	const data = await response.json();
	if (data.info) {
		console.log('Information received from the server:', data);
		sessionStorage.setItem('infoTabData', JSON.stringify(data.info));
		renderInfoTab(data.info, container);
	} else {
		console.log('Error getting information');
	}
}

function renderInfoTab(tabItems, container) {
	tabItems.forEach((item) => {
		const panelItem = infoPanelItem.render(item);
		container.insertAdjacentHTML('beforeend', panelItem);
		infoPanelItem.attachEvents(container.lastElementChild, item);
	});
}

/**
 * Affiche un message dans le conteneur "COMM" en utilisant `commMessage.render(...)`,
 * tout en gérant le regroupement si c'est le même auteur + même channel.
 */
function renderCommMessage(item, container, currentUserId) {
	const authorAsString = item.author ? item.author.toString() : '';

	let isUser = authorAsString === currentUserId;
	const displayAuthor = isUser ? 'USER' : authorAsString;

	let displayChannel = 'General';
	if (item.channel && item.channel.toLowerCase() === 'private') {
		displayChannel = 'Private';
	}

	const extendedItem = {
		...item,
		isUser,
		author: displayAuthor,
		channel: displayChannel,
		timestamp: item.timestamp,
		username: item.username,
	};

	const lastChild = container.lastElementChild;
	let isSameAuthorAndChannel = lastChild && lastChild.dataset && lastChild.dataset.author === displayAuthor && lastChild.dataset.channel === displayChannel;

	if (isSameAuthorAndChannel) {
		const lastTimeStr = lastChild.dataset.rawtimestamp;
		if (lastTimeStr) {
			const lastDate = new Date(lastTimeStr);
			const newDate = new Date(extendedItem.timestamp);
			if (!isNaN(lastDate) && !isNaN(newDate)) {
				const diffMs = newDate - lastDate;
				if (diffMs > 60_000) {
					isSameAuthorAndChannel = false;
				}
			}
		}
	}
	if (isSameAuthorAndChannel) {
		const msgText = `
	  <div class="message-text" style="margin-top: 0.5rem;">
		  ${extendedItem.message}
	  </div>
	  `;
		lastChild.querySelector('.message-content-wrapper').insertAdjacentHTML('beforeend', msgText);
	} else {
		const panelItem = commMessage.render(extendedItem);
		container.insertAdjacentHTML('beforeend', panelItem);

		const appendedItem = container.lastElementChild;
		appendedItem.dataset.author = displayAuthor;
		appendedItem.dataset.channel = displayChannel;

		const newDate = new Date(extendedItem.timestamp);
		if (!isNaN(newDate)) {
			appendedItem.dataset.timestamp = newDate.toISOString();
		}

		commMessage.attachEvents(appendedItem, extendedItem);
	}

	container.scrollTop = container.scrollHeight;
}

export function storeMessageInSessionStorage(msg) {
	try {
		const historyString = sessionStorage.getItem('chatHistory');
		let history = [];
		if (historyString) {
			history = JSON.parse(historyString);
		}
		history.push(msg);
		sessionStorage.setItem('chatHistory', JSON.stringify(history));
	} catch (err) {
		console.error('Failed to store message in sessionStorage:', err);
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
