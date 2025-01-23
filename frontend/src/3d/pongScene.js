import * as THREE from "https://esm.sh/three";

const sceneCube = new THREE.Scene();
const cameraCube = new THREE.PerspectiveCamera(25, 636 / 512, 0.1, 1000);
cameraCube.position.z = 7;

const geometryCube = new THREE.BoxGeometry(1, 1, 1);
const materialCube = new THREE.MeshPhongMaterial({
  color: 0xff0000,
  emissive: 0xff0000,
  emissiveIntensity: 0.5,
  shininess: 100
});
const meshCube = new THREE.Mesh(geometryCube, materialCube);
sceneCube.add(meshCube);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 5, 5);
sceneCube.add(ambientLight, pointLight);

const renderTargetCube = new THREE.WebGLRenderTarget(1024, 1024, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  type: THREE.UnsignedByteType
});

export const screenMaterial = new THREE.MeshStandardMaterial({
  map: renderTargetCube.texture,
  emissive: 0x000000,
  emissiveIntensity: 0.1,
});

export function animatePong(renderer) {
  meshCube.rotation.x += 0.01 * Math.sin(Date.now() * 0.001);
  meshCube.rotation.y += 0.01 * Math.cos(Date.now() * 0.001);


  meshCube.position.x = cubePosition.x;
  meshCube.position.y = cubePosition.y;

  materialCube.emissiveIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.002);
  materialCube.needsUpdate = true;

  renderer.setRenderTarget(renderTargetCube);
  renderer.render(sceneCube, cameraCube);
  renderer.setRenderTarget(null);
}







const socket = new WebSocket("ws://localhost:3004/ws/pong/");

let cubePosition = { x: 0, y: 0 };

socket.onopen = () => {
  console.log("WebSocket connected");
};

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