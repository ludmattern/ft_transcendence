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
            <div id="error-message" class="text-danger mt-2" style="display: none;">Invalid credentials</div>
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
      e.preventDefault(); 

      const pilotId = el.querySelector("#pilot-id").value;
      const password = el.querySelector("#password").value;
      try 
      {
        const data = await loginUser(pilotId, password);
        if (data.twofa_method) 
        {
          console.log("2FA is required. Switching to the 2FA mini-form...");
          sessionStorage.setItem("pending2FA_user", pilotId);
          sessionStorage.setItem("pending2FA_method", data.twofa_method);

          handleRoute("/login/2fa");
        } 
        else 
        {
          console.log("Login successful!");
          handleRoute("/");
        }
      } catch (err) {
        console.error("Login failed:", err.message);
        document.getElementById("error-message").style.display = "block";
      }

      console.log("Login submitted!");
    });
  },
});
