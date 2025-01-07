
import * as THREE from "https://esm.sh/three";
import { CSS3DRenderer, CSS3DObject } from "https://esm.sh/three/examples/jsm/renderers/CSS3DRenderer.js";
import Store from './store.js';
import { animateCameraToTarget } from "/src/3d/animation.js";


export function initCSSRenderer() {
    Store.cssRenderer = new CSS3DRenderer();
    Store.cssRenderer.setSize(window.innerWidth, window.innerHeight);
    Store.cssRenderer.domElement.style.position = "absolute";
    Store.cssRenderer.domElement.style.top = "0";
    Store.cssRenderer.domElement.style.left = "0";
    Store.cssRenderer.domElement.style.pointerEvents = "none";
    document.getElementById("app").appendChild(Store.cssRenderer.domElement);
  }

// =============== CSS3DRENDER INIT ===============

export function initM2() {
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
  
  export function initM1() {
    Store.menuElement2 = document.getElementById("menu2");
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
  
    document.getElementById("launch").addEventListener('click', () => {
      animateCameraToTarget(
        new THREE.Vector3(-0.2, 5.257378802731586, -0.8900580859235202),
        { x: Math.PI / 3, y: 0, z: 0 },
        1
      );
    });
  }
  
  export function initM3() {
    Store.menuElement3 = document.getElementById("menu3");
    if (!Store.menuElement3) {
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
  }