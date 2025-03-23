import * as THREE from 'https://esm.sh/three';
import { EffectComposer } from 'https://esm.sh/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { animatePong } from '/src/3d/pongScene.js';
import Store from '/src/3d/store.js';
import { loadModels } from '/src/3d/loader.js';
import { initCSSRenderer } from '/src/3d/CSS3DRender.js';
import { initLights, initSkybox, initRenderer, initCamera, initScene } from '/src/3d/initScene.js';
import { initParticles, updateParticles } from '/src/3d/particules.js';

export function onWindowResize() {
	const width = window.innerWidth;
	const height = window.innerHeight;
	Store.renderer.setSize(width, height);
	Store.cssRenderer.setSize(width, height);
	Store.composer.setSize(width, height);
	Store.camera.aspect = width / height;
	Store.camera.updateProjectionMatrix();
}

function addEventListeners() {
	window.addEventListener('resize', onWindowResize);
}

export async function buildScene() {
	initScene();
	initRenderer();
	initCamera();
	initCSSRenderer();
	initSkybox();
	initLights();
	await loadModels();
	initParticles();
	addEventListeners();

	Store.initialCameraRotation.x = Store.camera.rotation.x;
	Store.initialCameraRotation.y = Store.camera.rotation.y;
	Store.cameraRotation.x = Store.camera.rotation.x;
	Store.cameraRotation.y = Store.camera.rotation.y;

	const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 1, 0);
	Store.composer = new EffectComposer(Store.renderer);
	const renderScene = new RenderPass(Store.scene, Store.camera);
	Store.composer.addPass(renderScene);
	Store.composer.addPass(bloomPass);

	animate();
}

let lastGameUpdateTime = 0;
const clock = new THREE.Clock();

function animate() {
	requestAnimationFrame(animate);

	const delta = clock.getDelta();
	updateParticles(delta);
	const now = performance.now();
	if (now - lastGameUpdateTime > 16.67) {
		animatePong(Store.renderer);
		lastGameUpdateTime = now;
	}

	if (Store.controls) Store.controls.update(0.01);

	if (Store.composer) Store.composer.render(Store.scene, Store.camera);
	else Store.renderer.render(Store.scene, Store.camera);
	if (Store.cssRenderer && Store.scene && Store.camera) Store.cssRenderer.render(Store.scene, Store.camera);
}
