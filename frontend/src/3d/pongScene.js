import * as THREE from "https://esm.sh/three";

const sceneCube = new THREE.Scene();
const cameraCube = new THREE.PerspectiveCamera(25, 636 / 512, 0.1, 1000);
cameraCube.position.z = 7;

const geometryCube = new THREE.BoxGeometry(1, 1, 1);
const materialCube = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  emissive: 0xff0000,
  emissiveIntensity: 1,
});
const meshCube = new THREE.Mesh(geometryCube, materialCube);
sceneCube.add(meshCube);

sceneCube.add(new THREE.AmbientLight(0xffffff, 1));

const renderTargetCube = new THREE.WebGLRenderTarget(1024, 1024, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
});

export const screenMaterial = new THREE.MeshStandardMaterial({
  map: renderTargetCube.texture,
  emissive: 0x000000,
  emissiveIntensity: 0.1,
});

export function animatePong(renderer) 
{
  meshCube.rotation.x += 0.01;
  meshCube.rotation.y += 0.01;

  renderer.setRenderTarget(renderTargetCube);
  renderer.render(sceneCube, cameraCube);
  renderer.setRenderTarget(null);
}
