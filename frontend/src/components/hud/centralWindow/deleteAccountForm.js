import { createComponent } from '/src/utils/component.js';
import { handleRoute, resetPreviousRoutes, getCurrentTournamentInformation } from '/src/services/router.js';
import { deleteInfo } from '/src/services/infoStorage.js';
import { closeCentralWindow } from '/src/components/hud/utils/utils.js';
import { closeWebSocket } from '/src/services/websocket.js';
import componentManagers from '/src/index.js';
import { switchwindow } from '/src/3d/animation.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';

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
				closeCentralWindow();
			}
			if (e.target.matches('#confirm-delete')) {
				try {
					await clearSession();
				} catch (error) {
					console.error('An unexpected error occurred while deleting your account');
				}
				e.preventDefault();
			}
		});
	},
});

async function clearSession() {
	try {
		const data = await getCurrentTournamentInformation();
		if (data.tournament !== null) {
			createNotificationMessage('You must first leave your tournament', 2500, true);
			return;
		}
		await deleteInfo('userId');
		await deleteInfo('username');
		await deleteInfo('tournamentMode');
		await deleteInfo('tournamentSize');
		await deleteInfo('roomCode');
		await deleteInfo('activeTournamentTab');
		await deleteInfo('difficulty');
		await deleteInfo('liabilityCheckbox');
		await deleteInfo('pending2FA_user');
		await deleteInfo('pending2FA_method');
		await deleteInfo('registered_user');
		sessionStorage.clear();

		const response = await fetch('/api/user-service/delete/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
		});
		if (response.ok) {
			await closeWebSocket();
		} else {
			console.error('An unexpected error occurred while deleting your account');
		}
	} catch (err) {
		console.error('Error during clearing session: ', err);
	}
	resetPreviousRoutes();
	componentManagers['Pong'].cleanupComponents([]);
	switchwindow('home');
	handleRoute('/login');
}
