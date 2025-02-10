import componentManagers from "/src/index.js";

/**
 * Récupère les composants à charger pour une page donnée
 */
function getComponentsForPage(pages, pageKey) {
  return pages[pageKey]?.components || [];
}

export function renderPage(pages, pageKey, managerType) {
	if (!pages.hasOwnProperty(pageKey)) {
	  console.warn(`Page "${pageKey}" introuvable.`);
	  if (managerType === "Pong") {
		console.warn(`Redirection vers la page "lost"...`);
		renderPage(pages, "lost", managerType);
	  }
	  return;
	}
  
	const componentsToRender = getComponentsForPage(pages, pageKey);
	const componentKeys = componentsToRender.map(({ component }) => component.tag);
	const manager = componentManagers[managerType];
  
	manager.cleanupComponents(componentKeys);
	componentsToRender.forEach(({ selector, component }) => {
	  manager.loadComponent(selector, component);
	});
  }
