import Store from '/src/3d/store.js';
import * as THREE from 'https://esm.sh/three';
import { onBaseMouseMove, setCameraRotation } from '/src/3d/freeViewHandler.js';
import { screenMaterial } from '/src/3d/pongScene.js';

let currentWindow = null;

const CAMERA_POSITIONS = {
	pong: new THREE.Vector3(-2.559453657498437, 3.253545045816075, -0.7922370317858861),
	race: new THREE.Vector3(1.9765430745879866, 3.434172967891374, -0.9419868064632663),
	game: new THREE.Vector3(-0.2, 5.257378802731586, -0.8900580859235202),
	home: new THREE.Vector3(0, 0, 1.4),
};

const CAMERA_ROTATIONS = {
	pong: { x: Math.PI / 3.2, y: Math.PI / 5.5, z: Math.PI / 12 },
	race: { x: Math.PI / 3.2, y: -Math.PI / 5.5, z: -Math.PI / 12 },
	game: { x: Math.PI / 3, y: 0, z: 0 },
	home: { x: 1.3, y: 0, z: 0 },
};

const CAMERA_TARGETS = {
	pong: 2,
	race: 3,
	game: 1,
	home: 0,
};

// =============== WINDOW SWITCHER ===============

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

export function switchwindow(screen) {
	if (screen === currentWindow) return;
	currentWindow = screen;
	Store.isCameraMoving = true;

	if (screen === 'home' && Store.pongScene) {
		Store.pongScene.clear();
	}
	animateCameraToTarget(CAMERA_POSITIONS[screen], CAMERA_ROTATIONS[screen], CAMERA_TARGETS[screen]);

	if (screen === 'pong') {
		Store.camera.updateMatrixWorld(true);
	}
}

// =============== GSAP ANIMATION ===============
export function animateCameraToTarget(endPosition, endRotation, nb) {
	if (Store.currentTween) {
		Store.currentTween.kill();
		Store.currentTween = null;
		Store.isCameraMoving = false;
	}
	const startPosition = Store.camera.position.clone();
	const startQuaternion = Store.camera.quaternion.clone();

	Store.camera.position.copy(endPosition);
	Store.camera.rotation.set(endRotation.x, endRotation.y, endRotation.z, 'XYZ');
	const endQuaternion = Store.camera.quaternion.clone();

	Store.camera.position.copy(startPosition);
	Store.camera.quaternion.copy(startQuaternion);

	if (startQuaternion.dot(endQuaternion) < 0) {
		endQuaternion.x *= -1;
		endQuaternion.y *= -1;
		endQuaternion.z *= -1;
		endQuaternion.w *= -1;
	}

	const dummy = { t: 0 };
	Store.isCameraMoving = true;
	document.removeEventListener('mousemove', onBaseMouseMove, false);
	Store.currentTween = gsap.to(dummy, {
		duration: 2,
		t: 1,
		ease: 'power2.inOut',
		onUpdate: () => {
			const t = dummy.t;
			Store.camera.position.lerpVectors(startPosition, endPosition, t);
			Store.camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
			setCameraRotation(Store.camera.rotation.y);
		},
		onComplete: () => {
			Store.currentTween = null;
			if (nb == 1) {
				Store.screenObject1.material = screenMaterial;
				Store.screenObject2.material = Store.material;
				Store.menuObject3.visible = true;
			}
			if (nb == 0) {
				Store.menuElement.querySelector('.mid-screensaver').display = 'block';
				Store.menuElement.classList.add('active');
				Store.screenObject2.material = Store.material;
				Store.menuObject3.visible = true;
				Store.screenObject1.material = Store.material;
			}
			if (nb == 2) {
				Store.screenObject1.material = Store.material;
				Store.screenObject2.material = Store.material;
				Store.menuObject3.visible = true;
			}
			if (nb == 3) {
				Store.screenObject2.material = newMaterial;
				Store.screenObject1.material = Store.material;
				Store.menuObject3.visible = false;
			}

			Store.initialCameraRotation.x = Store.camera.rotation.x;
			Store.initialCameraRotation.y = Store.camera.rotation.y;
			Store.cameraRotation.x = Store.camera.rotation.x;
			Store.cameraRotation.y = Store.camera.rotation.y;
			Store.onScreen = true;
			document.addEventListener('mousemove', onBaseMouseMove, false);
			Store.isCameraMoving = false;
			Store.camera.updateMatrixWorld(true);
			onBaseMouseMove();
		},
	});
}

export function animateCameraBackToInitialPosition() {
	animateCameraToTarget(CAMERA_POSITIONS[currentWindow], CAMERA_ROTATIONS[currentWindow], CAMERA_TARGETS[currentWindow]);
}

export function getCurrentWindow() {
	return currentWindow;
}
