import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { validatePassword, checkPasswordConfirmation, checkEmailConfirmation, validateMail } from '/src/components/hud/centralWindow/subscribeForm.js';
import { getInfo, pushInfo } from '/src/services/infoStorage.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';

export const settingsForm = createComponent({
	tag: 'settingsForm',

	render: () =>
		`
		<div id="settings-form" class="form-container d-none">
		  <h5>SETTINGS</h5>
		  <span class="background-central-span p-4">
			<form action="#" method="post" class="w-100">
			  <!-- Hidden username field for accessibility in password forms -->
			  <input type="text" name="username" id="username" autocomplete="username" maxlength="20" style="display: none;" />
			  
			  <fieldset>
				<legend class="d-none">Update Username</legend>
				${createFormGroup('new-username', 'text', 'New username', '20')}
			  </fieldset>
			  
			  <fieldset>
				<legend class="d-none">Update Password</legend>
				${createFormGroup('old-password', 'password', 'Current password', '20')}
				${createFormGroup('new-password', 'password', 'New Password', '20')}
				${createFormGroup('confirm-new-password', 'password', 'Confirm new password', '20')}
			  </fieldset>
			  
			  <fieldset>
				<legend class="d-none">Update Email</legend>
				${createFormGroup('new-email', 'email', 'New Email', '50')}
				${createFormGroup('confirm-new-email', 'email', 'Confirm new Email', '50')}
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
		const settingsForm = document.getElementById('settings-form');
		settingsForm.classList.remove('d-none');
		const form = el.querySelector('form');

		if (oauth_null === false) {
			const fieldsets = form.querySelectorAll('fieldset');
			if (fieldsets[1]) fieldsets[1].remove();
			if (form.querySelectorAll('fieldset')[1]) form.querySelectorAll('fieldset')[1].remove();

			form.addEventListener('submit', async (e) => {
				e.preventDefault();
				const newUsername = form.querySelector('#new-username').value;
				if (!newUsername) return;
				const formData = { newUsername };
				try {
					const response = await fetch('/api/user-service/update_info_42/', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify(formData),
						credentials: 'include',
					});
					const data = await response.json();
					if (data.success) {
						await pushInfo('registered_user', newUsername);
						await pushInfo('username', newUsername);
						createNotificationMessage(`Hello again, ${newUsername}!`, 2500, false);
						form.querySelector('#new-username').value = '';
					} else {
						console.error('Error updating username: ', data);
						usernameError(data);
					}
				} catch (error) {
					console.error('Error updating username: ', error);
				}
			});

			el.querySelector('#delete-account-link').addEventListener('click', (e) => {
				e.preventDefault();
				handleRoute('/settings/delete-account');
			});

			return;
		}

		form.addEventListener('submit', async (e) => {
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
						createNotificationMessage('Information updated successfully', 2500, false);
						resetErrorMessages();
						emptyFields();
					} else {
						passwordError(data);
						usernameError(data);
						emailError(data);
						emptyFormError(data);
					}
				} catch (error) {
					console.error('Error updating information: ', error);
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

	if (data.message.includes('Username must be between 6 and 20 characters')) {
		document.getElementById('bad-length').style.display = 'block';
	} else {
		document.getElementById('bad-length').style.display = 'none';
	}

	if (data.message.includes('Username can only contain alphanumeric characters and underscores')) {
		document.getElementById('bad-user-rule').style.display = 'block';
	} else {
		document.getElementById('bad-user-rule').style.display = 'none';
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

	if (data.message.includes('Email has an invalid format')) {
		document.getElementById('error-message-mail-format').style.display = 'block';
	} else {
		document.getElementById('error-message-mail-format').style.display = 'none';
	}

	if (data.message.includes("You're already using this email")) {
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

function createFormGroup(id, type, label, maxLength) {
	return `
	<div class="form-group">
	  <label class="mb-3" for="${id}">${label}</label>
	  <input type="${type}" id="${id}" name="${id}" maxlength="${maxLength}" class="form-control" autocomplete="${getAutocompleteValue(id)}"/>
	  ${id === 'new-username' ? '<div id="error-message-id" class="text-danger mt-2" style="display: none;">Id already taken</div>' : ''}
	  ${id === 'new-username' ? '<div id="bad-length" class="text-danger mt-2" style="display: none;">Id must contain between 6 and 20 char</div>' : ''}
	  ${id === 'new-username' ? '<div id="bad-user-rule" class="text-danger mt-2" style="display: none;">Id can only contain alphanumeric characters and underscores</div>' : ''}
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
	  ${id === 'new-email' ? '<div id="error-message-mail-format" class="text-danger mt-2" style="display: none;">E-mail has an invalid format</div>' : ''}
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
		'bad-length',
		'bad-user-rule',
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
		'error-message-mail-format',
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
		console.error('Error on OAuth check: ', error);
		return null;
	}
}
