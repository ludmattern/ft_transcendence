import { createComponent } from '/src/utils/component.js';
import { handleRoute, getPreviousRoute } from '/src/services/router.js';

export const deleteAccountForm = createComponent({
	tag: 'deleteAccountForm',

	// Générer le HTML
	render: () => `
    <div id="delete-account-form" class="form-container">
      <h5>RESIGN</h5>
      <span class="background-central-span">
        <p>Are you sure you want to delete your account?</p>
        <p>This action can't be reversed.</p>
        <div class="d-flex justify-content-center">
          <button class="btn bi bi-x" id="cancel-delete">No</button>
          <button class="btn bi bi-check danger" id="confirm-delete">Yes</button>
        </div>
      </span>
    </div>
  `,

	// Ajouter les événements après le chargement
	attachEvents: async (el) => {
		el.addEventListener('click', async (e) => {
			if (e.target.matches('#cancel-delete')) {
				e.preventDefault();
				handleRoute(getPreviousRoute()); // Retour à la route précédente
			}
			if (e.target.matches('#confirm-delete')) {
				const formData = collectData(el);
				try {
					const response = await fetch('/api/user-service/delete/', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(formData),
					});
					const data = await response.json();
					if (data.success) {
						alert('Deleted account successfully.');
						sessionStorage.removeItem('username');
						sessionStorage.removeItem('userId');
					}
				} catch (error) {
					alert('An unexpected error occurred.');
				}
				e.preventDefault();
				handleRoute('/login'); // Redirection vers login
			}
		});
	},
});

/**
 *
 * @param {HTMLElement} el - Élément racine
 * @returns {Object} - Données collectées
 */
function collectData(el) {
	return {
		username: sessionStorage.getItem('username'),
	};
}
