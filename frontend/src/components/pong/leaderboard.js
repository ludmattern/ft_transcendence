import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";

// Simuler un classement de joueurs (en vrai, récupérer via API)
const leaderboardData = [
  { rank: 1, username: "Destroyer77", winRatio: 95 },
  { rank: 2, username: "AI_GodMode", winRatio: 93 },
  { rank: 3, username: "NoobSlayer", winRatio: 90 },
  { rank: 4, username: "GG_EZ", winRatio: 88 },
  { rank: 5, username: "QuantumPaddle", winRatio: 85 },
  { rank: 6, username: "ZeroChance", winRatio: 83 },
  { rank: 7, username: "LagMaster", winRatio: 80 },
  { rank: 8, username: "FlickShot", winRatio: 78 },
  { rank: 9, username: "TryHarder", winRatio: 75 },
  { rank: 10, username: "CasualKiller", winRatio: 73 },
  { rank: 11, username: "PingOver9000", winRatio: 71 },
  { rank: 12, username: "SweatyHands", winRatio: 70 },
  { rank: 13, username: "ToxicChampion", winRatio: 68 },
  { rank: 14, username: "UninstallNow", winRatio: 65 },
  { rank: 15, username: "NoHopeLeft", winRatio: 60 },
  { rank: 16, username: "RageQuit", winRatio: 58 },
  { rank: 17, username: "NoSkillz", winRatio: 55 },
  { rank: 18, username: "JustForFun", winRatio: 53 },
  { rank: 19, username: "Beginner", winRatio: 50 },
  { rank: 20, username: "LuckyShot", winRatio: 48 },
  { rank: 21, username: "NoobMaster", winRatio: 45 },
  { rank: 22, username: "PaddlePong", winRatio: 43 },
  { rank: 23, username: "PingPong", winRatio: 40 },
  { rank: 24, username: "PaddleMaster", winRatio: 38 },
  { rank: 25, username: "PaddleKing", winRatio: 35 },
  { rank: 26, username: "PaddlePrince", winRatio: 33 },
  { rank: 27, username: "PaddleKnight", winRatio: 30 },
  { rank: 28, username: "YourUsername", winRatio: 30 }, // Simulé pour test du bouton Find Me
  { rank: 29, username: "PaddleSquire", winRatio: 28 },
  { rank: 30, username: "PaddlePeasant", winRatio: 25 },
  { rank: 31, username: "PaddleNoob", winRatio: 23 },
  { rank: 32, username: "PaddlePadawan", winRatio: 20 },
  { rank: 33, username: "PaddlePupil", winRatio: 18 },
  { rank: 34, username: "PaddlePebble", winRatio: 15 },
  { rank: 35, username: "PaddlePebble", winRatio: 13 },
  { rank: 36, username: "PaddlePebble", winRatio: 10 },
  { rank: 37, username: "PaddlePebble", winRatio: 8 },
  { rank: 38, username: "PaddlePebble", winRatio: 5 },
  { rank: 39, username: "PaddlePebble", winRatio: 3 },
  { rank: 40, username: "PaddlePebble", winRatio: 0 },
  { rank: 41, username: "PaddlePebble", winRatio: 0 },
];

let currentPage = 0;
const playersPerPage = 8;
let previousList = null; // Sauvegarde la liste affichée avant le "Find Me"

export const leaderboard = createComponent({
  tag: "leaderboard",

  render: () => `
    <section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
      <h2 class="text-center text-white">Leaderboard - The Untouchables</h2>
      <p class="text-secondary text-center">Behold the legends. You probably won’t get here.</p>

      <!-- Leaderboard Table -->
      <div class="table-responsive">
        <table class="table table-dark table-hover text-center">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Win Ratio (%)</th>
            </tr>
          </thead>
          <tbody id="leaderboard-body">
            ${generateLeaderboardRows(leaderboardData.slice(0, playersPerPage))}
          </tbody>
        </table>
      </div>

      <!-- Pagination Buttons -->
      <div class="text-center mt-4">
        <button id="prev-page" class="btn btn-outline-light" disabled>
          <i class="bi bi-arrow-left"></i> Previous
        </button>
        <button id="next-page" class="btn btn-outline-light">
          Next <i class="bi bi-arrow-right"></i>
        </button>
      </div>

      <!-- Find Me & Back Buttons -->
      <div class="text-center mt-4">
        <button id="find-me" class="btn btn-outline-light">
          <i class="bi bi-search"></i> Find Me
        </button>
        <button id="back-to-list" class="btn btn-outline-danger d-none">
          <i class="bi bi-arrow-bar-left"></i> Back to Leaderboard
        </button>
      </div>
    </section>
  `,

  attachEvents: (el) => {
    const leaderboardBody = el.querySelector("#leaderboard-body");
    const prevPageButton = el.querySelector("#prev-page");
    const nextPageButton = el.querySelector("#next-page");
    const findMeButton = el.querySelector("#find-me");
    const backToListButton = el.querySelector("#back-to-list");

    function updateLeaderboard() {
      const startIndex = currentPage * playersPerPage;
      const endIndex = startIndex + playersPerPage;
      leaderboardBody.innerHTML = generateLeaderboardRows(
        leaderboardData.slice(startIndex, endIndex)
      );

      // Gérer l'état des boutons de pagination
      prevPageButton.disabled = currentPage === 0;
      nextPageButton.disabled = endIndex >= leaderboardData.length;
    }

    prevPageButton.addEventListener("click", () => {
      currentPage--;
      updateLeaderboard();
    });

    nextPageButton.addEventListener("click", () => {
      currentPage++;
      updateLeaderboard();
    });

    findMeButton.addEventListener("click", () => {
      findUserInLeaderboard(el);
    });

    backToListButton.addEventListener("click", () => {
      leaderboardBody.innerHTML = generateLeaderboardRows(previousList);
      backToListButton.classList.add("d-none");
      findMeButton.classList.remove("d-none");
      prevPageButton.classList.remove("d-none");
      nextPageButton.classList.remove("d-none");
    });

    updateLeaderboard();
  }
});

/**
 * Génère les lignes du tableau du leaderboard
 */
function generateLeaderboardRows(players) {
  return players
    .map(
      (player) => `
    <tr class="${player.username === "YourUsername" ? "table-warning" : ""}">
        <td>${player.rank}</td>
        <td>
          <a href="/social?pilot=${player.username}" class="text-light text-decoration-none">
            ${player.username}
          </a>
        </td>
        <td>${player.winRatio}%</td>
    </tr>
  `
    )
    .join("");
}

/**
 * Recherche l'utilisateur dans le classement et charge sa portion
 */
function findUserInLeaderboard(el) {
  const user = leaderboardData.find((p) => p.username === "YourUsername");

  if (!user) {
    alert("You're not even ranked... Get better.");
    return;
  }

  let userIndex = leaderboardData.indexOf(user);
  let startIndex = Math.max(0, userIndex - 3);
  let endIndex = Math.min(leaderboardData.length, startIndex + playersPerPage);

  const leaderboardBody = el.querySelector("#leaderboard-body");
  previousList = leaderboardData.slice(currentPage * playersPerPage, (currentPage + 1) * playersPerPage);

  leaderboardBody.innerHTML = generateLeaderboardRows(
    leaderboardData.slice(startIndex, endIndex)
  );

  // Afficher le bouton "Back"
  el.querySelector("#back-to-list").classList.remove("d-none");
  el.querySelector("#find-me").classList.add("d-none");
  el.querySelector("#prev-page").classList.add("d-none");
  el.querySelector("#next-page").classList.add("d-none");
}
