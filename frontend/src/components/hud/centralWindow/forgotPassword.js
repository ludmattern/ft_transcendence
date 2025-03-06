import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';

export const forgotPassword = createComponent({
	tag: 'forgotPassword',

	render: () => `
    <div id="forgot-password-form" class="form-container flex-column justify-content-around text-center active">
      <h5>PASSWORD RECOVERY</h5>
      <span class="background-central-span">
        <!-- Formulaire pour saisir l'email -->
        <form id="email-form" action="#" method="post" class="w-100">
          <div class="form-group">
            <label for="email" class="mb-3">Enter your email</label>
            <input type="email" id="email" name="email" class="form-control" required />
          </div>
          <button type="submit" class="btn">Send Code</button>
        </form>
        
        <!-- Formulaire pour saisir le code, initialement masqué -->
        <form id="code-form" action="#" method="post" class="w-100 d-none">
          <div class="form-group">
            <label for="code" class="mb-3">Enter the code</label>
            <input type="text" id="code" name="code" class="form-control" required />
          </div>
          <div>
		  <button type="submit" class="btn">Verify Code</button>
            <button type="button" id="resend-code" class="btn">Resend Code</button>
          </div>
        </form>
      </span>
    </div>
  `,

	attachEvents: (el) => {
		// Références aux formulaires et champs
		const emailForm = el.querySelector('#email-form');
		const codeForm = el.querySelector('#code-form');
		const emailInput = el.querySelector('#email');
		const codeInput = el.querySelector('#code');
		const resendButton = el.querySelector('#resend-code');

		// Soumission du formulaire d'email
		emailForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const email = emailInput.value;
			// Appel de l'API pour envoyer le code à l'email
			// Par exemple : await sendResetCode(email);
			console.log('Send reset code to:', email);
			// Une fois le code envoyé, on masque le formulaire d'email et on affiche celui du code
			emailForm.classList.add('d-none');
			codeForm.classList.remove('d-none');
		});

		// Soumission du formulaire de code
		codeForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const code = codeInput.value;
			// Appel de l'API pour vérifier le code saisi
			// Par exemple : const result = await verifyResetCode(emailInput.value, code);
			console.log('Verify code:', code);
			// En fonction de la réponse, rediriger ou afficher un message d'erreur
			// if (result.success) { handleRoute('/reset-password'); } else { afficher une erreur }
		});

		// Bouton pour renvoyer le code
		resendButton.addEventListener('click', async (e) => {
			e.preventDefault();
			const email = emailInput.value;
			// Appel de l'API pour renvoyer le code à l'email
			// Par exemple : await resendResetCode(email);
			console.log('Resend code to:', email);
		});
	},
});
