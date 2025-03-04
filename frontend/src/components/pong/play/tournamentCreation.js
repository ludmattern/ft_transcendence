import { createComponent } from '/src/utils/component.js';
import { handleRoute } from '/src/services/router.js';
import { handleTournamentRedirection } from '/src/services/router.js';
import { localTournamentCreation } from './localTournamentCreation.js';
import { onlineTournamentCreation } from './onlineTournamentCreation.js';

export const tournamentCreation = createComponent({
	tag: 'tournamentCreation',
	render: () => {
		const tournamentMode = sessionStorage.getItem('tournamentMode') || 'local';
		return tournamentMode === 'local'
			? localTournamentCreation.render()
			: onlineTournamentCreation.render();
	},
	attachEvents: async (el) => {
		if (await handleTournamentRedirection('/pong/play/tournament-creation')) {
			return;
		}
		const tournamentMode = sessionStorage.getItem('tournamentMode') || 'local';
		if (tournamentMode === 'local') {
			localTournamentCreation.attachEvents(el);
		} else {
			onlineTournamentCreation.attachEvents(el);
		}
	},
});
