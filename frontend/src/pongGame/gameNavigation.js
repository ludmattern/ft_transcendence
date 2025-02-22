import { switchwindow } from '/src/3d/animation.js';
import { renderPage } from '/src/utils/componentRenderer.js';
import { pongPages } from '/src/pages/pages.js';

/**
 * Fonction générique pour naviguer dans l'application.
 * @param {string} pageKey - Nom de la page
 * @param {boolean} blurEffect - Ajoute ou enlève l'effet blur
 * @param {string|null} windowType - Type de fenêtre à changer (ex: "home", "pong", "race")
 */
export function render(pageKey, windowType = 'pong') {
	renderPage(pongPages, pageKey, 'Pong');

	if (windowType) {
		switchwindow(windowType);
	}
}
