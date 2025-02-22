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
} from '/src/services/navigation.js';
import { render } from '/src/pongGame/gameNavigation.js';
import { emit } from '/src/services/eventEmitter.js';
import { getInTournament } from '/src/index.js';

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
};

const publicRoutes = new Set(['/login', '/login/2fa', '/subscribe', '/register/qr']);

export function setPreviousPongPlaySubRoute(subroute) {
	previousPongPlaySubRoute = subroute;
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
	let inTournament = getInTournament();

	if (route === '/topong') {
		finalRoute = previousPongSubRoute ? `/pong/${previousPongSubRoute}` : '/pong';
	}

	if (shouldPushState) {
		if (finalRoute.startsWith('/pong') && inTournament) {
			history.pushState(null, '', '/pong/tournament');
		} else {
			const cleanRoute = finalRoute.replace(/\/{2,}/g, '/').trim();
			history.pushState(null, '', cleanRoute);
		}
	}

	emit('routeChanged', finalRoute);

	console.log('finalRoute : ' + finalRoute);

	if (routeMappings[finalRoute]) {
		routeMappings[finalRoute]();
	} else if (finalRoute.startsWith('/social/pilot=')) {
		const pilot = finalRoute.split('=')[1];
		navigateToOtherProfile(pilot);
	} else if (finalRoute.startsWith('/pong')) {
		console.log('navigateToPong : ' + finalRoute.substring(6));
		if (inTournament) {
			navigateToPong('tournament');
		} else {
			navigateToPong(finalRoute.substring(6));
		}
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
