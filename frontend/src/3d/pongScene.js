import * as THREE from 'https://esm.sh/three';
import Store from './store.js';
import { LineSegments } from 'https://esm.sh/three';
import { EdgesGeometry } from 'https://esm.sh/three';
import { LineBasicMaterial } from 'https://esm.sh/three';
let aspectRatio;

export const renderTargetP1 = new THREE.WebGLRenderTarget(4096, 2048, {
	format: THREE.RGBAFormat,
});

export const renderTargetP2 = new THREE.WebGLRenderTarget(4096, 2048, {
	format: THREE.RGBAFormat,
});

export let cameraPlayer1, cameraPlayer2, screenMesh;

const shaders = {
	local: {
		vertex: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
		fragment: `
      uniform sampler2D textureP1;
      uniform sampler2D textureP2;
      varying vec2 vUv;

      void main() {
        vec4 color;
        if (vUv.x < 0.5) {
          color = texture2D(textureP1, vec2(vUv.x * 2.0, vUv.y));
        } else {
          color = texture2D(textureP2, vec2((vUv.x - 0.5) * 2.0, vUv.y));
        }
        gl_FragColor = color;
      }
    `,
	},
	matchmaking: {
		vertex: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
		fragment: `
      uniform sampler2D textureP1;
      varying vec2 vUv;

      void main() {
        gl_FragColor = texture2D(textureP1, vUv);
      }
    `,
	},
};

export let screenMaterial = new THREE.ShaderMaterial({
	uniforms: {
		textureP1: { value: renderTargetP1.texture },
		textureP2: { value: renderTargetP2.texture },
	},
	vertexShader: shaders.local.vertex,
	fragmentShader: shaders.local.fragment,
});

export let cameraCube;

export function buildGameScene(gameConfig) {
	Store.gameConfig = gameConfig;

	if (Store.pongScene) {
		Store.pongScene.clear();
	} else {
		Store.pongScene = new THREE.Scene();
	}

	if (gameConfig.mode === 'local') {
		aspectRatio = 1;

		cameraPlayer1 = new THREE.PerspectiveCamera(30, aspectRatio, 0.1, 1000);
		cameraPlayer1.position.set(0, 0, -12);
		cameraPlayer1.lookAt(0, 0, 0);

		cameraPlayer2 = new THREE.PerspectiveCamera(30, aspectRatio, 0.1, 1000);
		cameraPlayer2.position.set(0, 0, 12);
		cameraPlayer2.lookAt(0, 0, 0);

		screenMaterial.vertexShader = shaders.local.vertex;
		screenMaterial.fragmentShader = shaders.local.fragment;
		screenMaterial.needsUpdate = true;

		cameraPlayer1.aspect = aspectRatio;
		cameraPlayer1.updateProjectionMatrix();

		cameraPlayer2.aspect = aspectRatio;
		cameraPlayer2.updateProjectionMatrix();
	} else if (gameConfig.mode === 'matchmaking' || gameConfig.mode === 'private' || gameConfig.mode === 'solo') {
		aspectRatio = 2;

		cameraPlayer1 = new THREE.PerspectiveCamera(25, aspectRatio, 0.01, 1000);
		cameraPlayer1.position.set(0, 0, 12);
		cameraPlayer1.lookAt(0, 0, 0);

		screenMaterial.vertexShader = shaders.matchmaking.vertex;
		screenMaterial.fragmentShader = shaders.matchmaking.fragment;
		screenMaterial.needsUpdate = true;
	}

	const screenGeometry = new THREE.PlaneGeometry(2, 1);
	screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
	screenMesh.position.set(0, 1, -2);
	Store.pongScene.add(screenMesh);

	cameraCube = new THREE.PerspectiveCamera(25, aspectRatio, 0.01, 1000);
	cameraCube.position.z = 7;

	const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

	const fragmentShader = `
  uniform float uCellSize;      // Taille manuelle de la cellule (hauteur)
  uniform float uNumCells;      // Nombre de cellules par axe (pour le mode nombre de cellules)
  uniform float uUseNumCells;   // Mode : 1.0 = utiliser le nombre de cellules, 0.0 = utiliser uCellSize
  uniform float uCellAspect;    // Facteur pour la largeur de la cellule (1.0 = carré, < 1.0 = cellule plus étroite)
  uniform float uThickness;
  uniform float uModOffset;
  uniform float uGridCenter;
  uniform float uLineMultiplier;
  uniform vec3 uBackgroundColor;
  uniform vec3 uNeonColor;
  varying vec2 vUv;
  
  void main() {
    // Calcul de la taille effective (hauteur) de la cellule selon le mode choisi
    float effectiveCellSize = mix(uCellSize, 1.0 / uNumCells, uUseNumCells);
    // La largeur effective est réduite par le facteur uCellAspect
    float effectiveCellSizeX = effectiveCellSize * uCellAspect;
    
    // Calcul des coordonnées locales dans chaque cellule
    float gridX = mod(vUv.x / effectiveCellSizeX + uModOffset, 1.0);
    float gridY = mod(vUv.y / effectiveCellSize + uModOffset, 1.0);

    float lineX = smoothstep(uThickness, uThickness * uLineMultiplier, abs(gridX - uGridCenter));
    float lineY = smoothstep(uThickness, uThickness * uLineMultiplier, abs(gridY - uGridCenter));

    float gridLines = 1.0 - min(lineX, lineY);
    vec3 color = mix(uBackgroundColor, uNeonColor, gridLines);

    gl_FragColor = vec4(color, 1.0);
  }
`;

	const neonMaterial = new THREE.ShaderMaterial({
		vertexShader,
		fragmentShader,
		uniforms: {
			uCellSize: { value: 0.1 },
			uNumCells: { value: 19.0 },
			uUseNumCells: { value: 1.0 },
			uCellAspect: { value: 0.26 },
			uThickness: { value: 0.02 },
			uModOffset: { value: 0.55 },
			uGridCenter: { value: 0.55 },
			uLineMultiplier: { value: 5.0 },
			uBackgroundColor: { value: new THREE.Color(0x000000) },
			uNeonColor: { value: new THREE.Color(0x303049) },
		},
	});

	const floorCeilingMaterial = neonMaterial;
	const endWallMaterial = neonMaterial;

	const tunnelWidth = 7.5;
	const tunnelHeight = 1.5;
	const tunnelDepth = 1.5;

	const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(tunnelWidth, tunnelDepth), floorCeilingMaterial);
	ceiling.position.set(0, tunnelHeight / 2, 0);
	ceiling.rotation.x = Math.PI / 2;

	const floor = new THREE.Mesh(new THREE.PlaneGeometry(tunnelWidth, tunnelDepth), floorCeilingMaterial);
	floor.position.set(0, -tunnelHeight / 2, 0);
	floor.rotation.x = -Math.PI / 2;

	const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(tunnelWidth, tunnelHeight), endWallMaterial);
	frontWall.position.set(0, 0, -tunnelDepth / 2);

	const backWall = new THREE.Mesh(new THREE.PlaneGeometry(tunnelWidth, tunnelHeight), endWallMaterial);
	backWall.position.set(0, 0, tunnelDepth / 2);
	backWall.rotation.y = Math.PI;
	backWall.rotation.z = -Math.PI;

	Store.pongScene.add(ceiling);
	Store.pongScene.add(floor);
	Store.pongScene.add(frontWall);
	Store.pongScene.add(backWall);

	const plaqueMaterial = new THREE.MeshBasicMaterial({
		color: 0x0000ff,
		transparent: true,
		opacity: 0.8,
		side: THREE.DoubleSide,
	});

	const plaqueSize = { width: 0.25, height: 0.25 };

	function createPlaqueWithEdges(width, height, material) {
		const geometry = new THREE.PlaneGeometry(width, height);
		const plaqueMesh = new THREE.Mesh(geometry, material);

		const edgesGeometry = new THREE.EdgesGeometry(geometry);
		const edgesMaterial = new THREE.LineBasicMaterial({
			color: 0xffffff,
			linewidth: 10,
		});
		const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);

		const plaqueGroup = new THREE.Group();
		plaqueGroup.add(plaqueMesh);
		plaqueGroup.add(edgesMesh);

		return plaqueGroup;
	}

	Store.plaqueTop = createPlaqueWithEdges(plaqueSize.width, plaqueSize.height, plaqueMaterial);
	Store.plaqueBottom = createPlaqueWithEdges(plaqueSize.width, plaqueSize.height, plaqueMaterial);
	Store.plaqueLeft = createPlaqueWithEdges(plaqueSize.width, plaqueSize.height, plaqueMaterial);
	Store.plaqueRight = createPlaqueWithEdges(plaqueSize.width, plaqueSize.height, plaqueMaterial);

	Store.plaqueTop.rotation.x = Math.PI / 2;
	Store.plaqueBottom.rotation.x = -Math.PI / 2;

	Store.pongScene.add(Store.plaqueTop);
	Store.pongScene.add(Store.plaqueBottom);
	Store.pongScene.add(Store.plaqueLeft);
	Store.pongScene.add(Store.plaqueRight);

	const paddleGeometry = new THREE.BoxGeometry(0.07, 0.33, 0.33);
	const paddleMaterial = new THREE.MeshStandardMaterial({
		color: 0x7f00ff,
		transparent: true,
		opacity: 0.3,
	});

	const paddleMaterial2 = new THREE.MeshStandardMaterial({
		color: 0xff007f,
		transparent: true,
		opacity: 0.3,
	});
	const edgesGeometry = new EdgesGeometry(paddleGeometry);
	const edgesMaterial = new LineBasicMaterial({
		color: 0xffffff,
		linewidth: 10,
	});

	const solidPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
	const wireframePaddle = new LineSegments(edgesGeometry, edgesMaterial);
	const paddleGroup = new THREE.Group();

	paddleGroup.add(solidPaddle);
	paddleGroup.add(wireframePaddle);

	Store.player1Paddle = paddleGroup;
	Store.pongScene.add(Store.player1Paddle);

	const paddleGroup2 = new THREE.Group();
	const solidPaddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial2);
	const wireframePaddle2 = new LineSegments(edgesGeometry, edgesMaterial);

	paddleGroup2.add(solidPaddle2);
	paddleGroup2.add(wireframePaddle2);

	Store.player2Paddle = paddleGroup2;
	Store.pongScene.add(Store.player2Paddle);

const meshBallGeometry = new THREE.SphereGeometry(0.05, 30, 15);
	const meshBallMaterial = new THREE.MeshStandardMaterial({
		color: 0x5588f1,
		emissive: 0x5588f1,
		emissiveIntensity: 2,
		roughness: 0.2,
		metalness: 0.8,
	});

	Store.meshBall = new THREE.Mesh(meshBallGeometry, meshBallMaterial);
	Store.meshBall.position.set(0, 0, 0);
	Store.pongScene.add(Store.meshBall);

	cameraPlayer1 = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 100);
	cameraPlayer1.lookAt(0, 0, 0);

	cameraPlayer2 = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 100);
	cameraPlayer2.lookAt(0, 0, 0);

	const ambientLight = new THREE.AmbientLight(0xffffff, 1);
	Store.pongScene.add(ambientLight);

}

const lerpFactor = 0.5;
const lerpFactorCam = 0.15;

function updatePaddleAndFocus(paddle, target, focus) {
    if (!paddle || !target) return;
    paddle.position.lerp(target, lerpFactor);
    focus.lerp(target, lerpFactor);
}

function updateCameraPosition(camera, focus, offset) {
    camera.position.lerp(focus.clone().add(offset), lerpFactorCam);
    camera.lookAt(focus);
}


function renderNetworkMode(renderer) 
{
    if (!cameraPlayer1) return; 

    const { side } = Store.gameConfig;

    if (!Store.p1Focus) Store.p1Focus = new THREE.Vector3();
    if (!Store.p2Focus) Store.p2Focus = new THREE.Vector3();

    let activeCamera = null;

    if (side === 'left') {
        updatePaddleAndFocus(Store.player1Paddle, Store.p1Target, Store.p1Focus);
        activeCamera = cameraPlayer1;
        const offsetLeft = new THREE.Vector3(-0.75, 0, 0);
        updateCameraPosition(activeCamera, Store.p1Focus, offsetLeft);
        if (Store.player2Paddle && Store.p2Target) 
            Store.player2Paddle.position.lerp(Store.p2Target, lerpFactor);

    } else if (side === 'right') {
        updatePaddleAndFocus(Store.player2Paddle, Store.p2Target, Store.p2Focus);
        activeCamera = cameraPlayer2;
        const offsetRight = new THREE.Vector3(0.75, 0, 0);
        updateCameraPosition(activeCamera, Store.p2Focus, offsetRight);
        if (Store.player1Paddle && Store.p1Target)
            Store.player1Paddle.position.lerp(Store.p1Target, lerpFactor);
	}
    
    screenMesh.visible = false;
    renderer.setRenderTarget(renderTargetP1);
    renderer.render(Store.pongScene, activeCamera);

    screenMesh.visible = true;
    screenMaterial.uniforms.textureP1.value = renderTargetP1.texture;

    renderer.setRenderTarget(null);
    renderer.render(Store.pongScene, cameraCube);
}

function renderLocalMode(renderer) {
    if (!cameraPlayer1 || !cameraPlayer2) return;

    if (!Store.p1Focus) Store.p1Focus = new THREE.Vector3();
    if (!Store.p2Focus) Store.p2Focus = new THREE.Vector3();

    updatePaddleAndFocus(Store.player1Paddle, Store.p1Target, Store.p1Focus);
    updatePaddleAndFocus(Store.player2Paddle, Store.p2Target, Store.p2Focus);

    const offsetP1 = new THREE.Vector3(-0.75, 0, 0);
    const offsetP2 = new THREE.Vector3(0.75, 0, 0);
    updateCameraPosition(cameraPlayer1, Store.p1Focus, offsetP1);
    updateCameraPosition(cameraPlayer2, Store.p2Focus, offsetP2);

    screenMesh.visible = false;
    renderer.setRenderTarget(renderTargetP1);
    renderer.render(Store.pongScene, cameraPlayer1);

    renderer.setRenderTarget(renderTargetP2);
    renderer.render(Store.pongScene, cameraPlayer2);

    screenMesh.visible = true;

    screenMaterial.uniforms.textureP1.value = renderTargetP1.texture;
    screenMaterial.uniforms.textureP2.value = renderTargetP2.texture;

    renderer.setRenderTarget(null);
    renderer.render(Store.pongScene, cameraCube);
}


export function animatePong(renderer) {
    if (!Store.pongScene || !Store.gameConfig) return;

    const { mode } = Store.gameConfig;

    if (mode === 'local') {
        renderLocalMode(renderer);
    } else if (['matchmaking', 'private', 'solo'].includes(mode)) {
        renderNetworkMode(renderer);
    }
}



export function triggerBallColorChange() {
	if (!Store.meshBall) return;

	const originalColor = new THREE.Color(0x5588f1);
	const hitColor = new THREE.Color(0xffffff);

	let elapsed = 0;
	const duration = 0.15;
	const interval = 30;

	Store.meshBall.material.emissive.set(hitColor);

	const fadeBack = setInterval(() => {
		elapsed += interval / 1000;
		const t = Math.min(elapsed / duration, 1);
		Store.meshBall.material.emissive.lerpColors(hitColor, originalColor, t);

		if (t >= 1) {
			clearInterval(fadeBack);
		}
	}, interval);
}

export function triggerPaddleColorChange(paddle, originalColor) {
	if (!paddle) return;

	const hitColor = new THREE.Color(0xffffff);
	let elapsed = 0;
	const duration = 0.15;
	const interval = 30;

	paddle.children[0].material.color = new THREE.Color(hitColor);

	const fadeBack = setInterval(() => {
		elapsed += interval / 1000;
		const t = Math.min(elapsed / duration, 1);

		paddle.children[0].material.color.lerpColors(hitColor, originalColor, t);

		if (t >= 1) {
			clearInterval(fadeBack);
		}
	}, interval);
}