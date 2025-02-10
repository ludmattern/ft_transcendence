import * as THREE from "https://esm.sh/three";
import Store from './store.js';

const aspectRatio = 2048 / 1024;  // Ajuste selon ton écran

export const renderTargetP1 = new THREE.WebGLRenderTarget(1024, 1024, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  type: THREE.UnsignedByteType
});

export const renderTargetP2 = new THREE.WebGLRenderTarget(1024, 1024, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  type: THREE.UnsignedByteType
});

export let cameraPlayer1, cameraPlayer2, screenMesh;

export let screenMaterial = new THREE.ShaderMaterial({
  uniforms: {
    textureP1: { value: renderTargetP1.texture },
    textureP2: { value: renderTargetP2.texture }
  },
  vertexShader: ``,
  fragmentShader: ``
});

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
    `
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
    `
  }
};






export let cameraCube;

export function buildGameScene(gameConfig) {
  Store.gameConfig = gameConfig; 

  if (Store.pongScene) {
    Store.pongScene.clear();
  } else {
    Store.pongScene = new THREE.Scene();
  }

  if (gameConfig.mode === "local") {
    // 🟢 Mode Local : Split-Screen
    cameraPlayer1 = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
    cameraPlayer1.position.set(-4, 2, 5);
    cameraPlayer1.lookAt(0, 0, 0);

    cameraPlayer2 = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
    cameraPlayer2.position.set(4, 2, 5);
    cameraPlayer2.lookAt(0, 0, 0);

    // Applique le shader split-screen
    screenMaterial.vertexShader = shaders.local.vertex;
    screenMaterial.fragmentShader = shaders.local.fragment;
    screenMaterial.needsUpdate = true;

  } else if (gameConfig.mode === "matchmaking") {
    cameraPlayer1 = new THREE.PerspectiveCamera(25, 1024 / 512, 0.01, 1000);
    cameraPlayer1.position.set(0, 2, 5);
    cameraPlayer1.lookAt(0, 0, 0);

    // Applique le shader simple
    screenMaterial.vertexShader = shaders.matchmaking.vertex;
    screenMaterial.fragmentShader = shaders.matchmaking.fragment;
    screenMaterial.needsUpdate = true;
  }

  const screenGeometry = new THREE.PlaneGeometry(2, 1);
  screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
  screenMesh.position.set(0, 1, -2);
  Store.pongScene.add(screenMesh);



  cameraCube = new THREE.PerspectiveCamera(25, 1024 / 512, 0.01, 1000); 
  cameraCube.position.z = 7;

  
  const ballGeometry = new THREE.SphereGeometry(0.15, 32, 32); 
const ballMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xffcc00, 
  emissiveIntensity: 0.3,
  roughness: 0.3,  
  metalness: 0.5,
});
Store.meshBall = new THREE.Mesh(ballGeometry, ballMaterial);
Store.pongScene.add(Store.meshBall);



  const paddleGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.1);
  const paddleMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    emissive: 0x00ff00,
    emissiveIntensity: 0.2,
  });


const wallGeometry = new THREE.BoxGeometry(0.05, 2.1, 0.2);
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
leftWall.position.set(-1, 0, 0);
Store.pongScene.add(leftWall);

const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
rightWall.position.set(1, 0, 0);
Store.pongScene.add(rightWall);

const topBottomWallGeometry = new THREE.BoxGeometry(3.4, 0.05, 0.2); 
const topWall = new THREE.Mesh(topBottomWallGeometry, wallMaterial);
const bottomWall = new THREE.Mesh(topBottomWallGeometry, wallMaterial);

const floorGeometry = new THREE.PlaneGeometry(3.4, 2.1);
const floorMaterial = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa, 
  roughness: 0.8,  
  side: THREE.DoubleSide 
});

const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.z = -0.1; 

Store.pongScene.add(floor);

leftWall.position.set(-1.7, 0, 0);
rightWall.position.set(1.7, 0, 0);

topWall.position.set(0, 1.03, 0); 
bottomWall.position.set(0, -1.03, 0);  

Store.pongScene.add(topWall);
Store.pongScene.add(bottomWall);

const middleLineGeometry = new THREE.BoxGeometry(0.05, 2.1, 0.01);
const middleLineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

const middleLine = new THREE.Mesh(middleLineGeometry, middleLineMaterial);
middleLine.position.set(0, 0, 0.01); 

Store.pongScene.add(middleLine);


  Store.player1Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
  Store.player2Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);

  Store.player1Paddle.position.set(-1.5, 0, 0);
  Store.player2Paddle.position.set(1.5, 0, 0);

  Store.pongScene.add(Store.player1Paddle);
  Store.pongScene.add(Store.player2Paddle);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); 
  Store.pongScene.add(ambientLight);
  
  const spotLight = new THREE.SpotLight(0x00ffcc, 1);
  spotLight.position.set(0, 5, 5);
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.2;
  Store.pongScene.add(spotLight);
  

Store.scoreP1 = createScoreText(-0.8);
Store.scoreP2 = createScoreText(0.8);

Store.pongScene.add(Store.scoreP1);
Store.pongScene.add(Store.scoreP2);
}

export function createTextTexture(text) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 256; 
  canvas.height = 128;

  ctx.fillStyle = "transparent"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "Bold 120px Arial";
  ctx.fillStyle = "white"; 
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createScoreText(positionX) 
{
  const textTexture = createTextTexture("0");

  textTexture.center.set(0.5, 0.5);

  const textMaterial = new THREE.MeshBasicMaterial({ 
      map: textTexture, 
      transparent: true,
      side: THREE.DoubleSide  

  });

  const textGeometry = new THREE.PlaneGeometry(0.8, 0.4);
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);

  textMesh.position.set(positionX, 0, 0.03);
  textMesh.rotation.x = THREE.MathUtils.degToRad(-180);

  return textMesh;
}


export function animatePong(renderer) {
  if (!Store.pongScene || !Store.gameConfig) return;

  if (Store.gameConfig.mode === "local") {
    if (!cameraPlayer1 || !cameraPlayer2) return;

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

  } else if (Store.gameConfig.mode === "matchmaking") {
    if (!cameraPlayer1) return;

    screenMesh.visible = false;

    // 🔵 Rendu du matchmaking avec une seule caméra
    renderer.setRenderTarget(renderTargetP1);
    renderer.render(Store.pongScene, cameraPlayer1);
    
    screenMesh.visible = true;
    screenMaterial.uniforms.textureP1.value = renderTargetP1.texture;

    renderer.setRenderTarget(null);
    renderer.render(Store.pongScene, cameraCube);
  }
}
