import { createComponent } from "/src/utils/component.js";
import { handleRoute, getPreviousRoute } from "/src/services/router.js";

export const deleteAccountForm = createComponent({
  tag: "deleteAccountForm",

  // Générer le HTML
  render: () => `
    <div id="delete-account-form" class="form-container">
      <h5>RESIGN</h5>
      <span class="background-central-span">
        <p>Are you sure you want to delete your account?</p>
        <p>This action can't be reversed.</p>
        <div class="d-flex justify-content-center">
          <button class="btn bi bi-x" id="cancel-delete">No</button>
          <button class="btn bi bi-check danger" id="confirm-delete">Yes</button>
        </div>
      </span>
    </div>
  `,

  // Ajouter les événements après le chargement
  attachEvents: (el) => {
    el.addEventListener("click", (e) => {
      if (e.target.matches("#cancel-delete")) {
        e.preventDefault();
        handleRoute(getPreviousRoute()); // Retour à la route précédente
        console.info(`Back to ${getPreviousRoute()} on click.`);
      }

      if (e.target.matches("#confirm-delete")) {
        e.preventDefault();
        console.warn("Account deletion confirmed. Executing deletion process...");
        handleRoute("/login"); // Redirection vers login
      }
    });
  },
});
