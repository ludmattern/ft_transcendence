import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';

export const forgotPassword = (() => {
	const initialState = {
		step: 'email',
		email: '',
		resetToken: '',
	};
	const state = { ...initialState };

	// Fonction pour réinitialiser l'état
	const resetState = () => {
		Object.assign(state, initialState);
	};

	// Vues pour chaque étape avec le bouton Cancel
	const emailView = () => `
    <div id="forgot-password-form" class="form-container flex-column justify-content-around text-center active">
      <h5>PASSWORD RECOVERY</h5>
      <span class="background-central-span">
        <form id="email-form" action="#" method="post" class="w-100">
          <div class="form-group">
            <label for="email" class="mb-3">Enter your email</label>
            <input type="email" id="email" name="email" class="form-control" required />
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
        <form id="code-form" action="#" method="post" class="w-100">
          <div class="form-group">
            <label for="code" class="mb-3">Enter the code</label>
            <input type="text" id="code" name="code" class="form-control" required />
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
        <form id="change-password-form-element" action="#" method="post" class="w-100">
          <div class="form-group">
            <label for="new-password" class="mb-3">New password</label>
            <input type="password" id="new-password" name="new-password" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="confirm-password" class="mb-3">Confirm password</label>
            <input type="password" id="confirm-password" name="confirm-password" class="form-control" required />
            <div id="error-message" class="text-danger mt-2 d-none">Passwords do not match</div>
          </div>
          <button type="submit" class="btn">Submit</button>
        </form>
        <button id="cancel" class="btn">Cancel</button>
      </span>
    </div>
  `;

	// Fonction de rendu principal qui choisit la vue selon l'état
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
						console.error('Error requesting password reset:', data.message);
					}
				}
			} catch (error) {
				console.error('Error:', error);
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
				}
			} catch (error) {
				console.error('Error:', error);
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
						console.error('Error resending code:', data.message);
					}
				} catch (error) {
					console.error('Error:', error);
				}
			});
		}
	};

	const attachChangePasswordEvents = (container) => {
		const form = container.querySelector('#change-password-form-element');
		const newPassword = container.querySelector('#new-password');
		const confirmPassword = container.querySelector('#confirm-password');
		const errorMessage = container.querySelector('#error-message');
		if (!form || !newPassword || !confirmPassword || !errorMessage) return;
		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			if (newPassword.value !== confirmPassword.value) {
				errorMessage.classList.remove('d-none');
			} else {
				try {
					const response = await fetch('/api/auth-service/change-password/', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							new_password: newPassword.value,
							reset_token: state.resetToken,
						}),
					});
					const data = await response.json();
					if (data && data.success) {
						resetState(); // Réinitialisation de l'état avant de rediriger
						handleRoute('/login');
					}
				} catch (error) {
					console.error('Error:', error);
				}
			}
		});
	};

	// Fonction centralisée pour attacher les événements spécifiques à l'étape et le bouton Cancel
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
		// Ajout de l'événement pour le bouton Cancel sur toutes les vues
		const cancelButton = container.querySelector('#cancel');
		if (cancelButton) {
			cancelButton.addEventListener('click', (e) => {
				e.preventDefault();
				resetState(); // Réinitialise l'état avant de quitter
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
