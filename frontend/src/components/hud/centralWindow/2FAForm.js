import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";
import { verifyTwoFACode } from "/src/services/auth.js";

export const twoFAForm = createComponent({
  tag: "twoFAForm",

  render: () => `
    <div id="twofa-form" class="form-container flex-column justify-content-around text-center active">
      <h5>Two-Factor Authentication</h5>
      <span class="background-central-span">
        <form action="#" method="post" class="w-100">
          <div class="form-group">
            <label class="mb-3" for="twofa-code">Enter your 2FA code</label>
            <input type="text" id="twofa-code" name="twofa-code" class="form-control" required />
            <div id="twofa-error" class="text-danger mt-2" style="display: none;">Invalid 2FA code</div>
          </div>
          <button class="btn bi bi-check">Verify</button>
        </form>
      </span>
    </div>
  `,

  attachEvents: async (el) => 
    {
    const username = sessionStorage.getItem("pending2FA_user");

    el.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const code = el.querySelector("#twofa-code").value;

      try {
        const data = await verifyTwoFACode(username, code);

        if (data.success) {
          sessionStorage.removeItem("pending2FA_user");
          sessionStorage.removeItem("pending2FA_method");
          handleRoute("/");
        } else {
          console.error("2FA verification failed:", data.message);
          document.getElementById("twofa-error").style.display = "block";
        }
      } catch (err) {
        console.error("2FA request error:", err.message);
      }
    });
  },
});
