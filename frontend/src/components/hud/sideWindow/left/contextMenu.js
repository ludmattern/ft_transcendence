import { createComponent } from '/src/utils/component.js';
import { waitForElement } from '/src/components/hud/utils/utils.js';
import { ws } from '/src/services/websocket.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { handleRoute } from '/src/services/router.js';
import { getUsername } from '/src/pongGame/gameManager.js';
import { playGame } from '/src/components/pong/play/utils.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';

function sendWsInfoMessage(action, recipient) {
	const payload = {
		type: 'info_message',
		action,
		recipient,
		timestamp: new Date().toISOString(),
	};
	ws.send(JSON.stringify(payload));
}

function resolveUser(item) {
	if (!item.author) {
		return { author: item.inviter_id, username: item.inviter };
	}
	if (item.author === 'USER') {
		return { author: item.recipient_id, username: item.recipient };
	}
	return { author: item.author, username: item.username };
}

export const contextMenu = createComponent({
	tag: 'contextMenu',

	render: (userStatus) => `
    <div id="context-menu" class="context-menu">
      <ul>
        <li id="action-friend">${userStatus.is_friend ? 'Remove Friend' : 'Add Friend'}</li>
        <li id="action-block">${userStatus.is_blocked && userStatus.can_unblock ? 'Unblock' : 'Block'}</li>
        <li id="action-invite">Invite</li>
        <li id="action-profile">Profile</li>
        <li id="action-message">Message</li>
      </ul>
    </div>
  `,

	attachEvents: async (el, item, userStatus) => {
		const actions = {
			'action-friend': () => handleFriendAction(userStatus.is_friend, item.author),
			'action-block': () => handleBlockAction(item.author, userStatus.is_blocked),
			'action-invite': () => handleInviteAction(item.author),
			'action-profile': () => handleProfileAction(item.author),
			'action-message': async () => await handleMessageAction(item.username),
		};

		Object.entries(actions).forEach(([id, actionFn]) => {
			const element = el.querySelector(`#${id}`);
			if (element) {
				element.addEventListener('click', async () => {
					await actionFn();
					hideContextMenu();
				});
			}
		});
	},
});

export async function handleFriendAction(is_friend, author) {
	const action = is_friend ? 'remove_friend' : 'send_friend_request';
	sendWsInfoMessage(action, author);
}

async function handleBlockAction(author, is_blocked) {
	const action = is_blocked ? 'unblock_user' : 'block_user';
	sendWsInfoMessage(action, author);
}

async function handleInviteAction(author) {
	sendWsInfoMessage('private_game_invite', author);
	const config = {
		gameMode: 'private',
		action: 'create',
		matchkey: await getUserIdFromCookieAPI(),
		type: 'fullScreen',
	};
	playGame(config);
}

async function handleProfileAction(author) {
	const username = await getUsername(author);
	if (!username) {
		createNotificationMessage('this user left the Space Force', 2500, true);
		return;
	}
	handleRoute(`/social/pilot=${username}`);
}

async function handleMessageAction(username) {
	const activeTab = document.querySelector('.nav-link.active');
	const setMessageInput = async () => {
		const inputField = await waitForElement('#l-tab-content-container #message-input');
		inputField.value = '@' + username + ' ';
		inputField.focus();
	};

	if (activeTab && activeTab.dataset.tab !== 'comm') {
		const commTab = document.querySelector('.nav-link[data-tab="comm"]');
		if (commTab) {
			commTab.click();
		}
		try {
			await setMessageInput();
		} catch (error) {
			console.error(error);
		}
	} else {
		const inputField = document.querySelector('#l-tab-content-container #message-input');
		if (inputField) {
			inputField.value = '@' + username + ' ';
			inputField.focus();
		}
	}
}

import { getCurrentWindow } from '/src/3d/animation.js';

export async function showContextMenu(item, event) {
	event.preventDefault();
	event.stopPropagation();

	const currentWindow = getCurrentWindow();
	if (currentWindow === 'game') {
		createNotificationMessage('stay focus on the game pilot !', 2500, true);
		return;
	}

	hideContextMenu();

	const { author, username } = resolveUser(item);
	item.author = author;
	item.username = username;

	const userStatus = await getRelationshipStatus(author);
	if (!userStatus || !userStatus.success) {
		return;
	}

	if (userStatus.is_me) {
		return;
	}

	const menuHTML = contextMenu.render(userStatus);
	document.body.insertAdjacentHTML('beforeend', menuHTML);
	const menuElement = document.getElementById('context-menu');
	menuElement.style.left = event.pageX + 'px';
	menuElement.style.top = event.pageY + 'px';
	menuElement.style.display = 'block';

	contextMenu.attachEvents(menuElement, item, userStatus);
}

export function hideContextMenu() {
	const menuElement = document.getElementById('context-menu');
	if (menuElement) {
		menuElement.remove();
	}
}

document.addEventListener('click', (e) => {
	if (!e.target.closest('.context-menu')) {
		hideContextMenu();
	}
});

export async function getRelationshipStatus(otherUserId) {
	try {
		const response = await fetch('/api/user-service/get-relationship-status/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
			body: JSON.stringify({ otherUserId }),
		});
		const data = await response.json();
		if (data.success) {
			return data;
		} else {
			createNotificationMessage('this user left the Space Force', 2500, true);
			return null;
		}
	} catch (error) {
		createNotificationMessage('this user left the Space Force', 2500, true);
		return null;
	}
}

export async function isUserFriend(otherUserId) {
	const status = await getRelationshipStatus(otherUserId);
	return status ? status.is_friend : null;
}
