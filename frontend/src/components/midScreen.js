import { createComponent } from "/src/utils/component.js";
import { CSS3DObject } from "https://esm.sh/three/examples/jsm/renderers/CSS3DRenderer.js";
import Store  from "/src/3d/store.js";

export const midScreen = createComponent({
  tag: "midScreen",

  render: () => `
    <div class="menu2" id="gameScreen">
      <div class="row mt-3"></div>
      <div class="wait2">
        <img class="mid-screensaver" src="/src/assets/img/42.png" />
      </div>
    </div>
  `,

  attachEvents: (el) => {
	initM2();
    console.debug("gameScreen component loaded.");
  },
});

function initM2() {
    Store.menuElement = document.getElementById("gameScreen");
    if (!Store.menuElement) {
      console.error("The element with ID 'gameScreen' was not found.");
      return;
    }
    Store.menuObject = new CSS3DObject(Store.menuElement);
    Store.menuElement.style.pointerEvents = "auto";
    Store.menuObject.position.set(-0.2, 6.6, -1.75);
    Store.menuObject.rotation.set(-5.2, 0, 0);
    Store.menuObject.scale.set(0.002, 0.002, 0.002);
    Store.menuElement.style.display = "none";
    Store.menuElement.classList.add("active");
  }