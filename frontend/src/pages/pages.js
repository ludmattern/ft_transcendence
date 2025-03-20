import {
	loginForm,
	profileForm,
	header,
	footer,
	leftSideWindow,
	rightSideWindow,
	logoutForm,
	twoFAForm,
	socialForm,
	qrcode,
	otherProfileForm,
	hudScreenEffect,
	deleteAccountForm,
	subscribeForm,
	settingsForm,
	lostForm,
	hudSVG,
	HelmetSVG,
	loadingScreen,
	forgotPassword,
	headerIngame,
} from '/src/components/hud/index.js';

import {
	header as pongHeader,
	navBar,
	homeContent,
	pongPageSkeleton,
	soloContent,
	tournamentCreation,
	multiplayerContent,
	tournamentContent,
	currentTournament,
	lost,
	leaderboard,
} from '/src/components/pong/index.js';

import { midScreen } from '/src/components/midScreen.js';
import { menu3 } from '/src/components/menu3.js';
import { pongMenu } from '/src/components/pong/index.js';

export const backgroundComponents = [
	{ selector: '#hud-svg-container', component: hudSVG },
	{ selector: '#helmet-svg-container', component: HelmetSVG },
	{ selector: '#hud-screen-container', component: hudScreenEffect },
];

export const persistentComponents = [
	{ selector: '#pong-screen-container', component: pongMenu },
	{ selector: '#mid-screen-container', component: midScreen },
	{ selector: '#menu3-container', component: menu3 },
];

export const globalComponents = [
	{ selector: '#header-container', component: header },
	{ selector: '#left-window-container', component: leftSideWindow },
	{ selector: '#right-window-container', component: rightSideWindow },
	{ selector: '#footer-container', component: footer },
];

/**
 * Factory function pour créer une page HUD.
 * @param {any} centralComponent - Composant à placer dans le container central (facultatif)
 * @param {Object} options - Options supplémentaires
 * @param {boolean} options.includeGlobal - Indique si les composants globaux doivent être inclus (défaut: false)
 * @param {Array} options.extras - Composants supplémentaires à ajouter
 * @returns {Object} Configuration de la page HUD
 */
const createHudPage = (centralComponent = null, { includeGlobal = false, extras = [] } = {}) => {
	let components = [...backgroundComponents, ...persistentComponents];
	if (includeGlobal) {
		components = [...components, ...globalComponents];
	}
	if (centralComponent) {
		components.push({ selector: '#central-window', component: centralComponent });
	}
	if (extras.length) {
		components = [...components, ...extras];
	}
	return { components };
};

export const hudPages = {
	login: createHudPage(loginForm),
	forgotPassword: createHudPage(forgotPassword),
	twoFAForm: createHudPage(twoFAForm),
	qrcode: createHudPage(qrcode),
	subscribe: createHudPage(subscribeForm),
	lostForm: createHudPage(lostForm),
	loading: {
		components: [
			{ selector: '#hud-screen-container', component: hudScreenEffect },
			{ selector: '#helmet-svg-container', component: HelmetSVG },
			{ selector: '#central-window', component: loadingScreen },
		],
	},
	profile: createHudPage(profileForm, { includeGlobal: true }),
	social: createHudPage(socialForm, { includeGlobal: true }),
	otherprofile: createHudPage(otherProfileForm, { includeGlobal: true }),
	settings: createHudPage(settingsForm, { includeGlobal: true }),
	deleteAccount: createHudPage(deleteAccountForm, { includeGlobal: true }),
	logout: createHudPage(logoutForm, { includeGlobal: true }),
	inGame: {
		components: [
			...backgroundComponents,
			...persistentComponents,
			{ selector: '#header-container', component: headerIngame },
			{ selector: '#left-window-container', component: leftSideWindow },
			{ selector: '#right-window-container', component: rightSideWindow },
			{ selector: '#footer-container', component: footer },
		],
	},
	home: createHudPage(null, { includeGlobal: true }),
	race: createHudPage(null, { includeGlobal: true }),
	pong: createHudPage(null, { includeGlobal: true }),
};

/**
 * Factory function pour créer une page Pong.
 * @param {Array} centralComponents - Composants spécifiques à ajouter dans le container principal
 * @param {boolean} [includeNavBar=true] - Indique s'il faut inclure la navbar ou non
 * @returns {Object} Configuration de la page Pong
 */
const createPongPage = (centralComponents = [], includeNavBar = true) => ({
	components: [
		{ selector: '#pong-skeleton-container', component: pongPageSkeleton },
		{ selector: '#pong-header-container', component: pongHeader },
		...(includeNavBar ? [{ selector: '#content-window-container', component: navBar }] : []),
		...centralComponents,
	],
});

export const pongPages = {
	home: {},
	play: createPongPage([{ selector: '#content-window-container', component: homeContent }]),
	'play/solo': createPongPage([{ selector: '#content-window-container', component: soloContent }]),
	'play/multiplayer': createPongPage([{ selector: '#content-window-container', component: multiplayerContent }]),
	'play/tournament': createPongPage([{ selector: '#content-window-container', component: tournamentContent }]),
	'play/tournament-creation': createPongPage([{ selector: '#content-window-container', component: tournamentCreation }], false),
	'play/current-tournament': createPongPage([{ selector: '#content-window-container', component: currentTournament }], false),
	leaderboard: createPongPage([{ selector: '#content-window-container', component: leaderboard }]),
	lost: createPongPage([{ selector: '#content-window-container', component: lost }]),
};
