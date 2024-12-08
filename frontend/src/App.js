import * as THREE from '../src/threelibs/three.module.js';
import { FlyControls } from "../src/threelibs/FlyControls.js";
import { GLTFLoader } from "../src/threelibs/GLTFLoader.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "../src/threelibs/CSS3DRenderer.js";

/*6h4vl9mc0gk0   lfr8v60tfjk  4h64avzyz1y0   https://tools.wwwtyro.net/space-3d/index.html#animationSpeed=0.8199880281747889&fov=150&nebulae=true&pointStars=true&resolution=1024&seed=6h4vl9mc0gk0&stars=true&sun=false */

/*----------------------INIT SCENE LOAD ELEMENT-------------------------*/

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);

const cameraLight = new THREE.PointLight(0xf2f2f2, 2, 100);
cameraLight.position.set(0, 0, 0);
camera.add(cameraLight);
scene.add(camera);
camera.position.set(0, 0.06275803512326787, 1.9990151147571098);
camera.lookAt(0, 50, -15);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("app").appendChild(renderer.domElement);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = "absolute";
cssRenderer.domElement.style.top = "0";
cssRenderer.domElement.style.left = "0";
cssRenderer.domElement.style.pointerEvents = "none";

document.getElementById("app").appendChild(cssRenderer.domElement);

let menuElement;  
let menuObject;

export function initM2()
{

  menuElement = document.getElementById("gameScreen");  
  if (!menuElement) {
    console.error("The element with ID 'gameScreen' was not found.");
    return;
  }
  menuObject = new CSS3DObject(menuElement);

  menuElement.style.pointerEvents = "auto";
  menuObject.position.set(-0.2, 6.6, -1.75);
  menuObject.rotation.set(-5.2, 0, 0);

  menuObject.scale.set(0.002, 0.002, 0.002);
  menuElement.style.display = "none";
  menuElement.classList.add("active");

}


let menuElement2;
let menuObject2;

export function initM1() 
{

  menuElement2 = document.getElementById("menu2");
  if (!menuElement2) {
    console.error("The element with ID 'menu2' was not found.");
    return;
  }

  menuObject2 = new CSS3DObject(menuElement2);
  menuObject2.position.set(-3.6, 4.6, -1.8);

  menuObject2.rotation.set(-5.2, 0.63, 0.2);
  menuObject2.scale.set(0.002, 0.002, 0.002);
  menuElement2.style.pointerEvents = "auto";
  menuElement2.classList.add("active");

}




let menuObject3;
let menuElement3;

export function initM3 () {

  menuElement3 = document.getElementById("menu3");
  menuObject3 = new CSS3DObject(menuElement3);
  menuElement3.style.pointerEvents = "auto";
  menuObject3.position.set(3.1, 4.5, -1.85);
  menuObject3.rotation.set(-5.2, -0.6, -0.2);
  menuObject3.scale.set(0.002, 0.002, 0.002);
  menuElement3.style.display = "none";
  menuElement3.classList.add("active");
}



let onScreen = false;
let screenObject1;
let screenObject2;
let screenObject3;

const skyboxImages = [
  "../src/assets/img/skybox/right.png",
  "../src/assets/img/skybox/left.png",
  "../src/assets/img/skybox/top.png",
  "../src/assets/img/skybox/bottom.png",
  "../src/assets/img/skybox/front.png",
  "../src/assets/img/skybox/back.png",
];

const loaderr = new THREE.CubeTextureLoader();
const skyboxTexture = loaderr.load(skyboxImages);

scene.background = skyboxTexture;
let model;

const loader = new GLTFLoader();
document.getElementById("loading-screen").style.display = "block";
loader.load(
  "../src/assets/models/sn5.glb",
  (gltf) => {
    model = gltf.scene;
    model.position.set(3.5, -17, -1);
    model.rotation.set(0, 0, 0);
    model.scale.set(0.125, 0.125, 0.125);
    model.lookAt(0, 1000, -180);

    model.traverse((child) => {
      if (child.isMesh) {
        child.material.color.multiplyScalar(3);
        child.material.metalness = 0.2;
      }
    });
    scene.add(model);

    screenObject1 = model.getObjectByName("_gltfNode_6");
    screenObject2 = model.getObjectByName("_gltfNode_13");
    screenObject3 = model.getObjectByName("_gltfNode_7");
  },
  undefined,
  (error) => {
    console.error("Erreur lors du chargement du modèle:", error);
  }
);

const saturnConfig = {
  positionX: 3247,
  positionY: 2304,
  positionZ: -3000,
  rotationX: 86,
  rotationY: 12,
  rotationZ: -79,
  scale: 5,
};

let planet;
function loadSaturnModel(modelPath, config) {
    const loaderrr = new GLTFLoader();

    loaderrr.load(
        modelPath,
        function (gltf) {
            planet = gltf.scene;

            planet.position.set(config.positionX, config.positionY, config.positionZ);
            planet.rotation.set(
                THREE.MathUtils.degToRad(config.rotationX),
                THREE.MathUtils.degToRad(config.rotationY),
                THREE.MathUtils.degToRad(config.rotationZ)
            );
            planet.scale.set(config.scale, config.scale, config.scale);

            planet.traverse((child) => {
              if (child.isMesh) {
                  const oldMaterial = child.material;
          
                  if (oldMaterial.isGLTFSpecularGlossinessMaterial) {
                      const newMaterial = new THREE.MeshStandardMaterial({
                          map: oldMaterial.map,
                          color: oldMaterial.color,
                          metalness: 0.1,
                          roughness: 0.7,
                          normalMap: oldMaterial.normalMap,
                          emissive: oldMaterial.emissive,
                          emissiveMap: oldMaterial.emissiveMap,
                          emissiveIntensity: oldMaterial.emissiveIntensity,
                          alphaMap: oldMaterial.alphaMap,
                          transparent: oldMaterial.transparent,
                          opacity: oldMaterial.opacity,
                          side: oldMaterial.side,
                          envMap: oldMaterial.envMap,
                          lightMap: oldMaterial.lightMap,
                          lightMapIntensity: oldMaterial.lightMapIntensity,
                      });
                      child.material = newMaterial;
                  }
              }
          });
            scene.add(menuObject2)
            scene.add(menuObject3)
            scene.add(menuObject)

            scene.add(planet);
            document.getElementById('loading-screen').style.display = 'none';
        },
        undefined,
        function (error) {
            console.error('Erreur lors du chargement du modèle :', error);
        }
    );
}

// Charger le modèle
loadSaturnModel('../src/assets/models/saturn.glb', saturnConfig);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(-15000, 280210.384550551276, -9601.008032820177);
sunLight.castShadow = true;

sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 2000;

scene.add(sunLight);

const controls = new FlyControls(camera, renderer.domElement);
controls.movementSpeed = 20;
controls.rollSpeed = Math.PI / 2;
controls.dragToLook = true;

/*----------------------EVENT HANDLER-------------------------*/

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  if (screenObject1 && onScreen == false) {
    const intersects1 = raycaster.intersectObject(screenObject1, true);
    const intersects2 = raycaster.intersectObject(screenObject2, true);
    const intersects3 = raycaster.intersectObject(screenObject3, true);

    if (intersects1.length > 0) {
      animateCameraToTarget(
        new THREE.Vector3(-0.2, 5.257378802731586, -0.8900580859235202),
        { x: Math.PI / 3, y: 0, z: 0 },
        1
      );
    } else if (intersects2.length > 0) {
      animateCameraToTarget(
        new THREE.Vector3(
          1.9765430745879866,
          3.434172967891374,
          -0.9419868064632663
        ),
        { x: Math.PI / 3.2, y: Math.PI / -5.5, z: -Math.PI / 12 },
        3
      );
    } else if (intersects3.length > 0) {
      animateCameraToTarget(
        new THREE.Vector3(
          -2.559453657498437,
          3.3453545045816075,
          -0.7922370317858861
        ),
        { x: Math.PI / 3.2, y: Math.PI / 5.5, z: -Math.PI / -12 },
        2
      );
    }
  }
});

export function switchwindow(screen) {
  if (screen === null) 
    animateCameraBackToInitialPosition();
  else if (screen === "pong") {
    animateCameraToTarget(
      new THREE.Vector3(
        -2.559453657498437,
        3.3453545045816075,
        -0.7922370317858861
      ),
      { x: Math.PI / 3.2, y: Math.PI / 5.5, z: -Math.PI / -12 },
      2
    );
  } else if (screen === "race") {
    animateCameraToTarget(
      new THREE.Vector3(
        1.9765430745879866,
        3.434172967891374,
        -0.9419868064632663
      ),
      { x: Math.PI / 3.2, y: Math.PI / -5.5, z: -Math.PI / 12 },
      3
    );
  }
  else if (screen === "game")
  {
    animateCameraToTarget(
      new THREE.Vector3(-0.2, 5.257378802731586, -0.8900580859235202),
      { x: Math.PI / 3, y: 0, z: 0 },
      1
    );
  }
}

/*----------------------ANIMATON-------------------------*/

function animateCameraToTarget(endPosition, endRotation, nb) {
  const startPosition = camera.position.clone();
  const startQuaternion = camera.quaternion.clone();

  camera.position.copy(endPosition);

  camera.rotation.set(endRotation.x, endRotation.y, endRotation.z, "XYZ");

  const endQuaternion = camera.quaternion.clone();

  camera.position.copy(startPosition);
  camera.quaternion.copy(startQuaternion);

  if (startQuaternion.dot(endQuaternion) < 0) {
    endQuaternion.x *= -1;
    endQuaternion.y *= -1;
    endQuaternion.z *= -1;
    endQuaternion.w *= -1;
  }
  controls.enabled = false;

  const dummy = { t: 0 };
  gsap.to(dummy, {
    duration: 2,
    t: 1,
    ease: "power2.inOut",
    onUpdate: function () {

      const t = dummy.t;
      camera.position.lerpVectors(startPosition, endPosition, t);
      camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
    },
    onComplete: function () {
      controls.enabled = true;
      if (nb == 1) 
        menuElement.classList.remove("active");
      if (nb == 2) 
        menuElement2.classList.remove("active"); 
      if (nb == 3) 
        menuElement3.classList.remove("active"); 

    },
  });

  onScreen = true;
}

function animateCameraBackToInitialPosition() {
  const startPosition = camera.position.clone();
  const startQuaternion = camera.quaternion.clone();

  const endPosition = new THREE.Vector3(
    0,
    0.06275803512326787,
    1.9990151147571098
  );
  const lookAtTarget = new THREE.Vector3(0, 50, -15);

  camera.position.copy(endPosition);
  camera.lookAt(lookAtTarget);
  const endQuaternion = camera.quaternion.clone();

  camera.position.copy(startPosition);
  camera.quaternion.copy(startQuaternion);

  controls.enabled = false;
  menuElement.classList.add("active");
  menuElement2.classList.add("active");     
  menuElement3.classList.add("active");     


  const dummy = { t: 0 };
  gsap.to(dummy, {
    duration: 2,
    t: 1,
    ease: "power2.inOut",
    onUpdate: function () {
      const t = dummy.t;
      camera.position.lerpVectors(startPosition, endPosition, t);
      camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
    },
    onComplete: function () {
      camera.position.copy(endPosition);
      camera.quaternion.copy(endQuaternion);
      controls.enabled = true;

      onScreen = false;
    },
  });
}

document.addEventListener('backButtonClicked', () => {
  console.log('backButtonClicked event received');
  animateCameraBackToInitialPosition();
});
const backButtons = document.querySelectorAll(".back");
backButtons.forEach((button) => {
  button.addEventListener("click", () => {
    console.log('back');
    animateCameraBackToInitialPosition();
  });
});
/*----------------------ANIMATE-------------------------*/

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  camera.updateProjectionMatrix();
});


function animate() {

  requestAnimationFrame(animate);
  controls.update(0.01);
  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
  //   console.log(camera.position.x, camera.position.y, camera.position.z);
}

animate();
