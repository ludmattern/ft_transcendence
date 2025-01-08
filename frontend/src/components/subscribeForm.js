import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';

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
          </div>
          <div class="form-group">
            <label class="mb-3" for="new-password">Password</label>
            <input type="password" id="new-password" name="new-password" class="form-control" required />
          </div>
          <div class="form-group">
            <label class="mb-3" for="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" name="confirm-password" class="form-control" required />
          </div>
          <div class="form-group">
            <label class="mb-3" for="email">Email</label>
            <input type="email" id="email" name="email" class="form-control" required />
          </div>
          <div class="form-group">
            <label class="mb-3" for="confirm-email">Confirm Email</label>
            <input type="email" id="confirm-email" name="confirm-email" class="form-control" required />
          </div>
          <div class="form-group">
            <label class="mb-3" for="language">Language</label>
            <select id="language" name="language" class="form-control p-3" required>
              <option value="french">French</option>
              <option value="english">English</option>
              <option value="german">German</option>
            </select>
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

  // Ajouter les événements après le chargement
  attachEvents: (el) => {
    // Gestion du clic sur "Log In"
    el.querySelector('#login-link').addEventListener('click', (e) => {
      e.preventDefault();
	  handleRoute('/login');
      console.debug('LoginForm loaded on click.');
    });

    // Gestion de la soumission du formulaire
    el.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault();
      console.log('Subscription form submitted!');

      // Exemple : validation simple
      const id = el.querySelector('#new-pilot-id').value;
      const password = el.querySelector('#new-password').value;
      const confirmPassword = el.querySelector('#confirm-password').value;

      if (password !== confirmPassword) {
        alert('Passwords do not match!');
      } else {
        console.log(`User ${id} registered successfully.`);
      }
    });
  },
});
