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
import { render } from '/src/pongGame/gameNavigation.js';
import { emit } from '/src/services/eventEmitter.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { pushInfo,getInfo, deleteInfo} from '/src/services/infoStorage.js';

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
export async function handleRoute(route, shouldPushState = true, internal = false) {
	if (route === '/loading') {
		processRoute(route, shouldPushState);
		return;
	}

	const isAuthenticated = await isClientAuthenticated();
	const isRoutePublic = isAuthenticatedRoute(route);

	if (internal) {
		console.log('internal route');
		if (isAuthenticated) {
			processInternalRoute(route, shouldPushState);
			return;
		} else {
			processRoute('/login', shouldPushState);
			return;
		}
	}

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
	console.log('processRoute : ' + route);
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

	console.log('finalRoute : ' + finalRoute);

	if (routeMappings[finalRoute]) {
		routeMappings[finalRoute]();
	} else if (finalRoute.startsWith('/social/pilot=')) {
		const pilot = finalRoute.split('=')[1];
		navigateToOtherProfile();
	} else if (finalRoute.startsWith('/pong')) {
		console.log('navigateToPong : ' + finalRoute.substring(6));
		navigateToPong(finalRoute.substring(6));
	} else {
		navigateToLost();
	}
}

function processInternalRoute(route, shouldPushState) {
	// updatePreviousRoute(route);

	// if (!shouldPushState) {
	// 	history.pushState(null, "", route);
	// }

	// emit("routeChanged", route);

	render(route);
}
/**
 * Retourne la dernière route visitée.
 */
export function getPreviousRoute() {
	return previousRoute || '/';
}

/**
 * Retourne la dernière sous-route visitée dans /pong/play.
 */
export function getPreviousPongPlaySubRoute() {
	return previousPongPlaySubRoute || '/pong/play';
}

window.addEventListener('popstate', () => {
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
	console.log('Vérification du statut du tournoi...');
	try {
		const data = await getCurrentTournamentInformation();
		let route;
		if (data.tournament === null) {
			console.log('Aucun tournoi en cours ou à venir.');
			route = '/pong/play/tournament';
			if (caller === '/pong/play/tournament-creation') {
				console.log('Va créer un tournoi, aucune redirection.');
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
			console.log('Déjà sur la page demandée, aucune redirection effectuée.');
			return false;
		}

		console.log('Redirection vers la route :', route);
		handleRoute(route);
		return true;
	} catch (error) {
		console.error('Erreur lors de la redirection du tournoi :', error);
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
		console.log('Statut du tournoi récupéré :', data);
		return data;
	} catch (error) {
		console.error('Erreur lors de la récupération du statut du tournoi:', error);
		throw error;
	}
}
