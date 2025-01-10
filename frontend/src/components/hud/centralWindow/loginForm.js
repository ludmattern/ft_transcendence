import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";
import { loginUser } from "/src/services/auth.js";

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

    el.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault(); // Empêche la soumission par défaut du formulaire

      // Récupère les valeurs des champs
      const pilotId = el.querySelector("#pilot-id").value;
      const password = el.querySelector("#password").value;

      try {
        // Appelle la fonction asynchrone et attend sa réponse
        await loginUser(pilotId, password);

        // Si la promesse est résolue, on redirige vers "/"
        handleRoute("/");
        console.log("Login successful!");
      } catch (err) {
        // Si la promesse est rejetée, on affiche une erreur
        console.error("Login failed:", err.message);
        alert("Login failed! Please try again.");
      }

      console.log("Login submitted!");
    });
  },
});
