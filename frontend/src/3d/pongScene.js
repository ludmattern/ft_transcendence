import * as THREE from "https://esm.sh/three";
import Store from './store.js';
import { initializeWebSocket } from "/src/services/socketManager.js"

export const mapConfigs = {
  map1: { color: 0xff0000 },
  map2: { color: 0x0000ff },
  map3: { color: 0x00ff00 },
  map4: { color: 0x00ffff },
};

export let cameraCube;
export let meshCube;


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

export function buildGameScene(gameConfig)
{
  if (Store.pongScene) {
    Store.pongScene.clear();
  } else {
    Store.pongScene = new THREE.Scene();
  }

  cameraCube = new THREE.PerspectiveCamera(25, 636 / 512, 0.1, 1000);
  cameraCube.position.z = 7;

  const config = mapConfigs[gameConfig.map] || { color: 0xffffff };
  const chosenColor = config.color;

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({
    color: chosenColor,
    emissive: chosenColor,
    emissiveIntensity: 0.5,
    shininess: 100
  });
  meshCube = new THREE.Mesh(geometry, material);
  Store.pongScene.add(meshCube);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);
  pointLight.position.set(5, 5, 5);
  Store.pongScene.add(ambientLight, pointLight);
}

export function animatePong(renderer) {
  if (!Store.pongScene || !cameraCube) return;

  meshCube.rotation.x += 0.01 * Math.sin(Date.now() * 0.001);
  meshCube.rotation.y += 0.01 * Math.cos(Date.now() * 0.001);

  meshCube.position.x = cubePosition.x;
  meshCube.position.y = cubePosition.y;
  

  renderer.setRenderTarget(renderTarget);
  renderer.render(Store.pongScene, cameraCube);
  renderer.setRenderTarget(null);
}

const socket = initializeWebSocket("pong", "ws://localhost:3004/ws/pong/");

let cubePosition = { x: 0, y: 0 };

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "position") {
    cubePosition.x = data.x;
    cubePosition.y = data.y;
  }
};

document.addEventListener("keydown", (e) => {
  let direction = null;
  if (e.key === "ArrowUp") direction = "up";
  if (e.key === "ArrowDown") direction = "down";
  if (e.key === "ArrowLeft") direction = "left";
  if (e.key === "ArrowRight") direction = "right";

  if (direction) {
    socket.send(JSON.stringify({
      type: "move",
      direction: direction
    }));
  }
});