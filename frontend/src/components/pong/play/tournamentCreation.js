import { createComponent } from "/src/utils/component.js";

export const tournamentCreation = createComponent({
  tag: "tournamentCreation",

  render: () => `
    <section class="col-12 d-flex flex-column align-items-center text-center p-5"
             style="background-color: #111111; color: white; max-height: 700px; overflow: auto;">
      
      <h1 class="mb-4">Tournament Creation</h1>
      
      <!-- Zone d'ajout d'un joueur -->
      <div class="w-50 mb-4">
        <div class="input-group">
          <input id="player-name" type="text" class="form-control" placeholder="Enter player name" aria-label="Player name">
          <button id="add-player" class="btn btn-primary" type="button">Add Player</button>
        </div>
      </div>
      
      <!-- Liste des joueurs -->
      <div class="w-50 mb-4">
        <h2>Players (<span id="players-count">0</span>/16)</h2>
        <ul id="players-list" class="list-group"></ul>
      </div>
      
      <!-- Bouton de création du tournoi -->
      <button id="create-tournament" class="btn btn-success" disabled>Create Tournament</button>
    </section>
  `,

  attachEvents: (el) => {
    let players = [];
    
    const playerNameInput      = el.querySelector("#player-name");
    const addPlayerButton      = el.querySelector("#add-player");
    const playersList          = el.querySelector("#players-list");
    const playersCountSpan     = el.querySelector("#players-count");
    const createTournamentButton = el.querySelector("#create-tournament");

    // Fonction de mise à jour de l'interface joueur
    function updatePlayersUI() {
      playersCountSpan.textContent = players.length;
      playersList.innerHTML = "";
      
      players.forEach((name, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.textContent = name;
        
        const removeButton = document.createElement("button");
        removeButton.className = "btn btn-danger btn-sm";
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {
          players.splice(index, 1);
          updatePlayersUI();
        });
        
        li.appendChild(removeButton);
        playersList.appendChild(li);
      });
      
      // Le bouton de création est activé uniquement si 16 joueurs ont été ajoutés.
      createTournamentButton.disabled = players.length !== 16;
    }

    // Ajouter un joueur
    addPlayerButton.addEventListener("click", () => {
      const name = playerNameInput.value.trim();
      if (!name) return; // On ignore les noms vides
      
      if (players.length >= 16) {
        alert("You can only add up to 16 players.");
        return;
      }
      
      players.push(name);
      playerNameInput.value = "";
      updatePlayersUI();
    });

    // Permettre d'appuyer sur "Enter" pour ajouter un joueur
    playerNameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addPlayerButton.click();
      }
    });

    // Lancer la création du tournoi
    createTournamentButton.addEventListener("click", () => {
      console.log("Tournament created with players:", players);
      // Ici, vous pouvez ajouter la logique pour lancer réellement la création du tournoi.
      // Par exemple, rediriger vers une autre page ou appeler une API.
      alert("Tournament created with players: " + players.join(", "));
      
      // Optionnel : réinitialiser la liste des joueurs après la création
      players = [];
      updatePlayersUI();
    });
  },
});
