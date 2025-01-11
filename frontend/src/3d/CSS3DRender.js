
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
