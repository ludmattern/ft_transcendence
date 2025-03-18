import { createComponent } from '/src/utils/component.js';
import { showContextMenu } from '/src/components/hud/sideWindow/left/contextMenu.js';

function safeToISOString(timestamp) {
	if (!timestamp) return '';

	let dt = new Date(timestamp);
	if (isNaN(dt)) {
		const fallbackString = new Date().toDateString() + ' ' + timestamp;
		dt = new Date(fallbackString);
		if (isNaN(dt)) {
			return '';
		}
	}
	return dt.toISOString();
}

function formatTimestamp(timestamp) {
	let dateObj = new Date(timestamp);

	if (isNaN(dateObj)) {
		const fallbackString = new Date().toDateString() + ' ' + timestamp;
		dateObj = new Date(fallbackString);
	}

	return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export const commMessage = createComponent({
	tag: 'commMessage',

	render: (item) => {
		const isUser = !!item.isUser;
		const isPrivate = item.channel === 'Private';
		let displayName;
		if (isUser) {
			displayName = isPrivate ? '@' + item.recipient || 'Unknown' : 'You';
		} else {
			displayName = '@' + item.username;
		}
		const rawTimestamp = safeToISOString(item.timestamp);

		return `
		<div class="message ${isUser ? 'user-message' : 'other-message'}" 
			 style="${isPrivate ? 'color: #ffff59;' : 'color: var(--content-color);'}"
			 data-rawtimestamp="${rawTimestamp}">
		  ${
				!isUser
					? `<img class="profile-picture" 
				   src="/media${item.profilePicture || '/src/assets/img/default-profile-40.png'}" 
				   alt="${displayName}'s profile picture" />`
					: ''
			}
		  <div class="message-content-wrapper" style="max-width: ${isUser ? '100%' : 'inherit'};">
			<div class="message-header">
			  <span class="channel">${isPrivate ? '[Private]' : '[General]'}</span>
			  <span class="author${displayName === 'You' ? ' me' : ''}">${displayName}</span>
			  <span class="timestamp">${formatTimestamp(item.timestamp)}</span>
			</div>
			<div class="message-text" style="margin-top: 0.5rem;">
				${escapeHtml(item.message)}
			</div>
		  </div>
		</div>
	  `;
	},

	attachEvents: (el, item) => {
		// Attacher le menu contextuel uniquement si l'élément .author ne possède pas la classe "me"
		const authorElem = el.querySelector('.author');
		if (authorElem && !authorElem.classList.contains('me')) {
			authorElem.addEventListener('click', (e) => {
				e.preventDefault();
				showContextMenu(item, e);
			});
		}
	},
});
