import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { validatePassword } from '/src/components/hud/centralWindow/subscribeForm.js';
import { validateId } from '/src/components/hud/centralWindow/subscribeForm.js';
import { checkPasswordConfirmation } from '/src/components/hud/centralWindow/subscribeForm.js';
import { checkEmailConfirmation } from '/src/components/hud/centralWindow/subscribeForm.js';
import { validateMail } from '/src/components/hud/centralWindow/subscribeForm.js';
import { resetErrorMessages } from '/src/components/hud/centralWindow/subscribeForm.js';


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
  attachEvents: async (el) => {
    // Gestionnaire pour le bouton "Update"
    el.querySelector('#update-button').addEventListener('click', async (e) => {
      e.preventDefault();
      const formData = collectFormData(el);

      console.log('Form data:', formData);
      // TODO: Appel API pour la mise à jour des paramètres.

      resetErrorMessages();

      let canRegister = true;

      if (!validateId(formData.username)) canRegister = false;
      if (canRegister && formData.newEmail)
        if (!validateMail(formData.newEmail))
          canRegister = false;
      if (canRegister && formData.newPassword && !validatePassword(formData.newPassword)) canRegister = false;
      if (canRegister && formData.newPassword && formData.confirmPassword && !checkPasswordConfirmation(formData.newPassword, formData.confirmPassword)) canRegister = false;
      if (canRegister && formData.newEmail && formData.confirmMail && !checkEmailConfirmation(formData.newEmail, formData.confirmMail)) canRegister = false;
      if (canRegister) {
        try {
          const response = await fetch("/api/user-service/update/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          const data = await response.json();
          if (data.success) {
            if (formData.newUsername) {
              sessionStorage.setItem("registered_user", formData.newUsername);
              sessionStorage.setItem("username", formData.newUsername);
            }
            alert('Information updated successfully.');
          } else {
            {
              if (data.message.includes("Username already taken")) {
                document.getElementById("error-message-id").style.display = "block";
              } else {
                document.getElementById("error-message-id").style.display = "none";
              }

              if (data.message.includes("Email already in use")) {
                document.getElementById("error-message-mail").style.display = "block";
                document.getElementById("error-message-mail2").style.display = "none";
              } else {
                document.getElementById("error-message-mail").style.display = "none";
              }
            }
          }
        } catch (error) {
          console.error('Error updating information:', error);
          alert('An unexpected error occurred.');
        }
      }
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
      ${id === 'new-username' ? '<div id="error-message-id" class="text-danger mt-2" style="display: none;">Id already taken</div>' : ''}
      ${id === 'new-username' ? '<div id="bad-id" class="text-danger mt-2" style="display: none;">Id must contain between 6 and 20 char</div>' : ''}
      ${id === 'new-password' ? '<div id="bad-pass-size" class="text-danger mt-2" style="display: none;">Password must contain between 6 and 20 char</div>' : ''}
      ${id === 'new-password' ? '<div id="bad-pass-upper" class="text-danger mt-2" style="display: none;">Password must have at least one uppercase char</div>' : ''}
      ${id === 'new-password' ? '<div id="bad-pass-lower" class="text-danger mt-2" style="display: none;">Password must have at least one lowercase char</div>' : ''}
      ${id === 'new-password' ? '<div id="bad-pass-special" class="text-danger mt-2" style="display: none;">Password must have at least one special char</div>' : ''}
      ${id === 'confirm-new-password' ? '<div id="error-message-pass" class="text-danger mt-2" style="display: none;">Password does not match</div>' : ''}
      ${id === 'new-email' ? '<div id="error-message-mail" class="text-danger mt-2" style="display: none;">E-mail already taken</div>' : ''}
      ${id === 'new-email' ? '<div id="error-message-mail-size" class="text-danger mt-2" style="display: none;">E-mail too long</div>' : ''}
      ${id === 'confirm-new-email' ? '<div id="error-message-mail2" class="text-danger mt-2" style="display: none;">E-mail does not match</div>' : ''}
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
    username: sessionStorage.getItem('username'),
    newUsername: el.querySelector('#new-username').value,
    oldPassword: el.querySelector('#old-password').value,
    newPassword: el.querySelector('#new-password').value,
    confirmPassword: el.querySelector('#confirm-new-password').value,
    newEmail: el.querySelector('#new-email').value,
    confirmEmail: el.querySelector('#confirm-new-email').value,
    language: el.querySelector('#language').value,
  };
}


