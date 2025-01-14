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
          <button class="btn btn-outline-secondary bi bi-house rounded-0 icon">
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

      <!-- ********************************************************************* debut main container pour routeur pong  ********************************************************************* -->
		<main class="row d-flex flex-column flex-grow-1 p-4" id="pong-menu-container">
		<!-- Bandeau en haut -->
		<header class="text-white d-flex align-items-center p-3 justify-content-around border" style="background-color: #113630;">
			<!-- Bloc gauche -->
			<div class="col-2 text-center">
			  <h1 class="bi bi-rocket fs-5 m-0">TRANSCENDENCE</h1>
			</div>
		    <span class="separator" style="height: 200%; width: 1px; background-color: rgb(255, 255, 255);"></span>
			<!-- Bloc droit -->
			<div class="col-8 d-flex justify-content-around border p-1" style="background-color: #084b4e; text-transform: uppercase;">
			  <span class="m-0">shipctrl:///appData/useless/pong/play.shp</span>
			  <span class="m-0">Powered by ubuntu <i class="bi bi-ubuntu"></i></span>
			</div>
		  </header>

		<!-- Contenu principal -->
		<div class="d-flex flex-grow-1 border" style="padding: 0; background-color: #111111;">
			<!-- Sous-menu à gauche -->
			<aside class="col-md-3 p-3">
			<ul class="list-unstyled p-2">
				<li class="p-3 my-3 d-block" style="background-color: #17332c;"><a href="#" class="text-decoration-none text-white bi bi-person-fill"> SOLO</a></li>
				<li class="p-3 my-3 d-block" style="background-color: #17332c;"><a href="#" class="text-decoration-none text-white bi bi-people-fill"> MULTIPLAYER</a></li>
				<li class="p-3 my-3 d-block" style="background-color: #17332c;"><a href="#" class="text-decoration-none text-white bi bi-trophy-fill"> TOURNAMENT</a></li>
			</ul>
			</aside>

			<!-- Corps à droite -->
			<section class="col-md-9 p-3" style="background-color: #111111;">
			<h2>Bienvenue</h2>
			<p>Ceci est le contenu principal de la page.</p>
			</section>
		</div>
		</main>

      <!-- ********************************************************************* fin main container pour routeur pong ********************************************************************* -->

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
  },
});

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
