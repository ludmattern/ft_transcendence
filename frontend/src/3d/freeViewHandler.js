import * as THREE from 'https://esm.sh/three';
import Store from './store.js';
import { animateCameraBackToInitialPosition } from '/src/3d/animation.js';

// =============== ROTATE LISTENER HANDLER ===============
export let cameraRotationEvent = 0;
export let listeners = [];
let lastRotation = 0;
let count = 0;

export function setCameraRotation(value) {
	cameraRotationEvent = value;
	if (lastRotation - cameraRotationEvent > 0.001 || lastRotation - cameraRotationEvent < -0.001) {
		lastRotation = cameraRotationEvent;
		listeners.forEach((listener) => listener(cameraRotationEvent));
	}
}

export function addCameraRotationListener(listener) {
	listeners.push(listener);
}

// =============== FREE VIEW HANDLER ===============
export function toggleFreeView() {
	Store.freeViewEnabled = !Store.freeViewEnabled;
	if (Store.freeViewEnabled) {
		Store.onScreen = true;
		enableFreeView();
	} else {
		Store.onScreen = false;
		disableFreeView();
		animateCameraBackToInitialPosition();
	}
}

// =============== OARALAX HANDLER ===============
export function onBaseMouseMove(event) {
	if (Store.isCameraMoving) return;

	const maxRotationAngle = Math.PI / 3;
	const rotationSpeed = 0.000005;

	const deltaX = event.movementX;
	const deltaY = event.movementY;

	Store.cameraRotation.y -= deltaX * rotationSpeed;
	Store.cameraRotation.x -= deltaY * rotationSpeed;

	Store.cameraRotation.y = THREE.MathUtils.clamp(Store.cameraRotation.y, Store.initialCameraRotation.y - maxRotationAngle, Store.initialCameraRotation.y + maxRotationAngle);

	Store.cameraRotation.x = THREE.MathUtils.clamp(Store.cameraRotation.x, Store.initialCameraRotation.x - maxRotationAngle / 2, Store.initialCameraRotation.x + maxRotationAngle / 2);

	Store.camera.rotation.set(Store.cameraRotation.x, Store.cameraRotation.y, Store.camera.rotation.z, 'XYZ');
	setCameraRotation(Store.camera.rotation.y);
	Store.camera.updateMatrixWorld(true);
}

document.addEventListener('pointerlockchange', () => {
	if (document.pointerLockElement !== Store.renderer.domElement && Store.freeViewEnabled) {
		Store.freeViewEnabled = false;
		disableFreeView();
		Store.onScreen = false;
		animateCameraBackToInitialPosition();
	}
});

// =============== FREE VIEW HANDLER ===============

export function enableFreeView() {
	document.removeEventListener('mousemove', onBaseMouseMove, false);
	Store.initialCameraRotation.x = Store.camera.rotation.x;
	Store.initialCameraRotation.y = Store.camera.rotation.y;
	Store.cameraRotation.x = Store.camera.rotation.x;
	Store.cameraRotation.y = Store.camera.rotation.y;
	Store.renderer.domElement.requestPointerLock();
	Store.menuElement.style.pointerEvents = 'none';
	Store.menuElement2.style.pointerEvents = 'none';
	Store.menuElement3.style.pointerEvents = 'none';
	document.addEventListener('mousemove', onFreeViewMouseMove, false);
}

export function disableFreeView() {
	document.exitPointerLock();
	Store.menuElement.style.pointerEvents = 'auto';
	Store.menuElement2.style.pointerEvents = 'auto';
	Store.menuElement3.style.pointerEvents = 'auto';
	document.removeEventListener('mousemove', onFreeViewMouseMove, false);
	document.addEventListener('mousemove', onBaseMouseMove, false);
}

export function onFreeViewMouseMove(event) {
	const maxRotationAngle = Math.PI / 3;
	const rotationSpeed = 0.00025;

	const deltaX = event.movementX;
	const deltaY = event.movementY;

	Store.cameraRotation.y -= deltaX * rotationSpeed;
	Store.cameraRotation.x -= deltaY * rotationSpeed;

	Store.cameraRotation.y = THREE.MathUtils.clamp(Store.cameraRotation.y, Store.initialCameraRotation.y - maxRotationAngle, Store.initialCameraRotation.y + maxRotationAngle);

	Store.cameraRotation.x = THREE.MathUtils.clamp(Store.cameraRotation.x, Store.initialCameraRotation.x - maxRotationAngle / 2, Store.initialCameraRotation.x + maxRotationAngle / 2);

	Store.camera.rotation.set(Store.cameraRotation.x, Store.cameraRotation.y, 0, 'XYZ');
	setCameraRotation(Store.camera.rotation.y);
	Store.camera.updateMatrixWorld(true);
}
