import { createComponent } from "/src/utils/component.js";

export const playContent = createComponent({
  tag: "playContent",

  // Générer le HTML
  render: () => `
		<section class="p-3 flex-grow-1" style="background-color: #111111;">
			<h2>Bienvenue</h2>
			<p>Ceci est le contenu principal de la page.</p>
	</section>
  `,
});