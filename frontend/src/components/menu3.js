import { createComponent } from "/src/utils/component.js";
import { CSS3DObject } from "https://esm.sh/three/examples/jsm/renderers/CSS3DRenderer.js";
import Store  from "/src/3d/store.js";

export const menu3 = createComponent({
  tag: "menu3",

  render: () => `
    <div class="menu3" id="menu3"></div>
  `,

  attachEvents: (el) => {
	initM3();
  },
});

function initM3() {
    Store.menuElement3 = document.getElementById("menu3");
    if (!Store.menuElement3) 
    {
      console.error("The element with ID 'menu3' was not found.");
      return;
    }
    Store.menuObject3 = new CSS3DObject(Store.menuElement3);
    Store.menuElement3.style.pointerEvents = "auto";
    Store.menuObject3.position.set(3.1, 4.5, -1.85);
    Store.menuObject3.rotation.set(-5.2, -0.6, -0.2);
    Store.menuObject3.scale.set(0.002, 0.002, 0.002);
    Store.menuElement3.style.display = "none";
    Store.menuElement3.classList.add("active");
    if (Store.menuObject3) Store.scene.add(Store.menuObject3);
  }