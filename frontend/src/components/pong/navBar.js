import { createComponent } from "/src/utils/component.js";

export const navBar = createComponent({
  tag: "navBar",

  // Générer le HTML
  render: () => `
	<!-- Sous-menu à gauche -->
	<aside class="col-md-3 p-3">
		<ul class="list-unstyled p-2">
			<li class="p-3 my-3 d-block" style="background-color: #17332c;"><a href="#" class="text-decoration-none text-white bi bi-person-fill"> SOLO</a></li>
			<li class="p-3 my-3 d-block" style="background-color: #17332c;"><a href="#" class="text-decoration-none text-white bi bi-people-fill"> MULTIPLAYER</a></li>
			<li class="p-3 my-3 d-block" style="background-color: #17332c;"><a href="#" class="text-decoration-none text-white bi bi-trophy-fill"> TOURNAMENT</a></li>
		</ul>
	</aside>
  `,
});