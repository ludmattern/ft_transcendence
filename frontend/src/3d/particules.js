import * as THREE from 'https://esm.sh/three';
import Store from './store.js';

const PARTICLE_COUNT     = 500;	
const PARTICLE_SPEED     = 25;
const SPAWN_DISTANCE_MIN = 0;
const SPAWN_DISTANCE_MAX = 150;
const VOLUME_WIDTH       = 150;
const VOLUME_HEIGHT      = 80;
const H_REINIT_DISTANCE  = 8;

const hPoint = new THREE.Vector3(
  -0.0010240999876032283,
  3.66151538083604,
  0.383484349790762
);

let particleSystem;
let particlePositions, particleVelocities;
let forward, right, up, spaceshipPos;

function initParticles() {
  if (!Store.model) {
    console.error("Le modèle SN13 n'est pas chargé !");
    return;
  }

  spaceshipPos = Store.model.position.clone();

  forward = new THREE.Vector3();
  Store.model.getWorldDirection(forward);

  const worldUp = new THREE.Vector3(0, 1, 0);
  right = new THREE.Vector3().crossVectors(forward, worldUp).normalize();
  up = new THREE.Vector3().crossVectors(right, forward).normalize();

  const velocity = forward.clone().negate().multiplyScalar(PARTICLE_SPEED);

  particlePositions  = new Float32Array(PARTICLE_COUNT * 3);
  particleVelocities = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const d       = SPAWN_DISTANCE_MIN + Math.random() * (SPAWN_DISTANCE_MAX - SPAWN_DISTANCE_MIN);
    const offsetX = (Math.random() - 0.5) * VOLUME_WIDTH;
    const offsetY = (Math.random() - 0.5) * VOLUME_HEIGHT;

    const pos = new THREE.Vector3()
      .copy(spaceshipPos)
      .add(forward.clone().multiplyScalar(d))
      .add(right.clone().multiplyScalar(offsetX))
      .add(up.clone().multiplyScalar(offsetY));

    particlePositions[i * 3]     = pos.x;
    particlePositions[i * 3 + 1] = pos.y;
    particlePositions[i * 3 + 2] = pos.z;

    particleVelocities[i * 3]     = velocity.x;
    particleVelocities[i * 3 + 1] = velocity.y;
    particleVelocities[i * 3 + 2] = velocity.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

  const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
  particleSystem = new THREE.Points(geometry, material);
  
  Store.scene.add(particleSystem);
}

function updateParticles(delta) {
  if (!particleSystem) return;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const currentPos = new THREE.Vector3(
      particlePositions[i * 3],
      particlePositions[i * 3 + 1],
      particlePositions[i * 3 + 2]
    );

    const velocityVec = new THREE.Vector3(
      particleVelocities[i * 3],
      particleVelocities[i * 3 + 1],
      particleVelocities[i * 3 + 2]
    );

    const predictedPos = currentPos.clone().add(velocityVec.clone().multiplyScalar(delta));

    const d = predictedPos.clone().sub(spaceshipPos).dot(forward);

    if (d < SPAWN_DISTANCE_MIN || predictedPos.distanceTo(hPoint) < H_REINIT_DISTANCE) {
      const newD       = SPAWN_DISTANCE_MIN + Math.random() * (SPAWN_DISTANCE_MAX - SPAWN_DISTANCE_MIN);
      const offsetX    = (Math.random() - 0.5) * VOLUME_WIDTH;
      const offsetY    = (Math.random() - 0.5) * VOLUME_HEIGHT;

      const newPos = new THREE.Vector3()
        .copy(spaceshipPos)
        .add(forward.clone().multiplyScalar(newD))
        .add(right.clone().multiplyScalar(offsetX))
        .add(up.clone().multiplyScalar(offsetY));

      particlePositions[i * 3]     = newPos.x;
      particlePositions[i * 3 + 1] = newPos.y;
      particlePositions[i * 3 + 2] = newPos.z;
    } else {
      particlePositions[i * 3]     = predictedPos.x;
      particlePositions[i * 3 + 1] = predictedPos.y;
      particlePositions[i * 3 + 2] = predictedPos.z;
    }
  }

  particleSystem.geometry.attributes.position.needsUpdate = true;
}

export { initParticles, updateParticles };
