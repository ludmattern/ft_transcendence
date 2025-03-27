import { createComponent } from '/src/utils/component.js';
import { handleTournamentRedirection } from '/src/services/router.js';
import { localTournamentCreation } from '/src/components/pong/play/localTournamentCreation.js';
import { onlineTournamentCreation } from '/src/components/pong/play/onlineTournamentCreation.js';
import { getInfo } from '/src/services/infoStorage.js';

export const tournamentCreation = createComponent({
	tag: 'tournamentCreation',
	render: () => {
		return `
			<section id="tst" class="col-12 d-flex flex-column align-items-center text-center p-5"</section>
        `;
	},
	attachEvents: async (el) => {
		if (await handleTournamentRedirection('/pong/play/tournament-creation')) {
			return;
		}
		const tournamentMode = (await getInfo('tournamentMode')).success ? (await getInfo('tournamentMode')).value : 'local';
		const tournamentContent = el.querySelector('#tst');

		if (tournamentMode === 'local') {
			tournamentContent.innerHTML = '';
			tournamentContent.innerHTML = localTournamentCreation.render();
			localTournamentCreation.attachEvents(tournamentContent);
		} else {
			tournamentContent.innerHTML = '';
			tournamentContent.innerHTML = onlineTournamentCreation.render();
			onlineTournamentCreation.attachEvents(tournamentContent);
		}
	},
});
