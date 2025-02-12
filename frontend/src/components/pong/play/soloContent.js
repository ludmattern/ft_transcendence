import { createComponent } from "/src/utils/component.js";
import { playGame } from "/src/components/pong/play/utils.js";

export const soloContent = createComponent({
  tag: "soloContent",

  // Générer le HTML
  render: () => `
    <section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
      <h2 class="text-white text-center">So, You Think You Can Win against AI?</h2>
      <p class="text-secondary text-center">How adorable. Choose your doomed battlefield and prepare for utter humiliation.</p>

      <div class="col tab-content">
        <div class="tab-panel fade show active" id="pageTest" role="tabpanel">
          <div class="tab-panel fade show active" id="submenu1" role="tabpanel">
            <fieldset class="mb-3 text-white">
              <legend class="h4">Pointless Battle Settings</legend>

              <div class="mb-3">
                <label for="difficulty" class="form-label">Select How Fast You’ll Regret This</label>
                <select class="form-select" id="difficulty" aria-describedby="difficultyHelp">
                  <option value="hard">Painful</option>
                  <option value="very-hard">Excruciating</option>
                  <option value="insane">Instant Regret</option>
                </select>
                <small id="difficultyHelp" class="text-secondary">Seriously? You're making it worse for yourself.</small>
              </div>

              <div class="mb-3 form-check">
                <input class="form-check-input" type="checkbox" id="liabilityCheckbox">
                <label class="form-check-label" for="liabilityCheckbox">
                  I fully acknowledge my inevitable defeat and accept total humiliation.
                </label>
              </div>

              <div class="text-center">
                <button class="mt-3 btn btn-danger" id="launch">Proceed to Your Doom</button>
              </div>
            </fieldset>
          </div>
        </div>
      </div>
    </section>
  `,

  // Ajouter les événements pour gérer sessionStorage
  attachEvents: () => {
    const difficulty = document.getElementById("difficulty");
    const liabilityCheckbox = document.getElementById("liabilityCheckbox");

    // Charger les valeurs sauvegardées
    const savedDifficulty = sessionStorage.getItem("difficulty");
    const savedLiability = sessionStorage.getItem("liabilityCheckbox");

    if (savedDifficulty) difficulty.value = savedDifficulty;
    if (savedLiability) liabilityCheckbox.checked = savedLiability === "true";


    difficulty.addEventListener("change", () => {
      sessionStorage.setItem("difficulty", difficulty.value);
    });

    liabilityCheckbox.addEventListener("change", () => {
      sessionStorage.setItem("liabilityCheckbox", liabilityCheckbox.checked);
    });

    const launchButton = document.getElementById("launch");

    launchButton.addEventListener("click", () => {
      playGame("solo");
    })
  },
});
