import componentManagers from "/src/index.js";

/**
 * Récupère les composants à charger pour une page donnée
 */
function getComponentsForPage(pages, pageKey) {
  return pages[pageKey]?.components || [];
}

export function renderPage(pages, pageKey, managerType) {
	console.debug(`Rendering ${pageKey} Page...`);
  
	// Vérifier si la page existe
	if (!pages.hasOwnProperty(pageKey)) {
	  console.warn(`Page "${pageKey}" introuvable.`);
	  if (managerType === "Pong") {
		console.warn(`Redirection vers la page "lost"...`);
		renderPage(pages, "lost", managerType);
	  }
	  return;
	}
  
	const componentsToRender = getComponentsForPage(pages, pageKey);
  
	if (componentsToRender.length === 0) {
	  console.warn(`Page "${pageKey}" est vide. Aucun composant à charger.`);
	}
  
	const componentKeys = componentsToRender.map(({ component }) => component.tag);
	const manager = componentManagers[managerType];
  
	manager.cleanupComponents(componentKeys);
	componentsToRender.forEach(({ selector, component }) => {
	  manager.loadComponent(selector, component);
	});
  
	console.debug(`${pageKey} Page rendered.`);
  }
  