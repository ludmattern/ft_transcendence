import * as THREE from 'https://esm.sh/three';
import { FlyControls } from 'https://esm.sh/three/examples/jsm/controls/FlyControls.js';
import Store from './store.js';

// =============== INIT SCENE ENVIREMENT ===============

export function initScene() {
	Store.scene = new THREE.Scene();
}

export function initControls() {
	Store.controls = new FlyControls(Store.camera, Store.renderer.domElement);
	Store.controls.movementSpeed = 5;
	Store.controls.rollSpeed = Math.PI / 10;
	Store.controls.dragToLook = true;
}

export function initCamera() {
	Store.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
	Store.camera.position.set(0, 0, 1.4);
	Store.camera.lookAt(0, 50, -12);

	const cameraLight = new THREE.PointLight(0xb0e7ec, 1, 6);
	cameraLight.position.set(0, 5.5, -1.5);
	Store.scene.add(cameraLight);

	const cameraLight2 = new THREE.PointLight(0xb0e7ec, 1, 6);
	cameraLight2.position.set(-3, 3, -1.5);
	Store.scene.add(cameraLight2);

	const cameraLight3 = new THREE.PointLight(0xb0e7ec, 1, 6);
	cameraLight3.position.set(3, 3, -1.5);
	Store.scene.add(cameraLight3);

	Store.scene.add(Store.camera);
}

export function initRenderer() {
	Store.renderer = new THREE.WebGLRenderer({ antialias: true });
	Store.renderer.setSize(window.innerWidth, window.innerHeight);
	Store.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
	Store.renderer.shadowMap.enabled = true;
	document.getElementById('app').appendChild(Store.renderer.domElement);
}

export function initSkybox() {
	const skyboxImages = [
		'/src/assets/img/skybox/right.png',
		'/src/assets/img/skybox/left.png',
		'/src/assets/img/skybox/top.png',
		'/src/assets/img/skybox/bottom.png',
		'/src/assets/img/skybox/front.png',
		'/src/assets/img/skybox/back.png',
	];
	const loader = new THREE.CubeTextureLoader();
	const skyboxTexture = loader.load(skyboxImages);
	Store.scene.background = skyboxTexture;
}

export function initLights() {
	const sunLight = new THREE.DirectionalLight(0xffffff, 1);
	sunLight.position.set(-15000, 280210.384550551276, -9601.008032820177);
	sunLight.castShadow = true;
	sunLight.receiveShadow = true;
	const target = new THREE.Object3D();
	target.position.set(100, 0, -100);
	sunLight.target = target;
	Store.scene.add(sunLight);
}
