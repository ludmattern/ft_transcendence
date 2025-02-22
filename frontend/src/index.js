import { buildScene } from '/src/3d/main.js';
import { handleRoute } from '/src/services/router.js';
import ComponentManager from '/src/utils/component.js';
import { CacheDB } from '/src/utils/IndexedDBCache.js';

const componentManagers = {
	HUD: new ComponentManager('HUD'),
	Pong: new ComponentManager('Pong'),
};

//will be moved into a service in the future
let inTournament = false;

//will be moved into a service in the future
export function setInTournament(value) {
	inTournament = value;
}

//will be moved into a service in the future
export function getInTournament() {
	return inTournament;
}

async function setDatabaseID() {
	const db = await CacheDB.dbPromise;
	if (!db) return;

	let dbID = await db.get('json', 'databaseID');
	if (!dbID) {
		dbID = crypto.randomUUID();
		await db.put('json', dbID, 'databaseID');
		console.warn('Nouvelle base IndexedDB détectée. ID :', dbID);
	} else {
		console.log('Existing database ID found:', dbID);
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
}

window.addEventListener('DOMContentLoaded', initializeApp);
export default componentManagers;
