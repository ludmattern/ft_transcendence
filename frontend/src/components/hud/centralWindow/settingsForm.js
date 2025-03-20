// settingsForm.js
import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { validatePassword } from '/src/components/hud/centralWindow/subscribeForm.js';
import { checkPasswordConfirmation } from '/src/components/hud/centralWindow/subscribeForm.js';
import { checkEmailConfirmation } from '/src/components/hud/centralWindow/subscribeForm.js';
import { validateMail } from '/src/components/hud/centralWindow/subscribeForm.js';
import { getInfo, pushInfo } from '/src/services/infoStorage.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';


export const settingsForm = createComponent({
	tag: 'settingsForm',

	// Générer le HTML
	render: () =>
		`
		<div id="settings-form" class="form-container d-none">
		  <h5>SETTINGS</h5>
		  <span class="background-central-span">
			<form action="#" method="post" class="w-100">
			  <!-- Hidden username field for accessibility in password forms -->
			  <input type="text" name="username" id="username" autocomplete="username" style="display: none;" />
			  
			  <fieldset>
				<legend class="d-none">Update Username</legend>
				${createFormGroup('new-username', 'text', 'New username')}
			  </fieldset>
			  
			  <fieldset>
				<legend class="d-none">Update Password</legend>
				${createFormGroup('old-password', 'password', 'Current password')}
				${createFormGroup('new-password', 'password', 'New Password')}
				${createFormGroup('confirm-new-password', 'password', 'Confirm new password')}
			  </fieldset>
			  
			  <fieldset>
				<legend class="d-none">Update Email</legend>
				${createFormGroup('new-email', 'email', 'New Email')}
				${createFormGroup('confirm-new-email', 'email', 'Confirm new Email')}
			  </fieldset>
			  
			  <button class="btn bi bi-arrow-repeat" id="update-button" name="update-button">Update</button>
			</form>
			<!-- Delete Account -->
			<div>
			  <span>
				<p>Delete Account? <a href="" id="delete-account-link" class="text-info">resign</a></p>
			  </span>
			</div>
		  </span>
		</div>
	  `,

	attachEvents: async (el) => {
		const oauth_null = await checkOAuthStatus();
		if (oauth_null === false) {
			handleRoute('/settings/delete-account');
			return;
		}

		const settingsForm = document.getElementById('settings-form');
		settingsForm.classList.remove('d-none');

		el.querySelector('form').addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = await collectFormData(el);
			resetErrorMessages();

			let canUpdate = true;

			if (formData.newEmail) {
				if (!validateMail(formData.newEmail)) canUpdate = false;
			}
			if (canUpdate && formData.newPassword && !validatePassword(formData.newPassword)) {
				canUpdate = false;
			}
			if (canUpdate && formData.newPassword && formData.confirmPassword && !checkPasswordConfirmation(formData.newPassword, formData.confirmPassword)) {
				canUpdate = false;
			}
			if (canUpdate && formData.newEmail && formData.confirmEmail && !checkEmailConfirmation(formData.newEmail, formData.confirmEmail)) {
				canUpdate = false;
			}

			if (canUpdate) {
				try {
					const response = await fetch('/api/user-service/update/', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(formData),
						credentials: 'include',
					});
					const data = await response.json();
					if (data.success) {
						if (formData.newUsername) {
							await pushInfo('registered_user', formData.newUsername);
							await pushInfo('username', formData.newUsername);
						}
						createNotificationMessage('Information updated successfully.', 2500, false);
						resetErrorMessages();
						emptyFields();
					} else {
						passwordError(data);
						usernameError(data);
						emailError(data);
						emptyFormError(data);
					}
				} catch (error) {
					console.error('Error updating information:', error);
				}
			}
		});

		el.querySelector('#delete-account-link').addEventListener('click', (e) => {
			e.preventDefault();
			handleRoute('/settings/delete-account');
		});
	},
});

function emptyFormError(data) {
	if (data.message.includes('No changes to update')) {
		createNotificationMessage('No changes to update', 2500, false);
	}
}

function passwordError(data) {
	if (data.message.includes('Please enter current password')) {
		document.getElementById('current-pass-empty').style.display = 'block';
	} else {
		document.getElementById('current-pass-empty').style.display = 'none';
	}

	if (data.message.includes('New password cannot be the same as old password')) {
		document.getElementById('error-same-as-old-pass').style.display = 'block';
	} else {
		document.getElementById('error-same-as-old-pass').style.display = 'none';
	}

	if (data.message.includes('Current password is incorrect')) {
		document.getElementById('bad-current-pass').style.display = 'block';
	} else {
		document.getElementById('bad-current-pass').style.display = 'none';
	}

	if (data.message.includes('Passwords do not match')) {
		document.getElementById('error-message-pass').style.display = 'block';
	} else {
		document.getElementById('error-message-pass').style.display = 'none';
	}
}

function usernameError(data) {
	if (data.message.includes('Username already taken')) {
		document.getElementById('error-message-id').style.display = 'block';
	} else {
		document.getElementById('error-message-id').style.display = 'none';
	}
}

function emailError(data) {
	if (data.message.includes('Email already in use')) {
		document.getElementById('error-message-mail').style.display = 'block';
		document.getElementById('error-message-mail2').style.display = 'none';
	} else {
		document.getElementById('error-message-mail').style.display = 'none';
	}
	if (data.message.includes('Email too long')) {
		document.getElementById('error-message-mail-size').style.display = 'block';
	} else {
		document.getElementById('error-message-mail-size').style.display = 'none';
	}

	if (data.message.includes('You\'re already using this email')) {
		document.getElementById('error-same-as-old-email').style.display = 'block';
	} else {
		document.getElementById('error-same-as-old-email').style.display = 'none';
	}

	if (data.message.includes('Emails do not match')) {
		document.getElementById('error-message-mail2').style.display = 'block';
	} else {
		document.getElementById('error-message-mail2').style.display = 'none';
	}
}

function emptyFields() {
	document.getElementById('new-username').value = '';
	document.getElementById('old-password').value = '';
	document.getElementById('new-password').value = '';
	document.getElementById('confirm-new-password').value = '';
	document.getElementById('new-email').value = '';
	document.getElementById('confirm-new-email').value = '';
}

/**
 * Crée un groupe de formulaire réutilisable
 *
 * @param {string} id - L'ID de l'input
 * @param {string} type - Le type de l'input (text, password, email)
 * @param {string} label - Le label affiché au-dessus de l'input
 * @returns {string} - HTML du groupe de formulaire
 */
function createFormGroup(id, type, label) {
	return `
	<div class="form-group">
	  <label class="mb-3" for="${id}">${label}</label>
	  <input type="${type}" id="${id}" name="${id}" class="form-control" autocomplete="${getAutocompleteValue(id)}"/>
	  ${id === 'new-username' ? '<div id="error-message-id" class="text-danger mt-2" style="display: none;">Id already taken</div>' : ''}
	  ${id === 'new-username' ? '<div id="bad-id" class="text-danger mt-2" style="display: none;">Id must contain between 6 and 20 char</div>' : ''}
	  ${id === 'old-password' ? '<div id="current-pass-empty" class="text-danger mt-2" style="display: none;">Please enter current password</div>' : ''}
	  ${id === 'old-password' ? '<div id="bad-current-pass" class="text-danger mt-2" style="display: none;">Current password is incorrect</div>' : ''}
	  ${id === 'new-password' ? '<div id="bad-pass-size" class="text-danger mt-2" style="display: none;">Password must contain between 6 and 20 char</div>' : ''}
	  ${id === 'new-password' ? '<div id="bad-pass-upper" class="text-danger mt-2" style="display: none;">Password must have at least one uppercase char</div>' : ''}
	  ${id === 'new-password' ? '<div id="bad-pass-lower" class="text-danger mt-2" style="display: none;">Password must have at least one lowercase char</div>' : ''}
	  ${id === 'new-password' ? '<div id="bad-pass-special" class="text-danger mt-2" style="display: none;">Password must have at least one special char</div>' : ''}
	  ${id === 'new-password' ? '<div id="bad-pass-number" class="text-danger mt-2" style="display: none;">Password must have at least one digit</div>' : ''}
	  ${id === 'new-password' ? '<div id="error-same-as-old-pass" class="text-danger mt-2" style="display: none;">New password cannot be the same as old password</div>' : ''}
	  ${id === 'confirm-new-password' ? '<div id="error-message-pass" class="text-danger mt-2" style="display: none;">Password does not match</div>' : ''}
	  ${id === 'new-email' ? '<div id="error-message-mail" class="text-danger mt-2" style="display: none;">E-mail already taken</div>' : ''}
	  ${id === 'new-email' ? '<div id="error-message-mail-size" class="text-danger mt-2" style="display: none;">E-mail too long</div>' : ''}
	  ${id === 'new-email' ? '<div id="error-same-as-old-email" class="text-danger mt-2" style="display: none;">You\'re already using this email</div>' : ''}
	  ${id === 'confirm-new-email' ? '<div id="error-message-mail2" class="text-danger mt-2" style="display: none;">E-mail does not match</div>' : ''}
	</div>
`;
}

function getAutocompleteValue(id) {
	switch (id) {
		case 'new-username':
			return 'username';
		case 'old-password':
			return 'current-password';
		case 'new-password':
			return 'new-password';
		case 'confirm-new-password':
			return 'new-password';
		case 'new-email':
			return 'email';
		case 'confirm-new-email':
			return 'email';
		default:
			return 'off';
	}
}

/**
 * Collecte les données du formulaire
 *
 * @param {HTMLElement} el - Élément racine du formulaire
 * @returns {Object} - Données collectées du formulaire
 */
async function collectFormData(el) {
	return {
		username: (await getInfo('username')).success ? (await getInfo('username')).value : null,
		newUsername: el.querySelector('#new-username').value,
		oldPassword: el.querySelector('#old-password').value,
		newPassword: el.querySelector('#new-password').value,
		confirmPassword: el.querySelector('#confirm-new-password').value,
		newEmail: el.querySelector('#new-email').value,
		confirmEmail: el.querySelector('#confirm-new-email').value,
	};
}

function resetErrorMessages() {
	const errorIds = [
		'error-message-id',
		'bad-id',
		'current-pass-empty',
		'bad-current-pass',
		'bad-pass-size',
		'bad-pass-upper',
		'bad-pass-lower',
		'bad-pass-number',
		'bad-pass-special',
		'error-same-as-old-pass',
		'error-message-pass',
		'error-message-mail-size',
		'error-message-mail',
		'error-message-mail2',
		'error-same-as-old-email',
	];

	errorIds.forEach((errId) => {
		const el = document.getElementById(errId);
		if (el) el.style.display = 'none';
	});
}

async function checkOAuthStatus() {
	try {
		const response = await fetch('/api/user-service/check_oauth_id/', {
			method: 'GET',
			credentials: 'include',
		});

		const data = await response.json();
		return data.oauth_null;
	} catch (error) {
		console.error('Erreur lors de la vérification de OAuth:', error);
		return null;
	}
}
