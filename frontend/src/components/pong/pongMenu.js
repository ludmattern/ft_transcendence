import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";
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
          <ul
            class="nav nav-pills justify-content-evenly"
            id="mainTabs"
            role="tablist"
          >
            <li class="nav-item mt-4">
              <button
                class="nav-link d-flex active"
                id="play-tab"
                data-bs-toggle="pill"
                data-bs-target="#playContent"
                type="button"
                role="tab"
              >
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
              <button
                class="nav-link d-flex"
                id="leaderboard-tab"
                data-bs-toggle="pill"
                data-bs-target="#leaderboardContent"
                type="button"
                role="tab"
              >
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
          <button class="btn btn-outline-secondary bi bi-arrow-left rounded-0">
            Back
          </button>
        </div>
      </header>

		<main class="row d-flex flex-column flex-grow-1 p-4" id="pong-menu-container">
		
		<div id="content-window-container"></div>
		</main>

      <footer class="row align-items-center p-3 footer">
        <div class="logo col text-start">
          <span class="fs-2 bi bi-windows"></span>
        </div>
        <div class="hour col text-end">
          <span>12:00</span>
          </br>
          <span>01/13/2024</span>
        </div>
      </footer>
  `,

  // Ajouter les événements après le chargement
  attachEvents: (el) => {
    // Initialisation de la scène 3D
    initM1();

    const navLinks = document.querySelectorAll("#mainTabs .nav-item");

    // Ajouter un gestionnaire d'événements à chaque bouton
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        // Supprimer la classe "active" de tous les boutons
        navLinks.forEach((nav) => nav.classList.remove("active"));
        // Ajouter la classe "active" au bouton cliqué
        link.classList.add("active");
	  });
    });
	const homeButton = document.getElementById("homeButton");
    const playButton = document.getElementById("play-tab");
    const leaderboardButton = document.getElementById("leaderboard-tab");

    // Ajouter un gestionnaire d'événements pour chaque bouton
    homeButton.addEventListener("click", () => homeClick());
    playButton.addEventListener("click", () => handleRoute("/pong/play"));
    leaderboardButton.addEventListener("click", () => handleRoute("/pong/leaderboard"));
  },
});

function homeClick() {
  handleRoute("/pong");
  const navLinks = document.querySelectorAll("#mainTabs .nav-item");
  navLinks.forEach((nav) => nav.classList.remove("active"));
}

function initM1() {
  Store.menuElement2 = document.getElementById("pong-screen-container");
  if (!Store.menuElement2) {
    console.error("The element with ID 'menu2' was not found.");
    return;
  }
  Store.menuObject2 = new CSS3DObject(Store.menuElement2);
  Store.menuObject2.position.set(-3.6, 4.6, -1.8);
  Store.menuObject2.rotation.set(-5.2, 0.63, 0.2);
  Store.menuObject2.scale.set(0.002, 0.002, 0.002);
  Store.menuElement2.style.pointerEvents = "auto";
  Store.menuElement2.classList.add("active");
}
