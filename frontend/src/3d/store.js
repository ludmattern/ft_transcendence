import * as THREE from 'https://esm.sh/three';

const Store = {
	scene: null,
	camera: null,
	renderer: null,
	cssRenderer: null,
	composer: null,

	controls: null,

	menuObject: null,
	menuObject2: null,
	menuObject3: null,

	menuElement: null,
	menuElement2: null,
	menuElement3: null,

	screenObject1: null,
	screenObject2: null,
	screenObject3: null,
	planet: null,
	model: null,

	onScreen: false,
	freeViewEnabled: false,
	isCameraMoving: false,
	cameraRotation: { x: 0, y: 0, z: 0 },
	initialCameraRotation: { x: 0, y: 0, z: 0 },
	currentTween: null,

	plaqueTop: null,
	plaqueBottom: null,
	plaqueLeft: null,
	plaqueRight: null,

	pongScene: null,
	cubePosition: { x: 0, y: 0 },
	meshBall: null,
	player1Paddle: null,
	player2Paddle: null,
	lastBallY: null,
	cameraRotationEvent: 0,
	listeners: [],
	gameConfig: null,

	material: new THREE.MeshStandardMaterial({
		emissive: new THREE.Color(0x050505),
		emissiveIntensity: 1,
		color: new THREE.Color(0x050505),
	}),

	saturnConfig: {
		positionX: 3247,
		positionY: 2304,
		positionZ: -3000,
		rotationX: 86,
		rotationY: 12,
		rotationZ: -79,
		scale: 5,
	},
};

export default Store;
