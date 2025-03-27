// src/components/hud/notifications.js
import { emit } from '/src/services/eventEmitter.js';

let notificationBuffer = [];

/**
 * @param {string} message
 * @param {number} [duration=5000]
 */
function collapseNotification(notification) {
	notification.classList.add('collapsing');

	notification.addEventListener('transitionend', function handler(e) {
		if (e.propertyName === 'height') {
			notification.removeEventListener('transitionend', handler);
			notification.remove();

			processNotificationBuffer();
		}
	});
}

function processNotificationBuffer() {
	const container = document.getElementById('bottom-notification-container');
	while (container.childElementCount < 3 && notificationBuffer.length > 0) {
		const { message, duration, error } = notificationBuffer.shift();
		createNotificationMessage(message, duration, error);
	}
}

/**
 * @param {string} message
 * @param {number} [duration=2500]
 */
export function createNotificationMessage(message, duration = 2500, error = false) {
	const container = document.getElementById('bottom-notification-container');
	if (!container) {
		console.error('Notification container has not been found');
		return;
	}

	if (container.childElementCount >= 3) {
		notificationBuffer.push({ message, duration, error });
		return;
	}

	const notification = document.createElement('div');
	notification.classList.add('notification-message');
	if (error) notification.classList.add('error');
	notification.innerHTML = message;
	container.appendChild(notification);

	notification.offsetWidth;
	notification.classList.add('visible');

	setTimeout(() => {
		notification.classList.remove('visible');
		setTimeout(() => {
			collapseNotification(notification);
		}, 300);
	}, duration);
}

export function removePrivateNotifications() {
	notificationBuffer = notificationBuffer.filter(({ message }) => {
		return !(message && message.includes('private message'));
	});
}

export async function updateAndCompareInfoData() {
	try {
		const response = await fetch(`/api/user-service/info-getter/`, {
			method: 'GET',
			credentials: 'include',
		});
		const result = await response.json();

		if (result.info) {
			let localInfo = [];
			const localInfoStr = sessionStorage.getItem('infoTabData');
			if (localInfoStr) {
				try {
					const parsedInfo = JSON.parse(localInfoStr);
					localInfo = Array.isArray(parsedInfo) ? parsedInfo : [];
				} catch (err) {
					localInfo = [];
				}
			}

			const serverInfo = Array.isArray(result.info) ? result.info : [];
			const messagesToAdd = serverInfo.filter((newMsg) => !localInfo.some((localMsg) => localMsg.type === newMsg.type && localMsg.inviter_id === newMsg.inviter_id));
			const messagesToRemove = localInfo.filter((localMsg) => !serverInfo.some((newMsg) => newMsg.type === localMsg.type && newMsg.inviter_id === localMsg.inviter_id));

			if (messagesToAdd.length > 0 || messagesToRemove.length > 0) {
				emit('updatenotifications', { toAdd: messagesToAdd, toRemove: messagesToRemove });
			}

			sessionStorage.setItem('infoTabData', JSON.stringify(serverInfo));
		}
	} catch (error) {
		console.error('Error while updating information: ', error);
	}
}
