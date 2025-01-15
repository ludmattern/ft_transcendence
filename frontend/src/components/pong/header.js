import { createComponent } from "/src/utils/component.js";

export const header = createComponent({
  tag: "header",

  // Générer le HTML
  render: () => `
			<!-- Bloc gauche -->
		<header id="pong-header-container" class="text-white d-flex align-items-center p-3 justify-content-around border" style="background-color: #113630;">
			<div class="col-2 text-center">
			  <h1 class="bi bi-rocket fs-5 m-0">TRANSCENDENCE</h1>
			</div>
		    <span class="separator"></span>
			<!-- Bloc droit -->
			<div class="col-8 d-flex justify-content-around border p-1" style="background-color: #084b4e; text-transform: uppercase;">
			  <span class="m-0">shipctrl:///appData/useless/pong/play.shp</span>
			  <span class="m-0">Powered by ubuntu <i class="bi bi-ubuntu"></i></span>
			</div>
		</header>
  `,
});