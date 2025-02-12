
import { createComponent } from "/src/utils/component.js";
import { startAnimation } from "/src/components/hud/index.js";

export const headerIngame = createComponent({
  tag: "headerIngame",

  render: () => `
      <div class="row mb-5">
        <div class="col-12 text-center">
          <h1 class="hud-title interactive">
            <a class="nav-item">PONG</a>
          </h1>
        </div>
      </div>
  `,

	attachEvents: (el) => {

		const navItem = el.querySelectorAll(".nav-item");

		startAnimation(navItem, "light-animation");
	}
});