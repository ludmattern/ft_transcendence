import { createComponent } from '/src/utils/component.js';
import { handleRoute, getPreviousRoute } from '/src/services/router.js';
import { pushInfo,getInfo, deleteInfo} from '/src/services/infoStorage.js';
import { getUsername } from '/src/pongGame/gameManager.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';

export const deleteAccountForm = createComponent({
	tag: 'deleteAccountForm',

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

	attachEvents: async (el) => {
		el.addEventListener('click', async (e) => {
			if (e.target.matches('#cancel-delete')) {
				e.preventDefault();
				handleRoute(getPreviousRoute()); 
			}
			if (e.target.matches('#confirm-delete')) {
				try {
					const response = await fetch('/api/user-service/delete/', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						credentials: 'include',
					});
					const data = await response.json();
					if (data.success) {
						await deleteInfo('username');
						alert('Your account has been deleted.');
						handleRoute('/login');
					} else {
						alert(`Error: ${data.message}`);
					}
				} catch (error) {
					alert('An unexpected error occurred.');
				}
				e.preventDefault();
			}
		});
	},
});
