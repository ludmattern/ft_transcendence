import { loginForm, profileForm, header, footer, leftSideWindow, rightSideWindow, 
	logoutForm, twoFAForm, freeViewButton, socialForm, qrcode ,otherProfileForm, 
	deleteAccountForm, subscribeForm, settingsForm, lostForm, hudSVG, HelmetSVG
} from "/src/components/hud/index.js";
import { midScreen } from "/src/components/midScreen.js";
import { menu3 } from "/src/components/menu3.js";
import { pongMenu } from "/src/components/pong/index.js";
import componentManagers from "/src/index.js"; // Assurez-vous que HUD est importé

/**
 * Composants persistants (toujours chargés)
 */
const persistentComponents = [
  { selector: "#pong-screen-container", component: pongMenu },
  { selector: "#hud-svg-container", component: hudSVG },
  { selector: "#helmet-svg-container", component: HelmetSVG },
  { selector: "#mid-screen-container", component: midScreen },
  { selector: "#menu3-container", component: menu3 },
];

/**
 * Composants globaux par défaut
 */
const globalComponents = {
  header: { selector: "#header-container", component: header },
  leftSideWindow: { selector: "#left-window-container", component: leftSideWindow },
  rightSideWindow: { selector: "#right-window-container", component: rightSideWindow },
  footer: { selector: "#footer-container", component: footer },
};

/**
 * Définition des pages
 */
const pages = {
  login: 			    { useGlobals: false, mainComponent: loginForm },
  twoFAForm: 		  { useGlobals: false, mainComponent: twoFAForm },
  qrcode: 		    { useGlobals: false, mainComponent: qrcode },
  subscribe: 		  { useGlobals: false, mainComponent: subscribeForm },
  lostForm: 		  { useGlobals: false, mainComponent: lostForm },
  profile: 			  { useGlobals: true, mainComponent: profileForm },
  social: 			  { useGlobals: true, mainComponent: socialForm },
  otherprofile: 	{ useGlobals: true, mainComponent: otherProfileForm },
  settings: 	  	{ useGlobals: true, mainComponent: settingsForm },
  deleteAccount: 	{ useGlobals: true, mainComponent: deleteAccountForm },
  logout: 		  	{ useGlobals: true, mainComponent: logoutForm },

  home: {
    useGlobals: true,
    extraComponents: [
      { selector: "#freeView-container", component: freeViewButton }
    ],
  },

  race: 		    	{ useGlobals: true },
  pong: 		    	{ useGlobals: true },
};

/**
 * Sélecteur par défaut pour le composant principal
 */
const defaultSelector = "#central-window";

/**
 * Génère une liste complète de composants à rendre pour une page donnée.
 * @param {string} pageKey - Clé de la page
 * @returns {Array} - Liste des composants à rendre
 */
function getComponentsForPage(pageKey) {
	const page = pages[pageKey];
	if (!page) {
	  console.warn(`Page "${pageKey}" introuvable.`);
	  return [];
	}
  
	const global = page.useGlobals ? Object.values(globalComponents) : [];
	const specific = page.mainComponent
	  ? [{ selector: defaultSelector, component: page.mainComponent }]
	  : [];
  
	// 🔹 Ajouter les composants supplémentaires s'ils existent
	const extra = page.extraComponents || [];
  
	return [...persistentComponents, ...global, ...specific, ...extra];
  }
  
/**
 * Rendu des pages
 * @param {string} pageKey - Nom de la page à rendre
 */
export function renderPage(pageKey) {
  console.debug(`Rendering ${pageKey} Page...`);

  const componentsToRender = getComponentsForPage(pageKey);

  const componentKeys = componentsToRender.map(
    ({ component }) => component.tag
  );

  const hudManager = componentManagers.HUD;

  hudManager.cleanupComponents(componentKeys);

  componentsToRender.forEach(({ selector, component }) => {
    hudManager.loadComponent(selector, component);
  });

  console.debug(`${pageKey} Page rendered.`);
}
