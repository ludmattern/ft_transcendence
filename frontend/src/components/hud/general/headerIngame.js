
import { createComponent } from "/src/utils/component.js";
import { startAnimation } from "/src/components/hud/index.js";

export const headerIngame = createComponent({
  tag: "headerIngame",

  render: () => `
      <div class="row mb-5">
        <div class="col-12 text-center">
          <h1 class="hud-title interactive">
            <a>PONG</a>
          </h1>
        </div>
      </div>
  `,

	attachEvents: (el) => {

		const navItems = el.querySelectorAll(".nav-item");
		const homeLink = el.querySelectorAll("#home-link");

		startAnimation(homeLink, "light-animation");
		startAnimation(navItems, "light-animation", 1000);
	}
});