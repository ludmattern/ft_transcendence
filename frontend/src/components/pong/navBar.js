import { createComponent } from "/src/utils/component.js";
import { handleRoute } from "/src/services/router.js";
import { getPreviousRoute } from "/src/services/router.js";

const navigationLinks = {
  "pong-solo-link": "/pong/play/solo",
  "pong-multiplayer-link": "/pong/play/multiplayer",
  "pong-tournament-link": "/pong/play/tournament",
};

export const navBar = createComponent({
  tag: "navBar",

  // Générer le HTML
  render: () => `
	<!-- Sous-menu à gauche -->
	<aside class="col-md-3 p-3">
		<ul class="list-unstyled p-2">
			<li id="pong-solo-link" class="p-3 my-3 d-block" style="background-color: #17332c;">
				<a href="#" class="text-decoration-none text-white bi bi-person-fill"> SOLO</a>
			</li>
			<li id="pong-multiplayer-link" class="p-3 my-3 d-block" style="background-color: #17332c;">
				<a href="#" class="text-decoration-none text-white bi bi-people-fill"> MULTIPLAYER</a>
			</li>
			<li id="pong-tournament-link" class="p-3 my-3 d-block" style="background-color: #17332c;">
				<a href="#" class="text-decoration-none text-white bi bi-trophy-fill"> TOURNAMENT</a>
			</li>
		</ul>
	</aside>
  `,

  attachEvents: (el) => {
    Object.entries(navigationLinks).forEach(([linkId, route]) => {
      const linkElement = el.querySelector(`#${linkId}`);
      if (linkElement) {
        linkElement.addEventListener("click", (e) => {
          e.preventDefault();
          handleRoute(route);
		  console.log("future set -> Route:", route);
          updateActiveLink(el, route); // Mettre à jour l'élément actif
        });
      }
    });

    // Activer le lien correspondant à l'URL actuelle
	const currentPath = window.location.pathname;
	console.log("initial set -> Current Path:", currentPath);
    updateActiveLink(el, currentPath);

    // Surveiller les changements d'URL (navigations arrière/avant)
    window.addEventListener("popstate", () => updateActiveLink(el, getPreviousRoute()));
  }
});

function updateActiveLink(el, futurePath) {
  console.log("inside update:", futurePath);

  // Trouver l'ID du lien correspondant
  const activeLinkId = Object.keys(navigationLinks).find((key) => {
    const path = navigationLinks[key];
    return futurePath === path || futurePath.startsWith(`${path}/`);
  });

  // Réinitialiser l'état de tous les éléments <li>
  if (futurePath.startsWith("/pong")) {
  	el.querySelectorAll("li").forEach((item) => item.classList.remove("active"));
  }

  // Activer l'élément correspondant
  if (activeLinkId) {
	console.log("Active Link ID:", activeLinkId);
    const activeItem = el.querySelector(`#${activeLinkId}`);
    if (activeItem) {
      activeItem.classList.add("active");
    }
  }
}
