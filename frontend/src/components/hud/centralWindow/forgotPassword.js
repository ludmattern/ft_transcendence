import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { validatePassword, checkPasswordConfirmation } from '/src/components/hud/centralWindow/subscribeForm.js';

export const forgotPassword = (() => {
	const initialState = {
		step: 'email',
		email: '',
		resetToken: '',
	};
	const state = { ...initialState };

	const resetState = () => {
		Object.assign(state, initialState);
	};

	const emailView = () => `
    <div id="forgot-password-form" class="form-container flex-column justify-content-around text-center active">
      <h5>PASSWORD RECOVERY</h5>
      <span class="background-central-span">
        <form id="email-form" method="post" class="w-100">
          <div class="form-group">
            <label for="email" class="mb-3">Enter your email</label>
            <input type="email" id="email" name="email" class="form-control" maxlength="50" required />
			<div id="error-message" class="text-danger mt-2 d-none">Passwords do not match</div>
          </div>
          <button type="submit" class="btn">Send Code</button>
        </form>
        <button id="cancel" class="btn">Cancel</button>
      </span>
    </div>
  `;

	const codeView = () => `
    <div id="code-verification-form" class="form-container flex-column justify-content-around text-center active">
      <h5>CODE VERIFICATION</h5>
      <span class="background-central-span">
        <form id="code-form" method="post" class="w-100">
          <div class="form-group">
            <label for="code" class="mb-3">Enter the code</label>
            <input type="text" id="code" name="code" class="form-control" maxlength="6" required />
            <div id="error-message" class="text-danger mt-2 d-none">Invalid Code</div>
          </div>
          <button type="submit" class="btn">Verify Code</button>
        </form>
        <button id="resend-code" class="btn">Resend Code</button>
        <button id="cancel" class="btn">Cancel</button>
      </span>
    </div>
  `;

	const changePasswordView = () => `
    <div id="change-password-form" class="form-container flex-column justify-content-around text-center active">
      <h5>CHANGE PASSWORD</h5>
      <span class="background-central-span">
        <form id="change-password-form-element" method="post" class="w-100">
          <div class="form-group">
            <label for="new-password" class="mb-3">New password</label>
			<input type="text" id="username" name="username" autocomplete="username" value="currentUsername" hidden />
            <input type="password" id="new-password" name="new-password" autocomplete="new-password" class="form-control" maxlength="20" required />
            <div id="bad-pass-size" class="text-danger mt-2" style="display: none;">Password must contain between 6 and 20 char</div>
            <div id="bad-pass-upper" class="text-danger mt-2" style="display: none;">Password must have at least one uppercase char</div>
            <div id="bad-pass-lower" class="text-danger mt-2" style="display: none;">Password must have at least one lowercase char</div>
            <div id="bad-pass-number" class="text-danger mt-2" style="display: none;">Password must have at least one digit</div>
            <div id="bad-pass-special" class="text-danger mt-2" style="display: none;">Password must have at least one special char</div>
          </div>
          <div class="form-group">
            <label for="confirm-password" class="mb-3">Confirm password</label>
            <input type="password" id="confirm-password" name="confirm-password" autocomplete="new-password" class="form-control" maxlength="20" required />
            <div id="error-message-pass" class="text-danger mt-2" style="display: none;">Password does not match</div>
          </div>
          <button type="submit" class="btn">Submit</button>
        </form>
        <button id="cancel" class="btn">Cancel</button>
      </span>
    </div>
  `;

	const renderView = () => {
		switch (state.step) {
			case 'email':
				return emailView();
			case 'code':
				return codeView();
			case 'changePassword':
				return changePasswordView();
			default:
				return '<div>Invalid step</div>';
		}
	};

	const attachEmailEvents = (container) => {
		const form = container.querySelector('#email-form');
		if (!form) return;
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const emailInput = container.querySelector('#email');
			if (!emailInput) return;
			if (!validateMail(emailInput.value)) {
				console.error('Invalid email');
				const errorMessageElement = container.querySelector('#error-message');
				if (errorMessageElement) {
					errorMessageElement.textContent = 'Invalid email';
					errorMessageElement.classList.remove('d-none');
				}
				return;
			}

			state.email = emailInput.value;
			try {
				const response = await fetch('/api/auth-service/request-password-reset/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email: state.email }),
				});
				const data = await response.json();
				if (data && data.success) {
					state.step = 'code';
					container.innerHTML = renderView();
					attachEvents(container);
				} else {
					if (data && data.message === 'User not found') {
						const errorMessageElement = container.querySelector('#error-message');
						if (errorMessageElement) {
							errorMessageElement.textContent = 'User not found';
							errorMessageElement.classList.remove('d-none');
						}
					} else {
						const errorMessageElement = container.querySelector('#error-message');
						if (errorMessageElement) {
							errorMessageElement.textContent = data.message;
							errorMessageElement.classList.remove('d-none');
							console.error('Error requesting password reset: ', data.message);
						} else {
							console.error('Error requesting password reset: ', data.message);
						}
					}
				}
			} catch (error) {
				console.error('Error: ', error);
			}
		});
	};

	const attachCodeEvents = (container) => {
		const form = container.querySelector('#code-form');
		const resendButton = container.querySelector('#resend-code');
		if (!form) return;
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const codeInput = container.querySelector('#code');
			if (!codeInput) return;
			const code = codeInput.value;

			if (code.length !== 6) {
				const errorMessageElement = container.querySelector('#error-message');
				if (errorMessageElement) {
					errorMessageElement.textContent = 'Invalid code';
					errorMessageElement.classList.remove('d-none');
				}
				return;
			}

			try {
				const response = await fetch('/api/auth-service/verify-reset-code/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email: state.email, code }),
				});
				const data = await response.json();
				if (data && data.success) {
					state.resetToken = data.reset_token;
					state.step = 'changePassword';
					container.innerHTML = renderView();
					attachEvents(container);
				} else {
					const errorMessageElement = container.querySelector('#error-message');
					if (errorMessageElement) {
						errorMessageElement.textContent = data.message;
						errorMessageElement.classList.remove('d-none');
					}
				}
			} catch (error) {
				const errorMessageElement = container.querySelector('#error-message');
				if (errorMessageElement) {
					errorMessageElement.textContent = 'Invalid code';
					errorMessageElement.classList.remove('d-none');
				}
				console.error('Error: ', error);
			}
		});
		if (resendButton) {
			resendButton.addEventListener('click', async (e) => {
				e.preventDefault();
				try {
					const response = await fetch('/api/auth-service/request-password-reset/', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ email: state.email }),
					});
					const data = await response.json();
					if (!data.success) {
						const errorMessageElement = container.querySelector('#error-message');
						if (errorMessageElement) {
							errorMessageElement.textContent = data.message;
							errorMessageElement.classList.remove('d-none');
							console.error('Error resending code: ', data.message);
						} else {
							console.error('Error resending code: ', data.message);
						}
					}
				} catch (error) {
					console.error('Error: ', error);
				}
			});
		}
	};

	const attachChangePasswordEvents = (container) => {
		const form = container.querySelector('#change-password-form-element');
		const newPassword = container.querySelector('#new-password');
		const confirmPassword = container.querySelector('#confirm-password');
		const errorMessage = container.querySelector('#error-message-pass');
		if (!form || !newPassword || !confirmPassword || !errorMessage) return;

		form.addEventListener('submit', async (e) => {
			e.preventDefault();

			resetErrorMessages();

			if (!validatePassword(newPassword.value)) {
				return;
			}

			if (!checkPasswordConfirmation(newPassword.value, confirmPassword.value)) {
				errorMessage.classList.remove('d-none');
				return;
			}

			try {
				const response = await fetch('/api/auth-service/change-password/', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						new_password: newPassword.value,
						confirmPassword: confirmPassword.value,
						reset_token: state.resetToken,
					}),
				});

				if (response.status === 401) {
					errorMessage.textContent = 'Your session has expired. Request a new code.';
					errorMessage.classList.remove('d-none');
					errorMessage.style.display = 'block';
					return;
				}

				const data = await response.json();
				if (data && data.success) {
					resetState();
					handleRoute('/login');
				}
			} catch (error) {
				console.error('Error: ', error);
			}
		});
	};

	const attachEvents = (container) => {
		switch (state.step) {
			case 'email':
				attachEmailEvents(container);
				break;
			case 'code':
				attachCodeEvents(container);
				break;
			case 'changePassword':
				attachChangePasswordEvents(container);
				break;
			default:
				console.error('Invalid state step');
		}
		const cancelButton = container.querySelector('#cancel');
		if (cancelButton) {
			cancelButton.addEventListener('click', (e) => {
				e.preventDefault();
				resetState();
				handleRoute('/login');
			});
		}
	};

	return createComponent({
		tag: 'forgotPassword',
		render: renderView,
		attachEvents,
	});
})();

function validateMail(email) {
	if (!email) return false;
	if (email.length > 50) return false;
	const re = /\S+@\S+\.\S+/;
	return re.test(email);
}

function resetErrorMessages() {
	const errorIds = ['bad-pass-size', 'bad-pass-upper', 'bad-pass-number', 'bad-pass-lower', 'bad-pass-special'];

	errorIds.forEach((errId) => {
		const el = document.getElementById(errId);
		if (el) el.style.display = 'none';
	});
}
