import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';

export const forgotPassword = (() => {
	let state = { step: 'email', email: '', resetToken: '' };

	const render = (step) => {
		if (typeof step !== 'undefined') {
			state.step = step;
		} else {
			state.step = 'email';
		}

		if (state.step === 'email') {
			return `
		<div id="forgot-password-form" class="form-container flex-column justify-content-around text-center active">
			<h5>PASSWORD RECOVERY</h5>
			<span class="background-central-span">
				<form id="email-form" action="#" method="post" class="w-100">
					<div class="form-group">
						<label for="email" class="mb-3">Enter your email</label>
						<input type="email" id="email" name="email" class="form-control" required />
					</div>
					<button type="submit" class="btn">Send Code</button>
				</form>
			</span>
		</div>`;
		} else if (state.step === 'code') {
			return `
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
			</span>
		</div>`;
		} else if (state.step === 'changePassword') {
			return `
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
			</span>
		</div>`;
		} else {
			return '<div>Invalid step</div>';
		}
	};

	const attachEvents = (el) => {
		if (state.step === 'email') {
			const emailForm = el.querySelector('#email-form');
			emailForm.addEventListener('submit', async (e) => {
				e.preventDefault();
				const emailInput = el.querySelector('#email');
				const email = emailInput.value;
				// Stocker l'email pour les appels suivants
				state.email = email;
				console.log('Send reset code to:', email);
				try {
					const response = await fetch('/api/auth-service/request-password-reset/', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ email }),
					});
					const data = await response.json();
					if (data.success) {
						el.innerHTML = render('code');
						attachEvents(el);
					} else {
						console.error('Error:', data.message);
					}
				} catch (error) {
					console.error('Error:', error);
				}
			});
		} else if (state.step === 'code') {
			const codeForm = el.querySelector('#code-form');
			const resendButton = el.querySelector('#resend-code');

			codeForm.addEventListener('submit', async (e) => {
				e.preventDefault();
				const codeInput = el.querySelector('#code');
				const code = codeInput.value;
				console.log('Verify code:', code);
				try {
					const response = await fetch('/api/auth-service/verify-reset-code/', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ email: state.email, code }),
					});
					const data = await response.json();
					if (data.success) {
						// Stocker le reset token pour changer le mot de passe
						state.resetToken = data.reset_token;
						el.innerHTML = render('changePassword');
						attachEvents(el);
					} else {
						console.error('Verification failed:', data.message);
					}
				} catch (error) {
					console.error('Error:', error);
				}
			});

			if (resendButton) {
				resendButton.addEventListener('click', async (e) => {
					e.preventDefault();
					console.log('Resend code request');
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
		} else if (state.step === 'changePassword') {
			const changeForm = el.querySelector('#change-password-form-element');
			const newPassword = el.querySelector('#new-password');
			const confirmPassword = el.querySelector('#confirm-password');
			const errorMessage = el.querySelector('#error-message');

			changeForm.addEventListener('submit', async (e) => {
				e.preventDefault();
				if (newPassword.value !== confirmPassword.value) {
					errorMessage.classList.remove('d-none');
				} else {
					console.log('Change password:', newPassword.value);
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
						if (data.success) {
							handleRoute('/login');
						} else {
							console.error('Change password failed:', data.message);
						}
					} catch (error) {
						console.error('Error:', error);
					}
				}
			});
		}
	};

	return createComponent({
		tag: 'forgotPassword',
		render,
		attachEvents,
	});
})();
