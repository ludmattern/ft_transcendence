import { switchwindow } from '/src/3d/animation.js';
import { renderPage } from '/src/utils/componentRenderer.js';
import { hudPages, pongPages } from '/src/pages/pages.js';

/**
 * Fonction générique pour naviguer dans l'application.
 * @param {string} type - "HUD" ou "Pong"
 * @param {string} pageKey - Nom de la page
 * @param {boolean} blurEffect - Ajoute ou enlève l'effet blur
 * @param {string|null} windowType - Type de fenêtre à changer (ex: "home", "pong", "race")
 */
function navigateTo(type, pageKey, blurEffect = true, waitingScreen = false, windowType = null) {
	const pages = type === 'HUD' ? hudPages : pongPages;
	renderPage(pages, pageKey, type);

	if (blurEffect) {
		document.getElementById('blur-screen-effect').classList.remove('hidden');
	} else {
		document.getElementById('blur-screen-effect').classList.add('hidden');
	}

	if (waitingScreen) {
		document.getElementById('waiting-screen-effect').classList.remove('hidden');
	} else {
		document.getElementById('waiting-screen-effect').classList.add('hidden');
	}

	if (windowType) {
		switchwindow(windowType);
	}
}

export const navigateToForgotPassword = () => navigateTo('HUD', 'forgotPassword', false, true);
export const navigateToDeleteAccount = () => navigateTo('HUD', 'deleteAccount');
export const navigateToOtherProfile = () => navigateTo('HUD', 'otherprofile');
export const navigateToSettings2FA = () => navigateTo('HUD', 'qrcode');
export const navigateToSubscribe = () => navigateTo('HUD', 'subscribe', false, true);
export const navigateBackToPong = () => navigateTo('HUD', 'pong', false, false, 'pong');
export const navigateToSettings = () => navigateTo('HUD', 'settings');
export const navigateToProfile = () => navigateTo('HUD', 'profile');
export const navigateToLoading = () => navigateTo('HUD', 'loading', true, true);
export const navigateToSocial = () => navigateTo('HUD', 'social');
export const navigateToLogout = () => navigateTo('HUD', 'logout');
export const navigateToLogin = () => navigateTo('HUD', 'login', false, true);
export const navigateToHome = () => navigateTo('HUD', 'home', false, false, 'home');
export const navigateToLost = () => navigateTo('HUD', 'lostForm');
export const navigateTo2FA = () => navigateTo('HUD', 'twoFAForm', false, true);

export async function navigateToPong(subroute = null) {
	navigateTo('HUD', 'pong', false, false, 'pong');
	navigateTo('Pong', subroute || 'home', false, false);
}

export const navigateToRace = () => navigateTo('HUD', 'race', false, false, 'race');
