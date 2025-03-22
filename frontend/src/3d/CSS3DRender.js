import { CSS3DRenderer } from 'https://esm.sh/three/examples/jsm/renderers/CSS3DRenderer.js';
import Store from '/src/3d/store.js';

export function initCSSRenderer() {
	Store.cssRenderer = new CSS3DRenderer();
	Store.cssRenderer.setSize(window.innerWidth, window.innerHeight);
	Store.cssRenderer.domElement.style.position = 'absolute';
	Store.cssRenderer.domElement.style.top = '0';
	Store.cssRenderer.domElement.style.left = '0';
	Store.cssRenderer.domElement.style.pointerEvents = 'none';
	Store.cssRenderer.domElement.id = 'cssRendererScene';
	document.getElementById('app').appendChild(Store.cssRenderer.domElement);
}
