
import { createComponent } from "/src/utils/component.js";
import { startAnimation } from "/src/components/hud/index.js";

export const headerIngame = createComponent({
  tag: "headerIngame",

  render: () => `
      <div class="row">
        <div class="col-12 text-center">
          <h1 class="hud-title interactive">
            <a>PONG</a>
          </h1>
        </div>
      </div>
      <div class="row">
        <nav class="col-12 d-flex justify-content-center">
          <ul class="nav">
            <!-- Menu gauche -->
            <span class="left-menu">
            </span>
            <!-- Jeux (Menu central) -->
            <li class="nav-item first-game">
              <span class="nav-link text-white">
                <a href="/pong" id="pong-link">p1 : give up</a>
              </span>
            </li>
            <li class="nav-item second-game">
              <span class="nav-link text-white">
                <a href="/race" id="race-link">p2 : give up</a>
              </span>
            </li>
            <!-- Menu droit -->
            <span class="right-menu">
            </span>
          </ul>
        </nav>
      </div>
  `,

	attachEvents: (el) => {

		const navItems = el.querySelectorAll(".nav-item");
		const homeLink = el.querySelectorAll("#home-link");

		startAnimation(homeLink, "light-animation");
		startAnimation(navItems, "light-animation", 1000);
	}
});

/**
 * Crée un élément de navigation (<li>) avec un lien (<a>)
 *
 * @param {string} text - Le texte du lien
 * @param {string} id - L'ID de l'élément <a>
 * @returns {string} - HTML du menu de navigation
 */
function createNavItem(text, id = "") {
  return `
    <li class="nav-item">
      <span class="nav-link text-white">
        <a href="/${text}" id="${id}">${text}</a>
      </span>
    </li>
  `;
}
