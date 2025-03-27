import { getCurrentWindow } from '/src/3d/animation.js';
import { handleRoute, getPreviousPongPlaySubRoute } from '/src/services/router.js';

/**
 * @param {HTMLElement} target
 * @param {string} animation
 * @param {number} delay
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
 * @param {string} selector
 * @param {number} timeout
 * @returns {Promise<HTMLElement>}
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
		}, 50);
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
