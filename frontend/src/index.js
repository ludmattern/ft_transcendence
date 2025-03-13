import { buildScene } from '/src/3d/main.js';
import { handleRoute, getPreviousPongPlaySubRoute } from '/src/services/router.js';
import ComponentManager from '/src/utils/component.js';
import { CacheDB } from '/src/utils/IndexedDBCache.js';
import { onWindowResize } from '/src/3d/main.js';
import { getCurrentWindow } from '/src/3d/animation.js';

const componentManagers = {
	HUD: new ComponentManager('HUD'),
	Pong: new ComponentManager('Pong'),
};

async function setDatabaseID() {
	const db = await CacheDB.dbPromise;
	if (!db) return;

	let dbID = await db.get('json', 'databaseID');
	if (!dbID) {
		dbID = crypto.randomUUID();
		await db.put('json', dbID, 'databaseID');
	}
}

async function initializeApp() {
	try {
		const db = await CacheDB.dbPromise;
		if (!db) throw new Error('IndexedDB inaccessible');

		await setDatabaseID();
	} catch (error) {
		console.error("Erreur d'initialisation : IndexedDB est indisponible.", error);
	}

	let targetRoute = window.location.pathname;
	if (targetRoute === '/loading') {
		targetRoute = '/';
	}
	handleRoute('/loading', false);

	await buildScene();
	handleRoute(targetRoute);
    onWindowResize();
	const blurScreenEffect = document.querySelector('#blur-screen-effect');
	blurScreenEffect.addEventListener('click', () => {
		const currentWindow = getCurrentWindow();
		switch (currentWindow) {
			case 'home':
				handleRoute('/');
				break;
			case 'pong':
				handleRoute(getPreviousPongPlaySubRoute());
				break;
			case 'race':
				handleRoute('/race');
				break;
			default:
				handleRoute('/');
		}
	});
}

window.addEventListener('DOMContentLoaded', initializeApp);

export default componentManagers;
