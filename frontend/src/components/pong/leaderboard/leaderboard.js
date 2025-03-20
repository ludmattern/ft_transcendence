import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { updateActiveLink } from '/src/components/hud/general/header.js';
import { getUsername } from '/src/services/auth.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';
import { createNotificationMessage } from '/src/components/hud/sideWindow/left/notifications.js';

// Variables globales
let leaderboardData = [];
let currentPage = 0;
const playersPerPage = 8;
let previousList = null; // Sauvegarde la liste affichée avant le "Find Me"

export const leaderboard = createComponent({
	tag: 'leaderboard',

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
              <th>Elo</th>
            </tr>
          </thead>
          <tbody id="leaderboard-body">
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

	attachEvents: async (el) => {
		const leaderboardBody = el.querySelector('#leaderboard-body');
		const prevPageButton = el.querySelector('#prev-page');
		const nextPageButton = el.querySelector('#next-page');
		const findMeButton = el.querySelector('#find-me');
		const backToListButton = el.querySelector('#back-to-list');

		await fetchLeaderboard();

		async function updateLeaderboard() {
			const username = await getUsername(await getUserIdFromCookieAPI());
			const startIndex = currentPage * playersPerPage;
			const endIndex = startIndex + playersPerPage;
			leaderboardBody.innerHTML = generateLeaderboardRows(leaderboardData.slice(startIndex, endIndex), username);

			prevPageButton.disabled = currentPage === 0;
			nextPageButton.disabled = endIndex >= leaderboardData.length;
			attachPlayerClickEvents(el);
		}

		prevPageButton.addEventListener('click', () => {
			currentPage--;
			updateLeaderboard();
		});

		nextPageButton.addEventListener('click', () => {
			currentPage++;
			updateLeaderboard();
		});

		findMeButton.addEventListener('click', () => {
			findUserInLeaderboard(el);
			updateLeaderboard();
		});

		backToListButton.addEventListener('click', () => {
			leaderboardBody.innerHTML = generateLeaderboardRows(previousList);
			updateLeaderboard();
			backToListButton.classList.add('d-none');
			findMeButton.classList.remove('d-none');
			prevPageButton.classList.remove('d-none');
			nextPageButton.classList.remove('d-none');
		});

		updateLeaderboard();
	},
});

async function fetchLeaderboard() {
	try {
		const response = await fetch('/api/user-service/leaderboard/', {
			credentials: 'include',
		});
		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}
		const data = await response.json();

		if (data.success) {
			leaderboardData = data.players;
		} else {
			console.error('Erreur lors de la récupération du leaderboard :', data.error);
		}
	} catch (error) {
		console.error('Error fetching leaderboard:', error);
	}
}

function generateLeaderboardRows(players, username) {
	return players
		.map(
			(player) => `
	  <tr class="${player.username === username ? 'table-warning' : ''}">
		  <td>${player.rank}</td>
		  <td>
			<span class="player-link ${player.username === username ? 'text-black' : 'text-white'} text-decoration-none" data-username="${player.username}" style="cursor: pointer;">
			  ${player.username}
			</span>
		  </td>
		  <td>${player.elo}</td>
	  </tr>
	`
		)
		.join('');
}

async function findUserInLeaderboard(el) {
	const username = await getUsername(await getUserIdFromCookieAPI());
	const user = leaderboardData.find((p) => p.username === username);

	if (!user) {
		createNotificationMessage("You're not even ranked... Get better", 2500, true);
		return;
	}

	let userIndex = leaderboardData.indexOf(user);
	let startIndex = Math.max(0, userIndex - 3);
	let endIndex = Math.min(leaderboardData.length, startIndex + playersPerPage);

	const leaderboardBody = el.querySelector('#leaderboard-body');
	previousList = leaderboardData.slice(currentPage * playersPerPage, (currentPage + 1) * playersPerPage);

	leaderboardBody.innerHTML = generateLeaderboardRows(leaderboardData.slice(startIndex, endIndex));

	el.querySelector('#back-to-list').classList.remove('d-none');
	el.querySelector('#find-me').classList.add('d-none');
	el.querySelector('#prev-page').classList.add('d-none');
	el.querySelector('#next-page').classList.add('d-none');
	attachPlayerClickEvents(el);
}

function attachPlayerClickEvents(el) {
	el.querySelectorAll('.player-link').forEach((element) => {
		element.addEventListener('click', () => {
			const username = element.dataset.username;
			handleRoute(`/social/pilot=${username}`);
			const header = document.querySelector('header');
			updateActiveLink(header);
		});
	});
}
