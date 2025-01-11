import Store from './store.js';
import * as THREE from "https://esm.sh/three";
import { onBaseMouseMove, setCameraRotation } from '/src/3d/freeViewHandler.js';
import { screenMaterial } from '/src/3d/pongScene.js';


// =============== WINDOW SWITCHER ===============

export function switchwindow(screen) {
    if (screen === "pong") {
      animateCameraToTarget(
        new THREE.Vector3(-2.559453657498437, 3.253545045816075, -0.7922370317858861),
        { x: Math.PI / 3.2, y: Math.PI / 5.5, z: -Math.PI / -12 },
        2
      );
    } else if (screen === "race") {
      animateCameraToTarget(
        new THREE.Vector3(1.9765430745879866, 3.434172967891374, -0.9419868064632663),
        { x: Math.PI / 3.2, y: Math.PI / -5.5, z: -Math.PI / 12 },
        3
      );
    } else if (screen === "game") {
      animateCameraToTarget(
        new THREE.Vector3(-0.2, 5.257378802731586, -0.8900580859235202),
        { x: Math.PI / 3, y: 0, z: 0 },
        1
      );
    }
    else if (screen === "home") {
      animateCameraToTarget(
        new THREE.Vector3(0, 0.06275803512326787, 1.9990151147571098),
        { x: 1.2974796345057034, y: 0, z: -0 },
        0
      );
    }
  }
  
  // =============== GSAP ANIMATION ===============
  export function animateCameraToTarget(endPosition, endRotation, nb) {
    document.removeEventListener("mousemove", onBaseMouseMove, false);
  
    const startPosition = Store.camera.position.clone();
    const startQuaternion = Store.camera.quaternion.clone();
  
    Store.camera.position.copy(endPosition);
    Store.camera.rotation.set(endRotation.x, endRotation.y, endRotation.z, "XYZ");
    const endQuaternion = Store.camera.quaternion.clone();
  
    Store.camera.position.copy(startPosition);
    Store.camera.quaternion.copy(startQuaternion);
  
    if (startQuaternion.dot(endQuaternion) < 0) {
      endQuaternion.x *= -1;
      endQuaternion.y *= -1;
      endQuaternion.z *= -1;
      endQuaternion.w *= -1;
    }
  
    const dummy = { t: 0 };
    Store.currentTween = gsap.to(dummy, {
      duration: 2,
      t: 1,
      ease: "power2.inOut",
      onUpdate: () => {
        const t = dummy.t;
        Store.camera.position.lerpVectors(startPosition, endPosition, t);
        Store.camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
        setCameraRotation(Store.camera.rotation.y);
      },
      onComplete: () => {
        Store.currentTween = null;
        if (nb == 1) {
          Store.screenObject1.material = screenMaterial;
          Store.menuElement.classList.remove("active");
        }
        if (nb == 2) {
        //   Store.menuElement2.classList.remove("active");
        }
        if (nb == 3) {
          Store.menuElement3.classList.remove("active");
        }
        Store.initialCameraRotation.x = Store.camera.rotation.x;
        Store.initialCameraRotation.y = Store.camera.rotation.y;
        Store.cameraRotation.x = Store.camera.rotation.x;
        Store.cameraRotation.y = Store.camera.rotation.y;
        Store.onScreen = true;
        document.addEventListener("mousemove", onBaseMouseMove, false);
      },
    });
  }
  
  export function animateCameraBackToInitialPosition() {
    document.removeEventListener("mousemove", onBaseMouseMove, false);

    const startPosition = Store.camera.position.clone();
    const startQuaternion = Store.camera.quaternion.clone();
  
    const endPosition = new THREE.Vector3(0, 0, 1.45);
    const lookAtTarget = new THREE.Vector3(0, 50, -12);
  
    Store.camera.position.copy(endPosition);
    Store.camera.lookAt(lookAtTarget);
    const endQuaternion = Store.camera.quaternion.clone();
  
    if (Store.freeViewEnabled) disableFreeView();
  
    Store.camera.position.copy(startPosition);
    Store.camera.quaternion.copy(startQuaternion);
  
    if (Store.menuElement) {
      Store.menuElement.classList.add("active");
      Store.screenObject1.material = Store.material;
    }
    if (Store.menuElement2) Store.menuElement2.classList.add("active");
    if (Store.menuElement3) Store.menuElement3.classList.add("active");
  
    const dummy = { t: 0 };
    gsap.to(dummy, {
      duration: 2,
      t: 1,
      ease: "power2.inOut",
      onUpdate: () => {
        const t = dummy.t;
        Store.camera.position.lerpVectors(startPosition, endPosition, t);
        Store.camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
        setCameraRotation(Store.camera.rotation.y);
      },
      onComplete: () => {
        Store.camera.position.copy(endPosition);
        Store.camera.quaternion.copy(endQuaternion);
        Store.onScreen = false;
        Store.initialCameraRotation.x = Store.camera.rotation.x;
        Store.initialCameraRotation.y = Store.camera.rotation.y;
        Store.cameraRotation.x = Store.camera.rotation.x;
        Store.cameraRotation.y = Store.camera.rotation.y;
        document.addEventListener("mousemove", onBaseMouseMove, false);
      },
    });
  }