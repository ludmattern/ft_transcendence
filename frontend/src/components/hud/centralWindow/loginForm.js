import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { loginUser } from '/src/services/auth.js';

const ALLOWED_ORIGIN = '__CONFIG__ALLOWED_ORIGIN';

export const loginForm = createComponent({
	tag: 'loginForm',
	render: () => `
    <div id="login-form" class="form-container flex-column justify-content-around text-center active">
      <h5>PILOT IDENTIFICATION - LOG IN</h5>
      <span class="background-central-span">
        <form action="#" method="post" class="w-100">
          <div class="form-group">
            <label class="mb-3" for="pilot-id">ID</label>
            <input type="text" id="pilot-id" name="pilot-id" class="form-control" autocomplete="username" required />
          </div>
          <div class="form-group">
            <label class="mb-3" for="password">Password</label>
            <input type="password" id="password" name="password" class="form-control" autocomplete="current-password" required />
			<div id="error-message-co" class="text-danger mt-2 d-none">User already connected</div>
            <div id="error-message" class="text-danger mt-2 d-none">Invalid credentials</div>
            <p class="text-end"><a href="#" id="forgot-password-link" class="text-info">Forgot password?</a></p>
          </div>
          <button class="btn bi bi-check">accept</button>
        </form>
        <div>
          <button id="login-42" class="btn">
            Sign in with    
            <img src="/src/assets/img/42.png" alt="42 logo" style="filter: invert(1); height: 20px; vertical-align: middle; margin-right: 8px;">
          </button>
          <span>
            <p>New pilot? <a href="#" id="enlist-link" class="text-info">Enlist</a></p>
          </span>
        </div>
      </span>
    </div>
  `,
	attachEvents: (el) => {
		el.querySelector('#enlist-link').addEventListener('click', (e) => {
			e.preventDefault();
			handleRoute('/subscribe');
		});
		el.querySelector('#forgot-password-link').addEventListener('click', (e) => {
			e.preventDefault();
			handleRoute('/forgot-password');
		});
		el.querySelector('form').addEventListener('submit', async (e) => {
			e.preventDefault();
			const pilotId = el.querySelector('#pilot-id').value;
			const password = el.querySelector('#password').value;
			const data = await loginUser(pilotId, password);
			if (data.twofa_method) {
				sessionStorage.setItem('pending2FA_user', pilotId);
				sessionStorage.setItem('pending2FA_method', data.twofa_method);
				handleRoute('/login/2fa');
			} else if (data.success) {
				handleRoute('/');
			}
			if (data === 'User is already connected.') {
				el.querySelector('#error-message-co').classList.remove('d-none');
				el.querySelector('#error-message').classList.add('d-none');
			} else if (data === 'Invalid credentials' || data === 'User not found') {
				el.querySelector('#error-message-co').classList.add('d-none');
				el.querySelector('#error-message').classList.remove('d-none');
			}
		});
		el.querySelector('#login-42').addEventListener('click', async () => {
			try {
				const response = await fetch('/api/auth-service/get-42-url/');
				const data = await response.json();
				if (data.url) {
					window.open(data.url, 'oauthPopup', 'width=800,height=600');
				}
			} catch (error) {
				console.error("Erreur lors de l'appel API :", error);
			}
		});

		window.addEventListener('message', (event) => {
			if (event.origin !== ALLOWED_ORIGIN) {
				return;
			}
			const data = event.data;
			if (data.authenticated) {
				handleRoute('/');
			}
		});
	},
});
