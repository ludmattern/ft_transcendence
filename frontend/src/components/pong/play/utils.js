import { switchwindow } from '/src/3d/animation.js';
import componentManagers from '/src/index.js';
import { pongTuto } from '/src/components/hud/index.js';
import { navigateInGame } from '/src/services/navigation.js';

export function playGame(options) {
	if(options.gameMode === 'local-tournament')
	{
		componentManagers['Pong'].unloadComponent('currentTournament');
	}
	navigateInGame();
	setTimeout(() => {
		history.pushState(null, '', '/pong/ingame');
		componentManagers['HUD'].loadComponent('#central-window', pongTuto(options));
	}, 2000);
}
