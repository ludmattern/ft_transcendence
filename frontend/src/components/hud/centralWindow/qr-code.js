import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';

export const qrcode = createComponent({
	tag: 'qrcode',

	render: () => `
    <div id="twofa-form" class="form-container flex-column justify-content-around text-center active">
      <h5>Two-Factor Authentication</h5>
      <span class="background-central-span">
        <form action="#" method="post" class="w-100">
          <div id="qr-code-container" class="mb-3" style="display: none;">
            <p>Scan this QR code with your Google Authenticator app:</p>
            <img id="qr-code" src="" alt="QR Code" />
          </div>
        </form>
        <div>
          <span>
            <a href="#" id="back" class="text-info">back</a>
          </span>
        </div>
      </span>
    </div>
  `,

	attachEvents: async (el) => {
		el.querySelector('#back').addEventListener('click', (e) => {
			e.preventDefault();
			sessionStorage.removeItem('registered_user');
			handleRoute('/login');
		});
		const username = sessionStorage.getItem('registered_user');
		const qrCodeContainer = el.querySelector('#qr-code-container');
		const qrCodeImage = el.querySelector('#qr-code');

		try {
			const response = await fetch(`/api/user-service/generate-qr/${username}/`);
			if (response.ok) {
				const blob = await response.blob();
				const url = URL.createObjectURL(blob);
				qrCodeImage.src = url;
				qrCodeContainer.style.display = 'block';
			} else {
				console.error('Failed to load QR code:', response.statusText);
			}
		} catch (err) {
			console.error('Error fetching QR code:', err.message);
		}
	},
});
