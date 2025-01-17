import { createComponent } from "/src/utils/component.js";

export const multiplayerContent = createComponent({
  tag: "multiplayerContent",

  // Générer le HTML
  render: () => `
    <section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
        <h2 class="text-white text-center">So, You Actually Want to Play Multiplayer?</h2>
        <p class="text-secondary text-center">Fine. Choose how you'd like to embarrass yourself.</p>

        <!-- Tabs Navigation -->
        <ul class="nav nav-tabs justify-content-center">
            <li class="nav-item">
                <a class="nav-link active" id="tab-local" data-bs-toggle="tab" href="#local">Local</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-matchmaking" data-bs-toggle="tab" href="#matchmaking">Matchmaking</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-private" data-bs-toggle="tab" href="#private">Private</a>
            </li>
        </ul>

        <!-- Tabs Content -->
        <div class="tab-content mt-4">
            <!-- Local Play -->
            <div class="tab-pane fade show active" id="local">
                <h3 class="text-white">Local Multiplayer</h3>
                <p class="text-secondary">Oh, you actually think you're better than your friend sitting next to you? Cute.</p>

                ${generateMapSelector()}
                ${generatePlayerCountSelector()}
                
                <button class="btn btn-warning mt-3">Challenge Your Friend and Lose Together</button>
            </div>

            <!-- Matchmaking -->
            <div class="tab-pane fade" id="matchmaking">
                <h3 class="text-white">Online Matchmaking</h3>
                <p class="text-secondary">Ah yes, let’s throw you into the fire against people who do nothing but play this game.</p>

                ${generateMapSelector()}
                ${generatePlayerCountSelector()}

                <button class="btn btn-danger mt-3">Queue Up for Instant Regret</button>
            </div>

            <!-- Private Match -->
            <div class="tab-pane fade" id="private">
                <h3 class="text-white">Private Match</h3>
                <p class="text-secondary">Want to set up a match? Good luck convincing anyone to join.</p>

                ${generateMapSelector()}
                ${generatePlayerCountSelector()}

                <div class="input-group mb-3 mt-3">
                    <input type="text" class="form-control" placeholder="Enter Room Code" aria-label="Room Code">
                    <button class="btn btn-secondary">Join Room and Get Wrecked</button>
                </div>
                <button class="btn btn-primary">Create a Room (So You Can Lose in Private)</button>
            </div>
        </div>
    </section>
  `,

  attachEvents: (el) => {
    // Activer le premier onglet par défaut
    const tabs = el.querySelectorAll(".nav-link");
    tabs.forEach(tab => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const target = tab.getAttribute("href").substring(1);

        // Désactiver tous les onglets et les cacher
        tabs.forEach(t => t.classList.remove("active"));
        el.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("show", "active"));

        // Activer l'onglet sélectionné
        tab.classList.add("active");
        el.querySelector(`#${target}`).classList.add("show", "active");
      });
    });
  }
});

/**
 * Génère le sélecteur de map (car il est identique pour chaque mode de jeu)
 */
function generateMapSelector() {
  return `
    <div class="mb-3">
        <label for="mapSelect" class="form-label text-white">Select Your Battlefield</label>
        <select class="form-select" id="mapSelect" aria-describedby="mapHelp">
            <option value="map1">The Pit of Futility</option>
            <option value="map2">Asteroid Wasteland of Despair</option>
            <option value="map3">Nebula of Certain Defeat</option>
            <option value="map4">The Black Hole of No Return</option>
        </select>
        <small id="mapHelp" class="text-muted">Not that it will help. You're losing anyway.</small>
    </div>
  `;
}

/**
 * Génère le sélecteur du nombre de joueurs (2 ou 4)
 */
function generatePlayerCountSelector() {
  return `
    <div class="mb-3">
        <label for="playerCount" class="form-label text-white">Select the Number of Victims</label>
        <select class="form-select" id="playerCount" aria-describedby="playerHelp">
            <option value="2">2 Players - One-on-One Humiliation</option>
            <option value="4">4 Players - Double the Embarrassment</option>
        </select>
        <small id="playerHelp" class="text-muted">More players won’t help you win, just make your defeat more public.</small>
    </div>
  `;
}
