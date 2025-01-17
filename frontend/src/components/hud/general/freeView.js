import { createComponent } from "/src/utils/component.js";
import { toggleFreeView } from "/src/3d/freeViewHandler.js";

export const freeViewButton = createComponent({
  tag: "freeViewButton",

  // Générer le HTML
  render: () => `
	<button class="btn bi mb-4 pb-4 pe-auto" id="free-view">free view</button>
  `,

  // Ajouter les événements après le chargement
  attachEvents: (el) => {
    // Événement pour le bouton "free view"
    el.querySelector("#free-view").addEventListener("click", toggleFreeView);
  },
});
