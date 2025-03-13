import { getCurrentWindow } from '/src/3d/animation.js';
import { handleRoute, getPreviousPongPlaySubRoute } from '/src/services/router.js';

/**
 * Commence une animation sur un élément.
 *
 * @param {HTMLElement} target - L'élément cible.
 * @param {string} animation - Le nom de l'animation.
 * @param {number} delay - Le délai en milisecondes avant le début de l'animation.
 */
export async function startAnimation(target, animation, delay = 0) {
	const elements = target instanceof NodeList || Array.isArray(target) ? target : [target];

	setTimeout(() => {
		elements.forEach((element) => {
			if (!element) return;

			element.classList.add(animation);
			element.addEventListener(
				'animationend',
				() => {
					element.classList.remove(animation);
					element.style.opacity = '1';
				},
				{ once: true }
			);
		});
	}, delay);
}

/**
 * Attend que l'élément correspondant au sélecteur soit présent dans le DOM.
 * @param {string} selector - Le sélecteur CSS de l'élément recherché.
 * @param {number} timeout - Temps maximal en ms à attendre (par défaut 5000ms).
 * @returns {Promise<HTMLElement>} - Une promesse résolue avec l'élément, ou rejetée après timeout.
 */
export function waitForElement(selector, timeout = 5000) {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();
		const interval = setInterval(() => {
			const element = document.querySelector(selector);
			if (element) {
				clearInterval(interval);
				resolve(element);
			} else if (Date.now() - startTime > timeout) {
				clearInterval(interval);
				reject(new Error(`Element "${selector}" not found within timeout`));
			}
		}, 50); // vérifie toutes les 50ms
	});
}

export function closeCentralWindow() {
	const currentWindow = getCurrentWindow();
	switch (currentWindow) {
		case 'home':
			handleRoute('/');
			break;
		case 'pong':
			handleRoute(getPreviousPongPlaySubRoute());
			break;
		case 'race':
			handleRoute('/race');
			break;
		default:
			handleRoute('/');
	}
}