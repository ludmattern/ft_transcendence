import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { ws } from '/src/services/socketManager.js';
import { getUserIdFromCookieAPI } from '/src/services/auth.js';

export const tournamentContent = createComponent({
	tag: 'tournamentContent',

	render: () => `
    <section class="p-5 flex-grow-1" style="background-color: #111111; max-height: 700px; overflow: auto;">
        <h2 class="text-white text-center">Oh, You Want to Join a Tournament?</h2>
        <p class="text-secondary text-center">That’s adorable. Let’s see how long you last.</p>

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
        </ul>

        <div class="tab-content mt-4">
            <div class="tab-pane fade show active" id="createTournament">
                <legend class="h4 text-white">Create Your Own Tournament</legend>
                <p class="text-secondary">How cute, you actually think you’ll make it to the finals?</p>

                ${generateModeSelector()}
                ${generateTournamentSizeSelector()}

                <div class="text-center">
                    <button class="btn btn-pong mt-3" id="createbutton">Create This Mess</button>
                </div>
            </div>

            <div class="tab-pane fade" id="joinTournament">
                <legend class="h4 text-white">Join an Existing Tournament</legend>
                <p class="text-secondary">You want to join? Great, another victim enters the arena.</p>

                <div class="mb-3">
                    <input type="text" class="form-control" id="tournamentRoomCode" placeholder="Enter Room Code">
                </div>
                <div class="text-center">
                    <button class="btn btn-pong mt-3" id="joinWithCode">Join via Room Code</button>
                </div>
                
                <hr class="text-secondary my-4">
                
                <h4 class="text-white text-center">Or Join a Random Tournament</h4>
                ${generateTournamentSizeSelector('random')}
                <div class="text-center">
                    <button class="btn btn-pong" id="joinRandom">Find a Random Tournament</button>
                </div>
            </div>
        </div>
    </section>
  `,

	attachEvents: async (el) => {
		// Gestion des onglets
		const tabs = el.querySelectorAll('.nav-link');
		const tabPanes = el.querySelectorAll('.tab-pane');

		const savedTabId = sessionStorage.getItem('activeTournamentTab');
		if (savedTabId) {
			tabs.forEach((tab) => tab.classList.remove('active'));
			tabPanes.forEach((pane) => pane.classList.remove('show', 'active'));

			const activeTab = el.querySelector(`[href="#${savedTabId}"]`);
			const activePane = el.querySelector(`#${savedTabId}`);
			if (activeTab && activePane) {
				activeTab.classList.add('active');
				activePane.classList.add('show', 'active');
			}
		}

		tabs.forEach((tab) => {
			tab.addEventListener('click', (e) => {
				e.preventDefault();
				const target = tab.getAttribute('href').substring(1);

				tabs.forEach((t) => t.classList.remove('active'));
				tabPanes.forEach((pane) => pane.classList.remove('show', 'active'));

				tab.classList.add('active');
				el.querySelector(`#${target}`).classList.add('show', 'active');

				sessionStorage.setItem('activeTournamentTab', target);
			});
		});

		// Rejoindre par code
		const joinWithCodeButton = el.querySelector('#joinWithCode');
		joinWithCodeButton.addEventListener('click', () => {
			const roomCode = document.getElementById('tournamentRoomCode').value;
			if (!roomCode) {
				console.log('Enter a valid room code');
				return;
			}
			console.log(`Joining tournament with code: ${roomCode}`);
		});

		// Rejoindre un tournoi aléatoire
		const joinRandomButton = el.querySelector('#joinRandom');
		joinRandomButton.addEventListener('click', () => {
			const tournamentSize = document.getElementById('tournamentSize-random').value;
			console.log(`Joining a random tournament with size: ${tournamentSize}`);
			handleRoute('/pong/play/tournament-join');
		});

		// Création d'un tournoi
		const createButton = el.querySelector('#createbutton');
		createButton.addEventListener('click', async () => {
			const mode = document.getElementById('tournamentMode').value;
			const size = document.getElementById('tournamentSize').value;
			sessionStorage.setItem('tournamentMode', mode);
			sessionStorage.setItem('tournamentSize', size);
			console.log(`Creating a tournament with mode: ${mode} and size: ${size}`);
			handleRoute('/pong/play/tournament-creation');
		});
	},
});

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
 * Génère le sélecteur du format du tournoi (4, 8 ou 16 joueurs)
 * @param {string} variant - Optionnel. Si fourni, le select aura un id spécifique (ex: "random" donnera "tournamentSize-random")
 */
function generateTournamentSizeSelector(variant) {
	const selectId = variant ? `tournamentSize-${variant}` : 'tournamentSize';
	return `
    <div class="mb-3">
        <label for="${selectId}" class="form-label text-white">Select the Size of Your Demise</label>
        <select class="form-select" id="${selectId}">
            <option value="4">4 Players - A Small-Scale Humiliation</option>
            <option value="8">8 Players - Double the Disappointment</option>
            <option value="16">16 Players - A Public Execution</option>
        </select>
        <small class="text-muted">The more players, the more people watching you fail.</small>
    </div>
  `;
}
