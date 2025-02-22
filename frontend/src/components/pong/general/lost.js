import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';

export const lost = createComponent({
	tag: 'lost',

	// Générer le HTML
	render: () => `
    <section class="col-12 d-flex flex-column align-items-center justify-content-center text-center p-5"
             style="background-color: #111111; color: white;">
      
      <h1 class="display-1 text-danger">404</h1>
      <h2 class="text-uppercase">You Seem Lost, Captain.</h2>
      <p class="text-secondary">This isn't the page you're looking for... or maybe it never existed.</p>

	  <button id="return-home" class="btn btn-warning mt-5">Return to Home</button>
      
      <div class="mt-5 text-muted">
        <p><i class="bi bi-exclamation-triangle"></i> Error Code: PEBKAC</p>
        <p>shipctrl:///appData/errors/lost_signal.shp</p>
      </div>

    </section>
  `,

	attachEvents: (el) => {
		const returnHomeButton = el.querySelector('#return-home');

		returnHomeButton.addEventListener('click', () => {
			handleRoute('/pong/play');
		});
	},
});
