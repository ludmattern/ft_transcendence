import { createComponent } from "/src/utils/component.js";
import { handleRoute, getPreviousRoute } from "/src/services/router.js";

export const lostForm = createComponent({
  tag: "lostForm",

  // Générer le HTML
  render: () => `
    <div id="logout-form" class="form-container">
      <h5>Wrong turn</h5>
      <span class="background-central-span">
        <p>It seems you're lost, let me help you</p>
        <div class="d-flex justify-content-center">
          <button class="btn bi bi-x" id="go-back">Back</button>
        </div>
      </span>
    </div>
  `,

  attachEvents: (el) => {
    // Annuler la déconnexion
    el.querySelector("#go-back").addEventListener("click", (e) => {
      e.preventDefault();
      handleRoute(getPreviousRoute());
    });
  },
});
