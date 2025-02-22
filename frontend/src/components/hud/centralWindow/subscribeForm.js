import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { registerUser } from '/src/services/auth.js';

export const subscribeForm = createComponent({
	tag: 'subscribeForm',

	// Générer le HTML
	render: () => `
    <div id="subscribe-form" class="form-container">
      <h5>PILOT IDENTIFICATION - REGISTER</h5>
      <span class="background-central-span">
        <form action="#" method="post" class="w-100">
          <div class="form-group">
            <label class="mb-3" for="new-pilot-id">ID</label>
            <input type="text" id="new-pilot-id" name="new-pilot-id" class="form-control" required />
            <div id="error-message-id" class="text-danger mt-2" style="display: none;">Id already taken</div>
            <div id="bad-id" class="text-danger mt-2" style="display: none;">Id must contain between 6 and 20 char</div>
          </div>
          <div class="form-group">
            <label class="mb-3" for="new-password">Password</label>
            <input type="password" id="new-password" name="new-password" class="form-control" required />
            <div id="bad-pass-size" class="text-danger mt-2" style="display: none;">Password must contain between 6 and 20 char</div>
            <div id="bad-pass-upper" class="text-danger mt-2" style="display: none;">Password must have at least one uppercase char</div>
            <div id="bad-pass-lower" class="text-danger mt-2" style="display: none;">Password must have at least one lowercase char</div>
            <div id="bad-pass-special" class="text-danger mt-2" style="display: none;">Password must have at least one special char</div>
          </div>
          <div class="form-group">
            <label class="mb-3" for="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" name="confirm-password" class="form-control" required />
            <div id="error-message-pass" class="text-danger mt-2" style="display: none;">Password does not match</div>
          </div>
          <div class="form-group">
            <label class="mb-3" for="email">Email</label>
            <input type="email" id="email" name="email" class="form-control" required />
            <div id="error-message-mail" class="text-danger mt-2" style="display: none;">E-mail already taken</div>
            <div id="error-message-mail-size" class="text-danger mt-2" style="display: none;">E-mail too long</div>
          </div>
          <div class="form-group">
            <label class="mb-3" for="confirm-email">Confirm Email</label>
            <input type="email" id="confirm-email" name="confirm-email" class="form-control" required />
            <div id="error-message-mail2" class="text-danger mt-2" style="display: none;">E-mail does not match</div>
          </div>
          <div class="form-group">
            <label class="mb-3" for="language">Language</label>
            <select id="language" name="language" class="form-control p-3" required>
              <option value="french">French</option>
              <option value="english">English</option>
              <option value="german">German</option>
            </select>
          </div>
          <div class="form-group">
            <label for="enable-2fa">
              <input type="checkbox" id="enable-2fa" name="enable-2fa" />
              Enable Two-Factor Authentication (2FA)
            </label>
          </div>
          <div id="2fa-options" style="display: none;">
            <div class="form-group">
              <label for="2fa-method">Choose 2FA Method</label>
              <select id="2fa-method" name="2fa-method" class="form-control">
                <option value="authenticator-app">Authenticator App</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div class="form-group" id="phone-group" style="display: none;">
              <label for="phone-number">Phone Number</label>
              <input type="text" id="phone-number" name="phone-number" class="form-control" />
              <div id="error-message-phone" class="text-danger mt-2" style="display: none;">Phone number must contain exactly 10 digits.</div>
            </div>
          </div>
          <button type="submit" class="btn btn-block bi bi-check2-square">Register</button>
        </form>
        <div>
          <span>
            <p>Already flown? <a href="#" id="login-link" class="text-info">Log In</a></p>
          </span>
        </div>
      </span>
    </div>
  `,

	attachEvents: async (el) => {
		el.querySelector('#login-link').addEventListener('click', (e) => {
			e.preventDefault();
			handleRoute('/login');
		});

		const enable2FA = document.getElementById('enable-2fa');
		const twoFAOptions = document.getElementById('2fa-options');
		const twoFAMethodSelect = document.getElementById('2fa-method');
		const phoneGroup = document.getElementById('phone-group');

		enable2FA.addEventListener('change', () => {
			twoFAOptions.style.display = enable2FA.checked ? 'block' : 'none';
			phoneGroup.style.display = 'none';
		});

		twoFAMethodSelect.addEventListener('change', () => {
			phoneGroup.style.display = twoFAMethodSelect.value === 'sms' ? 'block' : 'none';
		});

		el.querySelector('form').addEventListener('submit', async (e) => {
			e.preventDefault();

			const { id, password, confirmPassword, mail, confirmMail, phoneNumber } = getFormValues(el);

			const is2FAEnabled = enable2FA.checked;
			const twoFAMethod = is2FAEnabled ? twoFAMethodSelect.value : null;
			resetErrorMessages();

			let canRegister = true;

			if (!validateId(id)) canRegister = false;
			if (canRegister && !validateMail(mail)) canRegister = false;
			if (canRegister && !validatePassword(password)) canRegister = false;
			if (canRegister && !checkPasswordConfirmation(password, confirmPassword)) canRegister = false;
			if (canRegister && !checkEmailConfirmation(mail, confirmMail)) canRegister = false;
			if (is2FAEnabled && twoFAMethod === 'sms' && !phoneNumber) {
				if (!validatePhoneNumber(phoneNumber)) {
					canRegister = false;
				}
			}
			if (canRegister) {
				try {
					const check_register = await registerUser(id, password, mail, is2FAEnabled, twoFAMethod, phoneNumber);
					if (check_register && twoFAMethod === 'authenticator-app') {
						sessionStorage.setItem('registered_user', id);
						handleRoute('/register/qr');
					} else if (check_register) {
						handleRoute('/login');
					}
				} catch (err) {
					console.error('register failed:', err.message);
					alert('register failed! Please try again.');
				}
			}
		});
	},
});

/**
 * Récupère les valeurs du formulaire
 */
function getFormValues(el) {
	return {
		id: el.querySelector('#new-pilot-id').value,
		password: el.querySelector('#new-password').value,
		confirmPassword: el.querySelector('#confirm-password').value,
		mail: el.querySelector('#email').value,
		confirmMail: el.querySelector('#confirm-email').value,
		phoneNumber: el.querySelector('#phone-number').value || null,
	};
}

/**
 * Cache tous les messages d'erreur liés au formulaire
 */
function resetErrorMessages() {
	const errorIds = ['bad-id', 'bad-pass-size', 'bad-pass-upper', 'bad-pass-lower', 'bad-pass-special', 'error-message-mail-size', 'error-message-mail', 'error-message-mail2', 'error-message-pass'];

	errorIds.forEach((errId) => {
		const el = document.getElementById(errId);
		if (el) el.style.display = 'none';
	});
}

/**
 * Vérifie la validité de l'ID
 * @returns {boolean} true si valide, false sinon
 */

export function validateId(id) {
	if (id.length < 6 || id.length > 20) {
		document.getElementById('bad-id').style.display = 'block';
		return false;
	}
	return true;
}

/**
 * Vérifie la validité du mot de passe et affiche les erreurs correspondantes
 * @returns {boolean} true si valide, false sinon
 */
export function validatePassword(password) {
	let isValid = true;

	if (password.length < 6 || password.length > 20) {
		document.getElementById('bad-pass-size').style.display = 'block';
		isValid = false;
	}

	const regexLower = /[a-z]/;
	if (!regexLower.test(password)) {
		document.getElementById('bad-pass-lower').style.display = 'block';
		isValid = false;
	}

	const regexUpper = /[A-Z]/;
	if (!regexUpper.test(password)) {
		document.getElementById('bad-pass-upper').style.display = 'block';
		isValid = false;
	}

	const regexSpecial = /[@$!%*?&#^]/;
	if (!regexSpecial.test(password)) {
		document.getElementById('bad-pass-special').style.display = 'block';
		isValid = false;
	}
	return isValid;
}

export function checkPasswordConfirmation(password, confirmPassword) {
	if (password !== confirmPassword) {
		document.getElementById('error-message-pass').style.display = 'block';
		return false;
	}
	return true;
}

export function checkEmailConfirmation(mail, confirmMail) {
	if (mail !== confirmMail) {
		document.getElementById('error-message-mail2').style.display = 'block';
		document.getElementById('error-message-mail').style.display = 'none';
		return false;
	}
	return true;
}

export function validatePhoneNumber(phoneNumber) {
	const phoneRegex = /^\d{10}$/;
	if (!phoneRegex.test(phoneNumber)) {
		document.getElementById('error-message-phone').style.display = 'block';
		return false;
	}
	document.getElementById('error-message-phone').style.display = 'none';
	return true;
}

export function validateMail(mail) {
	if (mail && mail.length <= 50) {
		return true;
	}
	document.getElementById('error-message-mail-size').style.display = 'block';
	return false;
}
