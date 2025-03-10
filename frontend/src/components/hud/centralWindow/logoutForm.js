import { createComponent } from '/src/utils/component.js';
import { handleRoute, getPreviousRoute } from '/src/services/router.js';
import { logoutUser } from '/src/services/auth.js';

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

	attachEvents: (el) => {
		el.querySelector('#cancel-logout').addEventListener('click', (e) => {
			e.preventDefault();
			handleRoute(getPreviousRoute());
			console.info('Logout canceled. Returning to settings.');
		});

		el.querySelector('#confirm-logout').addEventListener('click', async (e) => {
			e.preventDefault();

			try {
				await logoutUser();
				console.info('User logged out successfully.');
			} catch (error) {
				console.warn('Error during logout:', error);
				alert('An error occurred while logging out. Please try again.');
			}
		});
	},
});
