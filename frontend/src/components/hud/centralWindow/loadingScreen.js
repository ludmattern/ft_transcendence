import { createComponent } from "/src/utils/component.js";
import { handleRoute, getPreviousRoute } from "/src/services/router.js";

export const loadingScreen = createComponent({
  tag: "loadingScreen",

  // Générer le HTML
  render: () => `
	<div id="loading-screen" class="d-flex justify-content-center align-items-center">
		<div class="spinner-border text-light" role="status">
			<span class="visually-hidden">Loading...</span>
		</div>
	</div>
  `,
});
