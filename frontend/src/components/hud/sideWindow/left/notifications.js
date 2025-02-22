// src/components/hud/notifications.js

let notificationBuffer = [];

/**
 * Crée et affiche une notification qui fade-in, reste visible pendant une durée donnée,
 * puis s'effondre en douceur avant d'être retirée du DOM.
 *
 * @param {string} message - Le contenu HTML ou texte de la notification.
 * @param {number} [duration=5000] - La durée en millisecondes avant de lancer le collapse (par défaut 30s).
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

/**
 * Traite les notifications en attente dans la file d'attente.
 */
function processNotificationBuffer() {
	const container = document.getElementById('bottom-notification-container');
	while (container.childElementCount < 3 && notificationBuffer.length > 0) {
		const { message, duration } = notificationBuffer.shift();
		createNotificationMessage(message, duration);
	}
}

/**
 * Crée et affiche une notification qui fade-in, reste visible pendant une durée donnée,
 *
 * @param {string} message - Le contenu HTML ou texte de la notification.
 * @param {number} [duration=2500] - La durée en millisecondes avant de lancer le collapse (par défaut 30s).
 */
export function createNotificationMessage(message, duration = 2500, error = false) {
	const container = document.getElementById('bottom-notification-container');
	if (!container) {
		console.error("Le container de notification n'a pas été trouvé.");
		return;
	}

	if (container.childElementCount >= 3) {
		notificationBuffer.push({ message, duration });
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
	console.log('Mise à jour des informations...');
	const userId = sessionStorage.getItem('userId');

	try {
		console.log('GET info getter with userId', userId);
		const response = await fetch(`/api/user-service/info-getter/${encodeURIComponent(userId)}/`, {
			method: 'GET',
			credentials: 'include',
		});
		const result = await response.json();

		console.log('Info getter result:', result);
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
			console.log('Informations locales :', localInfo);
			console.log('Informations serveur :', serverInfo);

			const newMessages = serverInfo.filter((newMsg) => !localInfo.some((localMsg) => localMsg.id === newMsg.id));

			if (newMessages.length > 0) {
				console.log('Nouveaux messages :', newMessages);
			} else {
				console.log('Aucun nouveau message.');
			}

			sessionStorage.setItem('infoTabData', JSON.stringify(serverInfo));
		} else {
			console.log('Erreur lors de la récupération des informations depuis le serveur.');
		}
	} catch (error) {
		console.error('Erreur lors de la mise à jour des informations :', error);
	}
}
