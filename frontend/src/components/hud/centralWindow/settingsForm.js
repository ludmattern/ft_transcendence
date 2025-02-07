import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';

export const settingsForm = createComponent({
  tag: 'settingsForm',

  // Générer le HTML
  render: () => `
    <div id="settings-form" class="form-container">
      <h5>SETTINGS</h5>
      <span class="background-central-span">
        <form action="#" method="post" class="w-100">
          <!-- New Username -->
          ${createFormGroup('new-username', 'username', 'New username')}
          <!-- Old Password -->
          ${createFormGroup('old-password', 'password', 'Old password')}
          <!-- New Password -->
          ${createFormGroup('new-password', 'password', 'New Password')}
          <!-- Confirm New Password -->
          ${createFormGroup('confirm-new-password', 'password', 'Confirm new password')}
          <!-- New Email -->
          ${createFormGroup('new-email', 'email', 'New Email')}
          <!-- Confirm New Email -->
          ${createFormGroup('confirm-new-email', 'email', 'Confirm new Email')}
          <!-- Language -->
          <div class="form-group">
            <label class="mb-3" for="language">Language</label>
            <select id="language" name="language" class="form-control p-3" required>
              <option value="french">French</option>
              <option value="english">English</option>
              <option value="german">German</option>
            </select>
          </div>
          <!-- Update Button -->
          <button class="btn bi bi-arrow-repeat" id="update-button">Update</button>
        </form>
        <!-- Delete Account -->
        <div>
          <span>
            <p>
              Delete Account? 
              <a href="#" id="delete-account-link" class="text-info">resign</a>
            </p>
          </span>
        </div>
      </span>
    </div>
  `,

  // Ajouter les événements après le chargement
  attachEvents: (el) => {
    // Gestionnaire pour le bouton "Update"
    el.querySelector('#update-button').addEventListener('click', (e) => {
      e.preventDefault();
      const formData = collectFormData(el);
      console.log('Form data:', formData);
      // TODO: Appel API pour la mise à jour des paramètres
    });

    // Gestionnaire pour le lien "Delete Account"
    el.querySelector('#delete-account-link').addEventListener('click', (e) => {
      e.preventDefault();
      handleRoute('/settings/delete-account'); // Redirige vers la page de suppression de compte
    });
  },
});

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
      <input type="${type}" id="${id}" name="${id}" class="form-control" required />
    </div>
  `;
}

/**
 * Collecte les données du formulaire
 *
 * @param {HTMLElement} el - Élément racine du formulaire
 * @returns {Object} - Données collectées du formulaire
 */
function collectFormData(el) {
  return {
    newUsername: el.querySelector('#new-username').value,
    oldPassword: el.querySelector('#old-password').value,
    newPassword: el.querySelector('#new-password').value,
    confirmPassword: el.querySelector('#confirm-new-password').value,
    newEmail: el.querySelector('#new-email').value,
    confirmEmail: el.querySelector('#confirm-new-email').value,
    language: el.querySelector('#language').value,
  };
}
