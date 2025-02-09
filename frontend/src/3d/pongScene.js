import * as THREE from "https://esm.sh/three";
import Store from './store.js';
import { FontLoader } from "https://esm.sh/three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "https://esm.sh/three/examples/jsm/geometries/TextGeometry.js";
export const mapConfigs = {
  map1: { color: 0xff0000 },
  map2: { color: 0x0000ff },
  map3: { color: 0x00ff00 },
  map4: { color: 0x00ffff },
};


const aspectRatio = 2048 / 1024;  // Ajuste selon ton écran

export const renderTarget = new THREE.WebGLRenderTarget(2048, Math.round(1024 / aspectRatio), {
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

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let cameraAngleX = 0;
let cameraAngleY = 0;
let cameraDistance = 7;  


function onMouseDown(event) {
  isDragging = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

function onMouseMove(event) {
  if (!isDragging) return;

  const deltaX = event.clientX - lastMouseX;
  const deltaY = event.clientY - lastMouseY;

  lastMouseX = event.clientX;
  lastMouseY = event.clientY;

  cameraAngleX -= deltaX * 0.005; 
  cameraAngleY -= deltaY * 0.005; 

  cameraAngleY = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, cameraAngleY));
}

function onMouseUp() {
  isDragging = false;
}

function onMouseWheel(event) {
  cameraDistance += event.deltaY * 0.01;
  cameraDistance = Math.max(5, Math.min(10, cameraDistance)); 
}

function updateCameraPosition() {
  const maxAngle = Math.PI / 3; 
  cameraAngleX = Math.max(-maxAngle, Math.min(maxAngle, cameraAngleX));

  cameraDistance = Math.max(5, Math.min(10, cameraDistance));

  cameraCube.position.x = cameraDistance * Math.sin(cameraAngleX);
  cameraCube.position.z = cameraDistance * Math.cos(cameraAngleX);
  cameraCube.position.y = cameraDistance * Math.sin(cameraAngleY);

  cameraCube.lookAt(0, 0, 0);
}



export let cameraCube;

export function buildGameScene(gameConfig) {
  if (Store.pongScene) {
    Store.pongScene.clear();
  } else {
    Store.pongScene = new THREE.Scene();
  }
  window.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("wheel", onMouseWheel);


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

const middleLineGeometry = new THREE.BoxGeometry(0.05, 2.1, 0.01); // 🔲 Long et fin
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
  


// Ajouter les scores sur le sol
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

function createScoreText(positionX) {
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
  if (!Store.pongScene || !cameraCube) return;

  updateCameraPosition();

  renderer.setRenderTarget(renderTarget);

  renderer.render(Store.pongScene, cameraCube);
  renderer.setRenderTarget(null);
}
