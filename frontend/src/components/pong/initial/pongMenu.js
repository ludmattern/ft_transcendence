import { createComponent } from "/src/utils/component.js";
import { handleRoute, getPreviousPongPlaySubRoute } from "/src/services/router.js";
import { subscribe } from "/src/services/eventEmitter.js";
import { CSS3DObject } from "https://esm.sh/three/examples/jsm/renderers/CSS3DRenderer.js";
import Store from "/src/3d/store.js";

export const pongMenu = createComponent({
  tag: "pongMenu",

  // Générer le HTML
  render: () => `
    <div class="container-fluid" id="main-container">
      <!-- Header Section -->
      <header class="row align-items-center px-4">
        <div class="col text-start">
          <button id="homeButton" class="btn btn-outline-secondary bi bi-house rounded-0 icon">
            Home
          </button>
        </div>
        <div class="wrapper col-6 text-center">
          <ul class="nav nav-pills justify-content-evenly" id="mainTabs" role="tablist">
            <li class="nav-item mt-4">
              <button class="nav-link d-flex active" id="play-tab" data-bs-toggle="pill" data-bs-target="#playContent" type="button" role="tab">
                <span class="bi bi-joystick icon">
                  <span class="bi icon-border">
                    <span class="corner-top-right"></span>
                    <span class="corner-bottom-left"></span>
                  </span>
                </span>
                <span class="content">Play</span>
              </button>
            </li>
            <li class="nav-item mt-4">
              <button class="nav-link d-flex" id="leaderboard-tab" data-bs-toggle="pill" data-bs-target="#leaderboardContent" type="button" role="tab">
                <span class="bi bi-star icon">
                  <span class="bi icon-border">
                    <span class="corner-top-right"></span>
                    <span class="corner-bottom-left"></span>
                  </span>
                </span>
                <span class="content">Leaderboard</span>
              </button>
            </li>
          </ul>
        </div>
        <div class="col text-end">
          <button id="backButton" class="btn btn-outline-secondary bi bi-arrow-left rounded-0">
            Back
          </button>
        </div>
      </header>

      <main id="pong-skeleton-container" class="d-flex flex-column flex-grow-1" style="border: 1px solid #2a312f; border-top: 0; border-bottom: 0; margin: -0.78rem;">
      </main>

      <footer class="row align-items-center p-3 footer">
        <div class="logo col text-start">
          <span class="fs-2 bi bi-windows"></span>
        </div>
        <div class="hour col text-end">
          <span id="current-time">--:--</span>
          </br>
          <span id="current-date">--/--/----</span>
        </div>
      </footer>
  `,

  attachEvents: (el) => {
    initM1();
    updateDateTime();
    setInterval(updateDateTime, 20000);

    const homeButton = el.querySelector("#homeButton");
    const playButton = el.querySelector("#play-tab");
    const leaderboardButton = el.querySelector("#leaderboard-tab");

	function updateActiveTab(el, route) {
		if (!route.startsWith("/pong")) return;
	
		el.querySelectorAll("#mainTabs .nav-item").forEach((navItem) => {
			navItem.classList.remove("active");
		});
	
		if (route.startsWith("/pong/play")) {
			playButton.parentElement.classList.add("active");
		} else if (route.startsWith("/pong/leaderboard")) {
			leaderboardButton.parentElement.classList.add("active");
		}
	}
	

    homeButton.addEventListener("click", () => {
        handleRoute("/pong/home");
    });

    playButton.addEventListener("click", () => {
        const lastPlayRoute = getPreviousPongPlaySubRoute();
        handleRoute(lastPlayRoute);
    });

    leaderboardButton.addEventListener("click", () => {
        handleRoute("/pong/leaderboard");
    });

    updateActiveTab(el, window.location.pathname);

    subscribe("routeChanged", (route) => updateActiveTab(el, route));

}

});

/**
 * Met à jour l'heure et la date affichées dans le footer.
 */
function updateDateTime() {
  const timeElement = document.getElementById("current-time");
  const dateElement = document.getElementById("current-date");

  if (!timeElement || !dateElement) return;

  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();

  timeElement.textContent = `${hours}:${minutes}`;
  dateElement.textContent = `${day}/${month}/${year}`;
}

/**
 * Initialise l'objet 3D du menu dans la scène Three.js.
 */
import * as THREE from "https://esm.sh/three";

function initM1() {
  Store.menuElement2 = document.getElementById("pong-screen-container");
  if (!Store.menuElement2) {
    console.error("The element with ID 'pong-screen-container' was not found.");
    return;
  }

  const cameraQuaternion = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(Math.PI / 3.2, Math.PI / 5.5, -Math.PI / -12)
  );
  
  const objectRotation = new THREE.Euler(0, 0, 0, "XYZ");
  const objectQuaternion = new THREE.Quaternion().setFromEuler(objectRotation);
  
  Store.menuObject2 = new CSS3DObject(Store.menuElement2);
  Store.menuObject2.quaternion.copy(cameraQuaternion).multiply(objectQuaternion);
  Store.menuObject2.position.set(-3.6, 4.6, -1.8);
  Store.menuObject2.scale.set(0.002, 0.002, 0.002);
  Store.menuElement2.style.pointerEvents = "auto";
  Store.menuElement2.classList.add("active");
}
