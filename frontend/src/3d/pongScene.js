import * as THREE from "https://esm.sh/three";
import Store from './store.js';

export const mapConfigs = {
  map1: { color: 0xff0000 },
  map2: { color: 0x0000ff },
  map3: { color: 0x00ff00 },
  map4: { color: 0x00ffff },
};


export const renderTarget = new THREE.WebGLRenderTarget(1024, 1024, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  type: THREE.UnsignedByteType
});


export const screenMaterial = new THREE.MeshStandardMaterial({
  map: renderTarget.texture,
  emissive: 0x000000,
  emissiveIntensity: 0.1,
});

export let cameraCube;

export function buildGameScene(gameConfig) {
  if (Store.pongScene) {
    Store.pongScene.clear();
  } else {
    Store.pongScene = new THREE.Scene();
  }

  cameraCube = new THREE.PerspectiveCamera(25, 636 / 512, 0.1, 1000);
  cameraCube.position.z = 7;


  const ballGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const ballMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 0.2,
  });
  Store.meshBall = new THREE.Mesh(ballGeometry, ballMaterial);
  Store.pongScene.add(Store.meshBall);


  const paddleGeometry = new THREE.BoxGeometry(0.2, 0.6, 0.1);
  const paddleMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    emissive: 0x00ff00,
    emissiveIntensity: 0.2,
  });

  Store.player1Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
  Store.player2Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);

  Store.player1Paddle.position.set(-0.8, 0, 0);
  Store.player2Paddle.position.set(0.8, 0, 0);

  Store.pongScene.add(Store.player1Paddle);
  Store.pongScene.add(Store.player2Paddle);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(5, 5, 5);
  Store.pongScene.add(ambientLight, pointLight);
}

export function animatePong(renderer) 
{
  if (!Store.pongScene || !cameraCube) 
    return;
  renderer.setRenderTarget(renderTarget);
  renderer.render(Store.pongScene, cameraCube);
  renderer.setRenderTarget(null);
}