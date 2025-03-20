import { isClientAuthenticated } from '/src/services/auth.js';
import {
	navigateToSubscribe,
	navigateToLogin,
	navigateToHome,
	navigateToProfile,
	navigateToPong,
	navigateToRace,
	navigateToSocial,
	navigateToSettings,
	navigateToLogout,
	navigateToOtherProfile,
	navigateToDeleteAccount,
	navigateToLost,
	navigateTo2FA,
	navigateBackToPong,
	navigateToSettings2FA,
	navigateToLoading,
	navigateToForgotPassword,
} from '/src/services/navigation.js';
import { emit } from '/src/services/eventEmitter.js';
import { pushInfo } from '/src/services/infoStorage.js';
import Store from '/src/3d/store.js';

let previousRoute = null;
let previousPongSubRoute = null;
let previousPongPlaySubRoute = null;

const routeMappings = {
	'/': navigateToHome,
	'/profile': navigateToProfile,
	'/race': navigateToRace,
	'/social': navigateToSocial,
	'/settings': navigateToSettings,
	'/settings/delete-account': navigateToDeleteAccount,
	'/logout': navigateToLogout,
	'/login/2fa': navigateTo2FA,
	'/register/qr': navigateToSettings2FA,
	'/login': navigateToLogin,
	'/subscribe': navigateToSubscribe,
	'/topong': navigateBackToPong,
	'/loading': navigateToLoading,
	'/forgot-password': navigateToForgotPassword,
};

const publicRoutes = new Set(['/login', '/login/2fa', '/subscribe', '/register/qr', '/forgot-password']);

export function setPreviousPongPlaySubRoute(subroute) {
	previousPongPlaySubRoute = subroute;
}

export function resetPreviousRoutes() {
	previousRoute = null;
	previousPongSubRoute = null;
	previousPongPlaySubRoute = null;
}

/**
 * Vérifie si une route nécessite une authentification.
 * @param {string} route - La route à vérifier.
 * @returns {boolean} - `true` si une authentification est requise, sinon `false`.
 */
function isAuthenticatedRoute(route) {
	return publicRoutes.has(route);
}

/**
 * Met à jour la mémoire des routes précédentes.
 * @param {string} route - Nouvelle route visitée.
 */
function updatePreviousRoute(route) {
	previousRoute = window.location.pathname;

	if (route.startsWith('/pong/play')) {
		previousPongPlaySubRoute = route;
	}
	if (route.startsWith('/pong')) {
		const subroute = route.substring(6);
		previousPongSubRoute = subroute === 'home' ? null : subroute;
	}
}

/**
 * Gère la navigation vers une route donnée.
 * @param {string} route - La route à gérer.
 * @param {boolean} shouldPushState - Si `true`, met à jour l'historique du navigateur.
 */
export async function handleRoute(route, shouldPushState = true) {
	emit('routing');
	if (route === '/loading') {
		processRoute(route, shouldPushState);
		return;
	}

	const isAuthenticated = await isClientAuthenticated();
	const isRoutePublic = isAuthenticatedRoute(route);

	if ((!isRoutePublic && isAuthenticated) || (isRoutePublic && !isAuthenticated)) {
		processRoute(route, shouldPushState);
	} else if (isRoutePublic && isAuthenticated) {
		processRoute('/', shouldPushState);
	} else {
		processRoute('/login', shouldPushState);
	}
}

/**
 * Exécute la navigation après vérification d'authentification.
 * @param {string} route - La route à naviguer.
 * @param {boolean} shouldPushState - Si `true`, met à jour l'historique.
 */
function processRoute(route, shouldPushState) {
	updatePreviousRoute(route);

	let finalRoute = route;

	if (route === '/topong') {
		finalRoute = previousPongSubRoute ? `/pong/${previousPongSubRoute}` : '/pong';
	}

	if (shouldPushState) {
		const cleanRoute = finalRoute.replace(/\/{2,}/g, '/').trim();
		history.pushState(null, '', cleanRoute);
	}

	emit('routeChanged', finalRoute);

	if (routeMappings[finalRoute]) {
		routeMappings[finalRoute]();
	} else if (finalRoute.startsWith('/social/pilot=')) {
		navigateToOtherProfile();
	} else if (finalRoute.startsWith('/pong')) {
		navigateToPong(finalRoute.substring(6));
	} else {
		navigateToLost();
	}
}

export function getPreviousRoute() {
	return previousRoute || '/';
}

export function getPreviousPongPlaySubRoute() {
	return previousPongPlaySubRoute || '/pong/play';
}

window.addEventListener('popstate', () => {
	if (Store.isCameraMoving) {
		return;
	}
	handleRoute(window.location.pathname, false);
});

export function notAuthenticatedThenRedirect() {
	if (!isClientAuthenticated()) {
		processRoute('/login', shouldPushState);
		return true;
	}
	return false;
}

/**
 * Vérifie le statut du tournoi et redirige l'utilisateur en fonction de la source d'appel.
 * @param {string} caller - Indique la page actuelle ou la source d'appel (par exemple, 'play/tournament').
 * @returns {boolean} - `true` si une redirection a été effectuée, sinon `false`.
 * Si la sous-route déterminée correspond déjà à cette valeur, la redirection est évitée.
 */
export async function handleTournamentRedirection(caller = '') {
	try {
		const data = await getCurrentTournamentInformation();
		let route;
		if (data.tournament === null) {
			route = '/pong/play/tournament';
			if (caller === '/pong/play/tournament-creation') {
				return false;
			}
		} else if (data.status === 'ongoing') {
			route = '/pong/play/current-tournament';
		} else if (data.status === 'upcoming') {
			route = '/pong/play/tournament-creation';
		} else {
			route = '/pong/play/tournament';
		}

		if (data.tournament_id && data.mode && data.mode !== 'local') {
			pushInfo('tournamentMode', data.mode);
		}

		if (caller === route) {
			return false;
		}

		handleRoute(route);
		return true;
	} catch (error) {
		if (caller !== '/pong/play/tournament') {
			handleRoute('/pong/play/tournament');
			return true;
		}
		return false;
	}
}

export async function getCurrentTournamentInformation() {
	try {
		const response = await fetch('/api/tournament-service/getCurrentTournamentInformation/', {
			method: 'GET',
			credentials: 'include',
		});
		if (!response.ok) {
			throw new Error('Impossible de récupérer le statut du tournoi.');
		}
		const data = await response.json();
		return data;
	} catch (error) {
		throw error;
	}
}
