import { createComponent } from "/src/utils/component.js";
import { testloadComponent } from "/src/utils/virtualDOM.js";
import { subscribeForm } from "/src/components/subscribeForm.js"; // Exemple d'un sous-composant
import { unloadComponent } from "/src/utils/virtualDOM.js";
import { handleRoute } from "/src/services/router.js";

export const loginForm = createComponent({
  tag: "loginForm",

  render: () => `
    <div id="login-form" class="form-container flex-column justify-content-around text-center active">
      <h5>PILOT IDENTIFICATION - LOG IN</h5>
      <span class="background-central-span">
        <form action="#" method="post" class="w-100">
          <div class="form-group">
            <label class="mb-3" for="pilot-id">ID</label>
            <input type="text" id="pilot-id" name="pilot-id" class="form-control" required />
          </div>
          <div class="form-group">
            <label class="mb-3" for="password">Password</label>
            <input type="password" id="password" name="password" class="form-control" required />
          </div>
          <button class="btn bi bi-check">accept</button>
        </form>
        <div>
          <span>
            <p>New pilot? <a href="#" id="enlist-link" class="text-info">Enlist</a></p>
          </span>
        </div>
      </span>
    </div>
  `,

  attachEvents: (el) => {
    el.querySelector("#enlist-link").addEventListener("click", (e) => {
      e.preventDefault();
	  handleRoute("/subscribe");
      console.info("SubscribeForm loaded on click.");
    });

    el.querySelector("form").addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("Login submitted!");
    });
  },
});
