import { createComponent } from '/src/utils/component.js';

export const pongPageSkeleton = createComponent({
	tag: 'pongPageSkeleton',

	// Générer le HTML
	render: () => `
	  <main class="row d-flex flex-column flex-grow-1 p-5" id="pong-menu-container">
		
		<header id="pong-header-container" class="text-white d-flex align-items-center p-3 justify-content-around border" style="background-color: #113630;">
		</header>
		<div id="content-window-container" class="d-flex flex-grow-1 border" style="padding: 0; background-color: #111111;">
		</div>
	  </main>
  `,
});
