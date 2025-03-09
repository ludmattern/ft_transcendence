// contextMenu.js
import { createComponent } from '/src/utils/component.js';
import { waitForElement } from '/src/components/hud/utils/utils.js';
import { ws } from '/src/services/websocket.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { handleRoute } from '/src/services/router.js';
import { getUsername } from '/src/pongGame/gameManager.js';
export const contextMenu = createComponent({
	tag: 'contextMenu',

	// Génère le HTML du menu contextuel en fonction de l'item et d'un objet userStatus
	render: (userStatus) => `
    <div id="context-menu" class="context-menu">
      <ul>
        <li id="action-friend">${userStatus.isFriend ? 'Remove Friend' : 'Add Friend'}</li>
        <li id="action-block">Block</li>
        <li id="action-invite">Invite</li>
        <li id="action-profile">Profile</li>
        <li id="action-message">Message</li>
      </ul>
    </div>
  `,

	// Attache les événements aux boutons du menu
	attachEvents: async (el, item, userStatus) => {
		el.querySelector('#action-friend').addEventListener('click', () => {
			handleFriendAction(userStatus.isFriend, item.author);
			hideContextMenu();
		});
		el.querySelector('#action-block').addEventListener('click', () => {
			handleBlockAction(item.author);
			hideContextMenu();
		});
		el.querySelector('#action-invite').addEventListener('click', () => {
			handleInviteAction(item.author);
			hideContextMenu();
		});
		el.querySelector('#action-profile').addEventListener('click', () => {
			handleProfileAction(item.author);
			hideContextMenu();
		});
		el.querySelector('#action-message').addEventListener('click', () => {
			handleMessageAction(item.username);
			hideContextMenu();
		});
	},
});

/**
 * Gestion des actions du menu contextuel.
 */

export async function handleFriendAction(isFriend, author) {
	let action;
	if (isFriend) {
		action = 'remove_friend';
		console.log(`Removing ${author} from friends...`);
	} else {
		action = 'send_friend_request';
		console.log(`Adding ${author} to friends...`);
	}
	const payload = {
		type: 'info_message',
		action,
		recipient: author,
		timestamp: new Date().toISOString(),
	};

	ws.send(JSON.stringify(payload));
}


async function handleBlockAction(author) {
	const payload = {
		type: 'info_message',
		action: 'block_user',
		recipient: author,
		timestamp: new Date().toISOString(),
	};

	ws.send(JSON.stringify(payload));
}

function handleInviteAction(author) {
	const payload = {
		type: 'info_message',
		action: 'private_game_invite',
		recipient: author,
		timestamp: new Date().toISOString(),
	};
	ws.send(JSON.stringify(payload));
}

async function handleProfileAction(author) {
	const username = await getUsername(author);
	handleRoute(`/social/pilot=${username}`);
}

function handleMessageAction(author) {
	console.log(`Messaging ${author}...`);

	const activeTab = document.querySelector('.nav-link.active');
	if (activeTab && activeTab.dataset.tab !== 'comm') {
		const commTab = document.querySelector('.nav-link[data-tab="comm"]');
		if (commTab) {
			commTab.click();
		}
		waitForElement('#l-tab-content-container #message-input')
			.then((inputField) => {
				inputField.value = '@' + author + ' ';
				inputField.focus();
			})
			.catch((error) => {
				console.error(error);
			});
	} else {
		const inputField = document.querySelector('#l-tab-content-container #message-input');
		if (inputField) {
			inputField.value = '@' + author + ' ';
			inputField.focus();
		}
	}
}

/**
 * Affiche le menu contextuel à la position du clic droit.
 * @param {Object} item - L'objet associé au message.
 * @param {MouseEvent} event - L'événement contextmenu.
 */
export async function showContextMenu(item, event) {
	console.log('showContextMenu', item, event);
	event.preventDefault();
	event.stopPropagation();

	hideContextMenu();

	if (!item.author) {
		item.author = item.inviter_id;
		item.username = item.inviter;
	} else if (item.author === 'USER') {
		item.author = item.recipient_id;
		item.username = item.recipient;
	}
	const isFriend = await isUserFriend(item.author);

	const userStatus = {
		isFriend: isFriend,
		isBlocked: false,
	};

	const menuHTML = contextMenu.render(item, userStatus);
	document.body.insertAdjacentHTML('beforeend', menuHTML);
	const menuElement = document.getElementById('context-menu');

	menuElement.style.left = event.pageX + 'px';
	menuElement.style.top = event.pageY + 'px';
	menuElement.style.display = 'block';

	contextMenu.attachEvents(menuElement, item, userStatus);
}

/**
 * Cache et supprime le menu contextuel s'il existe.
 */
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

export async function isUserFriend(otherUserId) {
	console.log(`Checking if the current user is friends with ${otherUserId}...`);
	const response = await fetch('/api/user-service/is-friend/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include', 
		body: JSON.stringify({ otherUserId: otherUserId }),
	});
	const data = await response.json();
	if (data.success) {
		return data.is_friend;
	} else {
		console.log('Error getting friend status:', data.error);
		return false;
	}
}
