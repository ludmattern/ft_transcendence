import { createComponent } from '/src/utils/component.js';
import { CSS3DObject } from 'https://esm.sh/three/examples/jsm/renderers/CSS3DRenderer.js';
import Store from '/src/3d/store.js';
import * as THREE from 'https://esm.sh/three';

export const menu3 = createComponent({
	tag: 'menu3',

	render: () => `
    <div class="menu3" id="menu3">
    <div class="spinner-border text-light spinner-slow-big" id="blue" role="status">
      <span class="visually-hidden">Chargement...</span>
    </div>
  `,

	attachEvents: (el) => {
		initM3();
	},
});

function initM3() {
	Store.menuElement3 = document.getElementById('menu3');
	if (!Store.menuElement3) {
		return;
	}
	Store.menuObject3 = new CSS3DObject(Store.menuElement3);
	Store.menuObject3.visible = false;
	Store.menuElement3.style.pointerEvents = 'auto';
	Store.menuObject3.position.set(3.1, 4.5, -1.85);
	Store.menuObject3.rotation.set(-5.2, -0.6, -0.2);
	Store.menuObject3.scale.set(0.002, 0.002, 0.002);
	Store.menuElement3.style.display = 'none';
	Store.menuElement3.classList.add('active');
	if (Store.menuObject3) Store.scene.add(Store.menuObject3);


	const video = document.createElement('video');
	video.src = '/src/assets/video/screensaver98.mp4';
	video.loop = true;
	video.muted = true;
	video.playsInline = true;
	video.play();
	
	const videoTexture = new THREE.VideoTexture(video);
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
	videoTexture.format = THREE.RGBFormat;
	
	const newMaterial = new THREE.MeshStandardMaterial({
		map: videoTexture,
	});
	
	Store.screenObject2.material = newMaterial;
}
