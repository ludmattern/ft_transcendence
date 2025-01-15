import componentManagers from "/src/index.js"; // Assurez-vous que HUD est importé
import { header } from "/src/components/pong/header.js";
import { navBar } from "/src/components/pong/navBar.js";
  

  const persistentComponents = [
  ];

  const globalComponents = {
	  header : { selector: "#pong-menu-container", component: header },
	  navBar : { selector: "#pong-menu-container", component: navBar },
	// leftNav: { selector: "#left-nav-container", component: header },
  };
  
  const pages = {
	home: { useGlobals: false, mainComponent: null },
	play: { useGlobals: true, mainComponent: null },
};
// solopPlay : { useGlobals: true, mainComponent: soloPlay },
// multiPlay : { useGlobals: true, mainComponent: multiPlay },
// tournament : { useGlobals: true, mainComponent: tournament },
// leaderboard : { useGlobals: true, mainComponent: leaderboard },
// lost : { useGlobals: false, mainComponent: lost },
  
  const defaultSelector = "#content-window-container";
  
  /**
   * Génère une liste complète de composants à rendre pour une page donnée.
   * @param {string} pageKey - Clé de la page
   * @returns {Array} - Liste des composants à rendre
   */
  function getComponentsForPage(pageKey) {
	if (!pageKey) { pageKey = "home"; }
	const page = pages[pageKey];

	if (!page) {
	  console.warn(`Page "${pageKey}" introuvable.`);
	  return [];
	}
  
	const global = page.useGlobals ? Object.values(globalComponents) : [];
	const specific = page.mainComponent
	  ? [{ selector: defaultSelector, component: page.mainComponent }]
	  : [];
  
	return [...persistentComponents, ...global, ...specific];
  }
  
  /**
   * Rendu des pages
   * @param {string} pageKey - Nom de la page à rendre
   */
  export function renderPongPage(pageKey) {
	console.debug(`Rendering ${pageKey} Page...`);
  
	const componentsToRender = getComponentsForPage(pageKey);
	console.debug(componentsToRender);
  
	const componentKeys = componentsToRender.map(
	  ({ component }) => component.tag
	);
  
	const pongManager = componentManagers.Pong;
  
	pongManager.cleanupComponents(componentKeys);
  
	componentsToRender.forEach(({ selector, component }) => {
		console.debug(selector, component);
		pongManager.loadComponent(selector, component);
	});
  
	console.debug(`${pageKey} Page rendered.`);
  }
  