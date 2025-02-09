import * as THREE from "https://esm.sh/three";
import Store from './store.js';
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js";

export const mapConfigs = {
  map1: { color: 0xff0000 },
  map2: { color: 0x0000ff },
  map3: { color: 0x00ff00 },
  map4: { color: 0x00ffff },
};


const aspectRatio = 1024 / 512;  // Ajuste selon ton écran

export const renderTarget = new THREE.WebGLRenderTarget(1024, Math.round(1024 / aspectRatio), {
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
let cameraDistance = 7;  // Distance de la caméra par rapport au centre de l'arène


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

  // 🔄 Modifier l'angle de la caméra en fonction du déplacement de la souris
  cameraAngleX -= deltaX * 0.005; // Sensibilité horizontale
  cameraAngleY -= deltaY * 0.005; // Sensibilité verticale

  // Limiter la rotation verticale pour éviter de retourner la caméra
  cameraAngleY = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, cameraAngleY));
}

function onMouseUp() {
  isDragging = false;
}

// 🔍 Gestion du zoom avec la molette de la souris
function onMouseWheel(event) {
  cameraDistance += event.deltaY * 0.01;
  cameraDistance = Math.max(5, Math.min(10, cameraDistance)); // Limite la distance de zoom
}

function updateCameraPosition() {
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


// 🔹 Création des murs latéraux
const wallGeometry = new THREE.BoxGeometry(0.05, 2.1, 0.2);
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
leftWall.position.set(-1, 0, 0);
Store.pongScene.add(leftWall);

const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
rightWall.position.set(1, 0, 0);
Store.pongScene.add(rightWall);

const topBottomWallGeometry = new THREE.BoxGeometry(3.4, 0.05, 0.2); // 🔄 Ajuste la largeur
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



  Store.player1Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
  Store.player2Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);

  Store.player1Paddle.position.set(-1.5, 0, 0);
  Store.player2Paddle.position.set(1.5, 0, 0);

  Store.pongScene.add(Store.player1Paddle);
  Store.pongScene.add(Store.player2Paddle);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // 🔥 Lumière douce
  Store.pongScene.add(ambientLight);
  



}

export function animatePong(renderer) {
  if (!Store.pongScene || !cameraCube) return;

  updateCameraPosition();  // 🔄 Mise à jour de la position de la caméra

  // Rendu de la texture du jeu
  renderer.setRenderTarget(renderTarget);
  
  renderer.render(Store.pongScene, cameraCube);
  renderer.setRenderTarget(null);
}
