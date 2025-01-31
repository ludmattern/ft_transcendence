import { createComponent } from "/src/utils/component.js";

export const tournamentContent = createComponent({
  tag: "tournamentContent",

  // Générer le HTML
  render: () => `
    <section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
        <h2 class="text-white text-center">Oh, You Want to Join a Tournament?</h2>
        <p class="text-secondary text-center">That’s adorable. Let’s see how long you last.</p>

        <!-- Tabs Navigation -->
        <ul class="nav nav-tabs justify-content-center">
            <li class="nav-item">
                <a class="nav-link active" id="tab-create" data-bs-toggle="tab" href="#createTournament">
                    Create Your Own Disaster
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="tab-join" data-bs-toggle="tab" href="#joinTournament">
                    Join an Ongoing Bloodbath
                </a>
            </li>
            <li class="nav-item">
                    <a class="nav-link" id="tab-myTournaments" data-bs-toggle="tab" href="#myTournaments">
                        My Tournaments
                    </a>
                </li>
        </ul>

        <!-- Tabs Content -->
        <div class="tab-content mt-4">
            <!-- Create Tournament -->
            <div class="tab-pane fade show active" id="createTournament">
                <h3 class="text-white">Create Your Own Tournament</h3>
                <p class="text-secondary">How cute, you actually think you’ll make it to the finals?</p>

                ${generateModeSelector()}
                ${generateMapSelector()}
                ${generateTournamentSizeSelector()}
				${onlineOrLocalTournamentSelector()}

                <div class="text-center">
                    <button class="btn btn-danger btn-lg mt-3" id="createTourn">Create This Mess</button>
                </div>
            </div>

            <!-- Join Tournament -->
            <div class="tab-pane fade" id="joinTournament">
                <h3 class="text-white">Join an Existing Tournament</h3>
                <p class="text-secondary">You want to join? Great, another victim enters the arena.</p>

                <div class="mb-3">
                    <label for="tournamentList" class="form-label text-white">Select a Tournament to Crash</label>
                    <select class="form-select" id="tournamentList">
                        
                    </select>
                    <small class="text-muted">Not that it matters, you'll be out in round one.</small>
                </div>

                <div class="text-center">
                    <button class="btn btn-primary mt-3" id="joinTourn">Join and Get Wrecked</button>
                </div>
            </div>

            <!-- My Tournaments -->
            <div class="tab-pane fade" id="myTournaments">
                <h3 class="text-white">Your Ongoing Tournaments</h3>
                <p class="text-secondary">Let's see if you are still in or already eliminated.</p>

                <div class="mb-3">
                    <label for="myTournamentList" class="form-label text-white">Your Active Tournaments</label>
                    <select class="form-select" id="myTournamentList">
                        <!-- List of joined tournaments will be inserted dynamically -->
                    </select>
                </div>
              
                <div class="text-center">
                    <button class="btn btn-success mt-3" id="viewTournament">View Tournament</button>
                </div>
                 <div class="mt-4" id="nextMatchContainer" style="display: none;">
                  <h4 class="text-white">Upcoming Match</h4>
                  <p class="text-secondary" id="nextMatchInfo"></p>
                  <button class="btn btn-warning mt-2" id="joinNextMatch" style="display: none;">Join Match</button>
                </div>
            </div>   
        </div>
    </section>
  `,

  attachEvents: (el) => {
    const tabs = el.querySelectorAll(".nav-link");
    const tabPanes = el.querySelectorAll(".tab-pane");

    const savedTabId = sessionStorage.getItem("activeTournamentTab");
    if (savedTabId) {
      tabs.forEach((tab) => tab.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("show", "active"));

      const activeTab = el.querySelector(`[href="#${savedTabId}"]`);
      const activePane = el.querySelector(`#${savedTabId}`);
      if (activeTab && activePane) {
        activeTab.classList.add("active");
        activePane.classList.add("show", "active");
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", (e) => {
        e.preventDefault();
        const target = tab.getAttribute("href").substring(1);

        tabs.forEach((t) => t.classList.remove("active"));
        tabPanes.forEach((pane) => pane.classList.remove("show", "active"));

        tab.classList.add("active");
        el.querySelector(`#${target}`).classList.add("show", "active");

        sessionStorage.setItem("activeTournamentTab", target);
      });
    });

    const selectors = el.querySelectorAll("select");
    selectors.forEach((select) => {
      const key = select.id;

      const savedValue = sessionStorage.getItem(key);
      if (savedValue) {
        select.value = savedValue;
      }

      select.addEventListener("change", () => {
        sessionStorage.setItem(key, select.value);
      });
    });

    const tabMyTournaments = el.querySelector("#tab-myTournaments");
    tabMyTournaments.addEventListener("click", () => {
      loadMyTournament();
    });

    const viewTournamentBtn = document.getElementById("viewTournament");
    viewTournamentBtn.addEventListener("click", () => {
      const tournamentSelect = document.getElementById("myTournamentList");
      const selectedTournamentId = tournamentSelect.value;

      if (!selectedTournamentId) {
        alert("Please select a tournament first!");
        return;
      }

      displayTournamentDetails(selectedTournamentId);
    });

    async function displayTournamentDetails(tournamentId) {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        console.error("No userId found");
        return;
      }

      try {
        const response = await fetch(
          `/api/matchmaking-service/get_current_match/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tournament_id: tournamentId }),
          }
        );

        const data = await response.json();

        let nextMatchContainer = document.getElementById("nextMatchContainer");
        let nextMatchInfo = document.getElementById("nextMatchInfo");
        let joinNextMatchBtn = document.getElementById("joinNextMatch");

        if (data.match) {
          const player1 = data.match[0];
          const player2 = data.match[1];

          nextMatchInfo.textContent = `Next match: ${player1.alias} vs ${player2.alias}`;

          const isUserInMatch =
            player1.user_id == userId || player2.user_id == userId;

          if (isUserInMatch) {
            joinNextMatchBtn.dataset.tournamentId = tournamentId;
            joinNextMatchBtn.style.display = "block";
          } else {
            joinNextMatchBtn.style.display = "none";
          }

          nextMatchContainer.style.display = "block";
        } else {
          nextMatchContainer.style.display = "none";
          joinNextMatchBtn.style.display = "none";
        }
      } catch (error) {
        console.error("Failed to load tournament details:", error);
      }
    }

    document.getElementById("joinNextMatch").addEventListener("click", () => {
      const tournamentId =
        document.getElementById("joinNextMatch").dataset.tournamentId;
      if (!tournamentId) return;

      fetch(`/api/matchmaking-service/get_current_match/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournament_id: tournamentId }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.match) {
            const gameId = `tournament_${tournamentId}_${data.match[0].user_id}_vs_${data.match[1].user_id}`;
            //ici lancer la game
          } else {
            alert("No match available yet!");
          }
        })
        .catch((error) => console.error("Error joining match:", error));
    });

    loadTournaments();
    const createTourn = document.getElementById("createTourn");
    createTourn.addEventListener("click", () => {
      createTournament();
    });
    const joinTourn = document.getElementById("joinTourn");
    joinTourn.addEventListener("click", () => {
      const tournamentSelect = document.getElementById("tournamentList");
      const selectedId = tournamentSelect.value;

      if (!selectedId) {
        alert("Please select a tournament first!");
        return;
      }

      const alias = prompt("Enter your alias name:");

      if (!alias) {
        alert("You must enter an alias to join!");
        return;
      }

      registerPlayer(selectedId, alias);
    });
  },
});

async function createTournament() {
  const userId = sessionStorage.getItem("userId");
  const name = "MyTournament";
  const size = parseInt(document.getElementById("tournamentSize").value, 10);
  const mapChoice = document.getElementById("mapSelect").value;

  const response = await fetch("/api/matchmaking-service/create_tournament/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      name,
      size,
      map: mapChoice,
    }),
  });
  const data = await response.json();
  console.log("Created tournament:", data.tournament_id);
  loadTournaments();
}

async function registerPlayer(tournamentId, alias) {
  const userId = sessionStorage.getItem("userId");
  const response = await fetch("/api/matchmaking-service/register_player/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tournament_id: tournamentId,
      user_id: userId,
      alias: alias,
    }),
  });
  const data = await response.json();
  console.log("Register result:", data);
}

async function loadTournaments() {
  try {
    const response = await fetch("/api/matchmaking-service/list_tournaments/");
    const data = await response.json();
    const tournamentSelect = document.getElementById("tournamentList");

    tournamentSelect.innerHTML = "";

    data.forEach((t) => {
      if (t.status === "registration") {
        // Filtrer ceux en cours
        const option = document.createElement("option");
        option.value = t.tournament_id;
        option.textContent = `${t.name} (${t.size} players) - ${t.status}`;
        tournamentSelect.appendChild(option);
      }
    });
  } catch (error) {
    console.error("Failed to load tournaments:", error);
  }
}

async function loadMyTournament() {
  const userId = sessionStorage.getItem("userId");
  if (!userId) {
    console.error("No userId found");
    return;
  }

  try {
    const response = await fetch(
      `/api/matchmaking-service/list_my_tournaments/${userId}/`
    );
    const data = await response.json();
    const myTournSelect = document.getElementById("myTournamentList");
    myTournSelect.innerHTML = "";

    let nextMatchContainer = document.getElementById("nextMatchContainer");
    let nextMatchInfo = document.getElementById("nextMatchInfo");
    let joinNextMatchBtn = document.getElementById("joinNextMatch");

    let hasNextMatch = false;

    data.forEach((t) => {
      const option = document.createElement("option");
      option.value = t.tournament_id;
      option.textContent = `${t.name} (${t.size} players) - ${t.status}`;

      if (t.current_match) {
        option.textContent += ` - Next: ${t.current_match[0].alias} vs ${t.current_match[1].alias}`;

        const isUserInMatch = t.current_match.some(
          (player) => player.user_id == userId
        );
        if (isUserInMatch) {
          hasNextMatch = true;
          nextMatchInfo.textContent = `Your next match: ${t.current_match[0].alias} vs ${t.current_match[1].alias}`;
          joinNextMatchBtn.dataset.tournamentId = t.tournament_id;
          joinNextMatchBtn.style.display = "block";
        }
      }

      myTournSelect.appendChild(option);
    });

    if (hasNextMatch) {
      nextMatchContainer.style.display = "block";
    } else {
      nextMatchContainer.style.display = "none";
      joinNextMatchBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Failed to load user's tournaments:", error);
  }
}

/**
 * Sélecteur du type de tournoi (Local ou Online)
 */
function generateModeSelector() {
  return `
    <div class="mb-3">
        <label for="tournamentMode" class="form-label text-white">Select Your Method of Humiliation</label>
        <select class="form-select" id="tournamentMode">
            <option value="local">Local - Get Mocked in Person</option>
            <option value="online">Online - Get Destroyed by Strangers</option>
        </select>
        <small class="text-muted">Either way, you're getting eliminated first.</small>
    </div>
  `;
}

/**
 * Génère le sélecteur de map
 */
function generateMapSelector() {
  return `
    <div class="mb-3">
        <label for="mapSelect" class="form-label text-white">Select Your Battlefield</label>
        <select class="form-select" id="mapSelect">
            <option value="map1">The Pit of Futility</option>
            <option value="map2">Asteroid Wasteland of Despair</option>
            <option value="map3">Nebula of Certain Defeat</option>
            <option value="map4">The Black Hole of No Return</option>
        </select>
        <small class="text-muted">Not that it matters. You're getting eliminated anyway.</small>
    </div>
  `;
}

/**
 * Génère le sélecteur du format du tournoi (4, 8 ou 16 joueurs)
 */
function generateTournamentSizeSelector() {
  return `
    <div class="mb-3">
        <label for="tournamentSize" class="form-label text-white">Select the Size of Your Demise</label>
        <select class="form-select" id="tournamentSize">
            <option value="2">2 Players - Humiliation</option>
            <option value="4">4 Players - A Small-Scale Humiliation</option>
            <option value="8">8 Players - Double the Disappointment</option>
            <option value="16">16 Players - A Public Execution</option>
        </select>
        <small class="text-muted">The more players, the more people watching you fail.</small>
    </div>
  `;
}

function onlineOrLocalTournamentSelector() {
  return `
	<div class="mb-3 form-check">
	  <input class="form-check-input" type="checkbox" id="onlineOrLocalCheckbox">
	  <label class="form-check-label" for="onlineOrLocalCheckbox">
	    The lads are coming over for a local tournament
	  </label>
 	</div>
  `;
}
