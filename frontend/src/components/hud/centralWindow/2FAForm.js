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
          <div id="qr-code-container" class="mb-3" style="display: none;">
            <p>Scan this QR code with your Google Authenticator app:</p>
            <img id="qr-code" src="" alt="QR Code" />
          </div>
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
    const twofaMethod = sessionStorage.getItem("pending2FA_method");

    if (twofaMethod === "authenticator-app") {
      const qrCodeContainer = el.querySelector("#qr-code-container");
      const qrCodeImage = el.querySelector("#qr-code");

      try {
        const response = await fetch(`/api/auth-service/generate-qr/${username}/`);
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          qrCodeImage.src = url;
          qrCodeContainer.style.display = "block";
        } else {
          console.error("Failed to load QR code:", response.statusText);
        }
      } catch (err) {
        console.error("Error fetching QR code:", err.message);
      }
    }

    el.querySelector("form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const code = el.querySelector("#twofa-code").value;

      try {
        const data = await verifyTwoFACode(username, code);

        if (data.success) {
          console.log("2FA verified successfully!");
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
