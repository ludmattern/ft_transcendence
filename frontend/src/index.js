import { buildScene } from "/src/3d/main.js";
import { handleRoute } from "/src/services/router.js";
import ComponentManager from "/src/utils/component.js";
import { CacheDB } from "/src/utils/IndexedDBCache.js";

const componentManagers = {
  HUD: new ComponentManager("HUD"),
  Pong: new ComponentManager("Pong"),
};

async function setDatabaseID() {
  const db = await CacheDB.dbPromise;
  if (!db) return;

  let dbID = await db.get("json", "databaseID");
  if (!dbID) {
    dbID = crypto.randomUUID();
    await db.put("json", dbID, "databaseID");
    console.warn("Nouvelle base IndexedDB détectée. ID :", dbID);
  } else {
    console.log("La base IndexedDB est la même. ID :", dbID);
  }
}

async function initializeApp() {
  console.log("Initialisation de l'application...");

  try {
    const db = await CacheDB.dbPromise;
    if (!db) throw new Error("IndexedDB inaccessible");

    console.debug("IndexedDB est prête !");
    await setDatabaseID();
  } catch (error) {
    console.error("Erreur d'initialisation : IndexedDB est indisponible.", error);
  }

  let targetRoute = window.location.pathname;
  if (targetRoute === "/loading") { targetRoute = "/"; }
  handleRoute("/loading");

  await buildScene();
  handleRoute(targetRoute);
  document.getElementById("waiting-screen-effect").classList.add("d-none");

  console.log("Application prête !");
}

window.addEventListener("DOMContentLoaded", initializeApp);
export default componentManagers;
