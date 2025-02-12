import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";
import componentManagers from "/src/index.js";
import { headerIngame } from "/src/components/hud/index.js";

export const pongTuto = (mode = "duo") => createComponent({
  tag: "pongTuto",

  // Générer le HTML
  render: () => `
    <div id="logout-form" class="form-container">
      <h5>Get Ready for the Match!</h5>
      <div class="background-central-span p-3">
        <p class="mb-3">${mode === "duo" ? "Here are the controls for each player:" : "Here are your controls:"}</p>

        <div class="mb-3">
          <h6>Player 1: <strong>${sessionStorage.getItem("username") || "Guest"}</strong></h6>
          <p><strong class="border p-2">W</strong> up</p>
          <p><strong class="border p-2">A</strong> left <strong class="border p-2">S</strong> down <strong class="border p-2">D</strong> right</p>
        </div>

        ${mode === "duo" ? `
        <div class="mb-3">
          <h6>Player 2: <strong>Guest</strong></h6>
          <p><strong class="border p-2">↑</strong> up</p>
          <p><strong class="border p-2">←</strong> left <strong class="border p-2">↓</strong> down <strong class="border p-2">→</strong> right</p>
        </div>` : ""}
        
        <label class="form-label">
          <p>Click "Ready" when you're set to play!</p>
        </label>

        <div class="d-flex justify-content-center">
          <button class="btn success bi bi-check" id="ready"> Ready </button>
          <button class="btn danger bi bi-x" id="close"> Cancel </button>
        </div>
      </div>
    </div>
  `,

  attachEvents: (el) => {
    // Annuler la déconnexion
    el.querySelector("#close").addEventListener("click", (e) => {
      e.preventDefault();
      handleRoute("/pong/play/solo");
    });

    el.querySelector("#ready").addEventListener("click", () => {
      console.log("Player is ready");
      componentManagers['HUD'].unloadComponent('pongTuto');
      componentManagers['HUD'].unloadComponent('header');
      componentManagers['HUD'].loadComponent('#header-container', headerIngame);
    });
  },
});
