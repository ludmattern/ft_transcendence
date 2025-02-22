import { createComponent } from '/src/utils/component.js';
import { handleRoute, getPreviousRoute, resetPreviousRoutes,  } from '/src/services/router.js';
import { logoutUser } from '/src/services/auth.js';
import componentManagers from '/src/index.js';
import { switchwindow } from '/src/3d/animation.js';

export const logoutForm = createComponent({
	tag: 'logoutForm',

	// Générer le HTML
	render: () => `
    <div id="logout-form" class="form-container">
      <h5>LOG OUT</h5>
      <span class="background-central-span">
        <p>Are you sure you want to logout?</p>
        <div class="d-flex justify-content-center">
          <button class="btn bi bi-x" id="cancel-logout">No</button>
          <button class="btn bi bi-check danger" id="confirm-logout">Yes</button>
        </div>
      </span>
    </div>
  `,

	// Ajouter les événements après le chargement
	attachEvents: (el) => {
		// Annuler la déconnexion
		el.querySelector('#cancel-logout').addEventListener('click', (e) => {
			e.preventDefault();
			handleRoute(getPreviousRoute()); // Retour à la route précédente
			console.info('Logout canceled. Returning to settings.');
		});

		// Confirmer la déconnexion
		el.querySelector('#confirm-logout').addEventListener('click', async (e) => {
			e.preventDefault();

			try {
				await logoutUser(); // Simule la déconnexion (appel API ou suppression de session)
				console.info('User logged out successfully.');
				resetPreviousRoutes();
				componentManagers['Pong'].cleanupComponents([]);
				switchwindow('home');
				handleRoute('/login'); // Redirige vers la page de connexion
			} catch (error) {
				console.warn('Error during logout:', error);
				alert('An error occurred while logging out. Please try again.');
			}
		});
	},
});
