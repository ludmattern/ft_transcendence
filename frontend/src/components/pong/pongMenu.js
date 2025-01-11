import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";
import { CSS3DObject } from "https://esm.sh/three/examples/jsm/renderers/CSS3DRenderer.js";
import Store from "/src/3d/store.js";

export const pongMenu = createComponent({
  tag: "pongMenu",

  // Générer le HTML
  render: () => `
    <div class="container-fluid menu1" id="menu2">
      ${HeaderNav()}
      <div class="row mt-4 tab-content" id="mainTabsContent">
        ${PlaySection()}
        ${LeaderboardSection()}
      </div>
    </div>
  `,

  // Ajouter les événements après le chargement
  attachEvents: (el) => {
    // Initialisation de la scène 3D
    initM1();

    // Gestion des événements liés aux boutons
    el.querySelectorAll(".btn-primary.tab").forEach((btn) =>
      btn.addEventListener("click", joinTournament)
    );

    el.querySelectorAll(".btn-secondary.btn-sm").forEach((btn) =>
      btn.addEventListener("click", leaveTournament)
    );

    el.querySelector(".btn-back")?.addEventListener("click", (e) => {
      e.preventDefault();
      handleRoute("/");
    });

    el.querySelectorAll("#matchmakingSelection button").forEach((btn) =>
      btn.addEventListener("click", startMatchmaking)
    );

    el.querySelectorAll("#waitingRoomMatchmaking button").forEach((btn) =>
      btn.addEventListener("click", cancelMatchmaking)
    );
  },
});

function HeaderNav() {
  return `
    <div class="row align-items-center py-3 top-row">
      <div class="col text-start"></div>
      <div class="col text-center">
        <ul class="nav nav-pills justify-content-center" id="mainTabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active top menu"
              id="play-tab"
              data-bs-toggle="pill"
              data-bs-target="#playContent"
              type="button"
              role="tab"
              aria-controls="playContent"
              aria-selected="true">
              Play
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
              class="nav-link top"
              id="leaderboard-tab"
              data-bs-toggle="pill"
              data-bs-target="#leaderboardContent"
              type="button"
              role="tab"
              aria-controls="leaderboardContent"
              aria-selected="false">
              Leaderboard
            </button>
          </li>
        </ul>
      </div>
      <div class="col text-end">
        <button class="btn btn-back mt-0">Back</button>
      </div>
    </div>
  `;
}

function PlaySection() {
  return `
    <div class="tab-pane fade show active" id="playContent" role="tabpanel" aria-labelledby="play-tab">
      <div class="row">
        <div class="col-3">
          <div class="nav flex-column nav-pills menu" id="play-vertical-tabs" role="tablist" aria-orientation="vertical">
            <button class="nav-link active left" id="play1-tab" data-bs-toggle="pill" data-bs-target="#play1" type="button" role="tab" aria-controls="play1" aria-selected="true">Local / Solo</button>
            <button class="nav-link left" id="play2-tab" data-bs-toggle="pill" data-bs-target="#play2" type="button" role="tab" aria-controls="play2" aria-selected="false">Multiplayer</button>
            <button class="nav-link left" id="play3-tab" data-bs-toggle="pill" data-bs-target="#play3" type="button" role="tab" aria-controls="play3" aria-selected="false">Tournament</button>
          </div>
        </div>
        <div class="col">
          ${LocalSoloTabs()}
          ${MultiplayerTabs()}
          ${TournamentTabs()}
        </div>
      </div>
    </div>
  `;
}

function LeaderboardSection() {
  return `
    <div class="tab-pane fade" id="leaderboardContent" role="tabpanel" aria-labelledby="leaderboard-tab">
      <div class="row">
        <div class="col-3"></div>
        <div class="col">
          <div class="leader">
            <h3>Leaderboard</h3>
            <button class="btn btn-primary mb-3 leadbtn">Find me</button>
            <div class="table-container">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th style="background-color: #000000; color: white;">Rank</th>
                    <th style="background-color: #000000; color: white;">Player</th>
                    <th style="background-color: #000000; color: white;">Score</th>
                  </tr>
                </thead>
                <tbody>
                  ${Array.from({ length: 20 }).map(() => `
                      <tr>
                        <td style="background-color: #000000; color: white;">1</td>
                        <td style="background-color: #000000; color: white;">PlayerOne</td>
                        <td style="background-color:transparent; color: white;">2500</td>
                      </tr>`
                    ).join("")}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function LocalSoloTabs() {
  return `
	<!-- LocalSoloTabs (play1) -->
	<div class="tab-content">
		<div class="tab-pane fade show active" id="play1" role="tabpanel" aria-labelledby="play1-tab">
			<ul class="nav nav-pills mb-3" id="soloLocalTabs" role="tablist">
				<li class="nav-item" role="presentation">
					<button class="nav-link active right" id="solo-tab" data-bs-toggle="pill" data-bs-target="#soloContent" type="button" role="tab" aria-controls="soloContent" aria-selected="true">Solo</button>
				</li>
				<li class="nav-item" role="presentation">
					<button class="nav-link right" id="local-tab" data-bs-toggle="pill" data-bs-target="#localContent" type="button" role="tab" aria-controls="localContent" aria-selected="false">Local</button>
				</li>
			</ul>
			<!-- SoloContent -->
			<div class="tab-content">
				<div class="tab-pane fade show active" id="soloContent" role="tabpanel" aria-labelledby="solo-tab">
					<h3>Select a map</h3>
					<select class="form-select mb-3" aria-label="Map selector solo">
						<option value="map1">Map 1</option>
						<option value="map2">Map 2</option>
						<option value="map3">Map 3</option>
					</select>
					<h3>Difficulty</h3>
					<select class="form-select mb-3" aria-label="Difficulty selector">
						<option value="easy">Easy</option>
						<option value="medium">Medium</option>
						<option value="hard">Hard</option>
					</select>
					<div class="d-flex justify-content-center mt-5">
						<button class="btn btn-primary mt-3">Launch</button>
					</div>
				</div>

				<!-- LocalContent -->
				<div class="tab-pane fade" id="localContent" role="tabpanel" aria-labelledby="local-tab">
					<h3>Select a map</h3>
					<select class="form-select mb-3" aria-label="Map selector local">
						<option value="map1">Map 1</option>
						<option value="map2">Map 2</option>
						<option value="map3">Map 3</option>
					</select>
					<div class="d-flex justify-content-center mt-5">
						<button class="btn btn-primary mt-3">Launch</button>
					</div>
				</div>
			</div>
		</div>
	</div>
  `;
}

function MultiplayerTabs() {
  return `
	<div class="tab-pane fade" id="play2" role="tabpanel" aria-labelledby="play2-tab">
		<ul class="nav nav-pills mb-3" id="multiplayerTabs" role="tablist">
			<li class="nav-item" role="presentation">
				<button class="nav-link active right" id="matchmaking-tab" data-bs-toggle="pill" data-bs-target="#matchmakingContent" type="button" role="tab" aria-controls="matchmakingContent" aria-selected="true"> Matchmaking </button>
			</li>
			<li class="nav-item" role="presentation">
				<button class="nav-link right" id="mp-private-tab" data-bs-toggle="pill" data-bs-target="#mpPrivateContent" type="button" role="tab" aria-controls="mpPrivateContent" aria-selected="false"> Private </button>
			</li>
		</ul>

		<!-- MatchmakingContent -->
		<div class="tab-content">
			<div class="tab-pane fade show active" id="matchmakingContent" role="tabpanel" aria-labelledby="matchmaking-tab">
				<div id="matchmakingSelection">
					<h3>Select a map</h3>
					<select class="form-select mb-3" aria-label="Map selector solo">
						<option value="map1">Map 1</option>
						<option value="map2">Map 2</option>
						<option value="map3">Map 3</option>
					</select>
					<div class="d-flex justify-content-center mt-5">
						<button class="btn btn-primary mt-3" onclick="startMatchmaking()">Launch</button>
					</div>
				</div>
				<div id="waitingRoomMatchmaking" class="d-none matchm">
					<h4>Waiting Room</h4>
					<p>Searching for players...</p>
					<button class="btn btn-secondary btn-sm" onclick="cancelMatchmaking()">Cancel</button>
				</div>
			</div>

			<!-- MpPrivateContent -->
			<div class="tab-pane fade" id="mpPrivateContent" role="tabpanel" aria-labelledby="mp-private-tab">
				<h3>Select a map</h3>
				<select class="form-select mb-3" aria-label="Map selector multiplayer private">
				<option value="map1">Map 1</option>
				<option value="map2">Map 2</option>
				<option value="map3">Map 3</option>
				</select>
				<h3>Invite Player</h3>
				<input type="text" class="form-control mb-3" placeholder="Player Name or ID">
				<div class="d-flex justify-content-center mt-5">
					<button class="btn btn-primary mt-3">Launch</button>
				</div>
			</div>
		</div>
	</div>
  `;
}

function TournamentTabs() {
  return `
	<!-- TournamentTabs (play3) -->
	<div class="tab-pane fade" id="play3" role="tabpanel" aria-labelledby="play3-tab">
		<ul class="nav nav-pills mb-3" id="tournamentTabs" role="tablist">
			<li class="nav-item" role="presentation">
				<button class="nav-link active right" id="tournament-join-tab" data-bs-toggle="pill" data-bs-target="#tournamentJoinContent" type="button" role="tab" aria-controls="tournamentJoinContent" aria-selected="true">Join</button>
			</li>
			<li class="nav-item" role="presentation">
				<button class="nav-link right" id="tournament-create-tab" data-bs-toggle="pill" data-bs-target="#tournamentCreateContent" type="button" role="tab" aria-controls="tournamentCreateContent" aria-selected="false">Create</button>
			</li>
		</ul>

		<!-- TournamentJoinContent -->
		<div class="tab-content tab2 tab3">
			<div class="tab-pane fade show active" id="tournamentJoinContent" role="tabpanel" aria-labelledby="tournament-join-tab">
				<div id="tournamentList">
					<h4>Available Tournaments</h4>
					<div class="table-container t">
						<table class="table">
							<thead>
								<tr>
									<th style="background-color: #000000; color: white;">Name</th>
									<th style="background-color: #000000; color: white;">Players</th>
									<th style="background-color: #000000; color: white;"></th>
								</tr>
							</thead>
							<tbody class="tbody">
								<!-- Répétez 5 fois -->
								<tr>
									<td style="background-color: #000000; color: white;">Tournoi A</td>
									<td style="background-color: #000000; color: white;">5/8</td>
									<td style="background-color: #000000; color: white;">
										<button class="btn btn-primary btn-sm tab" onclick="joinTournament()">Join</button>
									</td>
								</tr>
								<tr>
									<td style="background-color: #000000; color: white;">Tournoi A</td>
									<td style="background-color: #000000; color: white;">5/8</td>
									<td style="background-color: #000000; color: white;">
										<button class="btn btn-primary btn-sm tab" onclick="joinTournament()">Join</button>
									</td>
								</tr>
								<tr>
									<td style="background-color: #000000; color: white;">Tournoi A</td>
									<td style="background-color: #000000; color: white;">5/8</td>
									<td style="background-color: #000000; color: white;">
										<button class="btn btn-primary btn-sm tab" onclick="joinTournament()">Join</button>
									</td>
								</tr>
								<tr>
									<td style="background-color: #000000; color: white;">Tournoi A</td>
									<td style="background-color: #000000; color: white;">5/8</td>
									<td style="background-color: #000000; color: white;">
										<button class="btn btn-primary btn-sm tab" onclick="joinTournament()">Join</button>
									</td>
								</tr>
								<tr>
									<td style="background-color: #000000; color: white;">Tournoi A</td>
									<td style="background-color: #000000; color: white;">5/8</td>
									<td style="background-color: #000000; color: white;">
										<button class="btn btn-primary btn-sm tab" onclick="joinTournament()">Join</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div id="waitingRoom" class="d-none matchm">
					<h4>Waiting Room</h4>
					<p>Waiting for players to join...</p>
					<button class="btn btn-secondary btn-sm" onclick="leaveTournament()">Leave</button>
				</div>
			</div>

			<!-- TournamentCreateContent -->
			<div class="tab-pane fade ctourn" id="tournamentCreateContent" role="tabpanel" aria-labelledby="tournament-create-tab">
				<h4>Create a Tournament</h4>
				<div class="mb-3 tourn">
					<label for="tournamentName" class="form-label">Tournament Name</label>
					<input type="text" class="form-control" id="tournamentName" placeholder="Enter tournament name">
				</div>
				<div class="mb-3 tourn">
					<label for="playerCount" class="form-label">Number of Players</label>
					<select class="form-select" id="playerCount">
						<option value="4">4</option>
						<option value="8">8</option>
						<option value="16">16</option>
					</select>
				</div>
				<button class="btn btn-primary">Create</button>
			</div>
		</div>
	</div>

	<!-- Onglet Private (play4) si nécessaire -->
	<div class="tab-pane fade" id="play4" role="tabpanel" aria-labelledby="play4-tab">
		<h3>Private</h3>
	</div>
  `;
}

// Gestion des événements interactifs
function joinTournament() {
  const tournamentList = document.getElementById("tournamentList");
  const waitingRoom = document.getElementById("waitingRoom");
  tournamentList?.classList.add("d-none");
  waitingRoom?.classList.remove("d-none");
}

function leaveTournament() {
  const tournamentList = document.getElementById("tournamentList");
  const waitingRoom = document.getElementById("waitingRoom");
  waitingRoom?.classList.add("d-none");
  tournamentList?.classList.remove("d-none");
}

function startMatchmaking() {
  const selection = document.getElementById("matchmakingSelection");
  const waitingRoom = document.getElementById("waitingRoomMatchmaking");
  selection?.classList.add("d-none");
  waitingRoom?.classList.remove("d-none");
}

function cancelMatchmaking() {
  const selection = document.getElementById("matchmakingSelection");
  const waitingRoom = document.getElementById("waitingRoomMatchmaking");
  waitingRoom?.classList.add("d-none");
  selection?.classList.remove("d-none");
}

function initM1() {
  Store.menuElement2 = document.getElementById("menu2");
  if (!Store.menuElement2) {
    console.error("The element with ID 'menu2' was not found.");
    return;
  }
  Store.menuObject2 = new CSS3DObject(Store.menuElement2);
  Store.menuObject2.position.set(-3.6, 4.6, -1.8);
  Store.menuObject2.rotation.set(-5.2, 0.63, 0.2);
  Store.menuObject2.scale.set(0.002, 0.002, 0.002);
  Store.menuElement2.style.pointerEvents = "auto";
  Store.menuElement2.classList.add("active");

//   document.getElementById("launch").addEventListener('click', () => {
//     animateCameraToTarget(
//       new THREE.Vector3(-0.2, 5.257378802731586, -0.8900580859235202),
//       { x: Math.PI / 3, y: 0, z: 0 },
//       1
//     );
//   });
}
