import * as THREE from 'https://esm.sh/three';
import { GLTFLoader } from 'https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js';
import { FlyControls } from 'https://esm.sh/three/examples/jsm/controls/FlyControls.js';
import { CSS3DRenderer, CSS3DObject } from 'https://esm.sh/three/examples/jsm/renderers/CSS3DRenderer.js';
import { EffectComposer } from 'https://esm.sh/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three/examples/jsm/postprocessing/UnrealBloomPass.js';

/*6h4vl9mc0gk0   lfr8v60tfjk  4h64avzyz1y0   https://tools.wwwtyro.net/space-3d/index.html#animationSpeed=0.8199880281747889&fov=150&nebulae=true&pointStars=true&resolution=1024&seed=6h4vl9mc0gk0&stars=true&sun=false */


function createRectAreaLightHelper(light) 
{
  if (!light.isRectAreaLight) {
      console.error('Provided object is not a RectAreaLight.');
      return null;
  }

  const width = light.width;
  const height = light.height;

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
      -width / 2, -height / 2, 0,
       width / 2, -height / 2, 0,
       width / 2,  height / 2, 0,
      -width / 2,  height / 2, 0,
      -width / 2, -height / 2, 0,
  ]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

  const material = new THREE.LineBasicMaterial({ color: 0xffcc00 });

  const helper = new THREE.Line(geometry, material);

  helper.position.copy(light.position);
  helper.rotation.copy(light.rotation);

  light.add(helper);

  return helper;
}


let scene, camera, renderer, cssRenderer, controls;
let menuObject, menuObject2, menuObject3;
let menuElement, menuElement2, menuElement3;
let onScreen = false;
let screenObject1, screenObject2, screenObject3;
let planet, model;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const saturnConfig = {
  positionX: 3247,
  positionY: 2304,
  positionZ: -3000,
  rotationX: 86,
  rotationY: 12,
  rotationZ: -79,
  scale: 5,
};

function initScene() {
  scene = new THREE.Scene();
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
  );
  camera.position.set(0, 0.06275803512326787, 1.9990151147571098);
  camera.lookAt(0, 50, -15);

  const cameraLight = new THREE.PointLight(0Xb0e7ec,  1.5, 10); // Lumière blanche avec intensité 1
  cameraLight.position.set(0, 6, -1.5);
  cameraLight.castShadow = true; // Active les ombres projetées
  cameraLight.shadow.bias = -0.005; 
  const pointLightHelper = new THREE.PointLightHelper(cameraLight, 0.1);
  //scene.add(pointLightHelper);
  scene.add(cameraLight);
  cameraLight.shadow.mapSize.width = 2048;
  cameraLight.shadow.mapSize.height = 2048;
  cameraLight.shadow.camera.near =0;
  cameraLight.shadow.camera.far = 500; 

  const cameraLight2 = new THREE.PointLight(0Xb0e7ec, 1.5, 10); // Lumière blanche avec intensité 1
  cameraLight2.position.set(-3, 4, -1.5);
  cameraLight2.castShadow = true; // Active les ombres projetées
  cameraLight2.shadow.bias = -0.005; // Réduit les artefacts d'ombre
  const pointLightHelper2 = new THREE.PointLightHelper(cameraLight2, 0.1);
  //scene.add(pointLightHelper2);
  scene.add(cameraLight2);
  cameraLight2.shadow.mapSize.width = 2048;
  cameraLight2.shadow.mapSize.height = 2048;
  cameraLight2.shadow.camera.near = 0;
  cameraLight2.shadow.camera.far = 500; 

  const cameraLight3 = new THREE.PointLight(0Xb0e7ec, 1.5, 10); // Lumière blanche avec intensité 1
  cameraLight3.position.set(3, 4, -1.5);
  cameraLight3.castShadow = true; // Active les ombres projetées
  cameraLight3.shadow.bias = -0.005; // Réduit les artefacts d'ombre
  const pointLightHelper3 = new THREE.PointLightHelper(cameraLight3, 0.1);
  //scene.add(pointLightHelper3);
  scene.add(cameraLight3);
  cameraLight3.shadow.mapSize.width = 2048;
  cameraLight3.shadow.mapSize.height = 2048;
  cameraLight3.shadow.camera.near = 0;
  cameraLight3.shadow.camera.far = 500; 


/*
    const rectLight = new THREE.RectAreaLight(0Xb0e7ec, 3,  3.3, 2 );
    rectLight.position.set(-0.2, 6.4, -1.75);
    rectLight.lookAt( 0, 0, 1 );
    scene.add( rectLight )
   // const rectLightHelper = createRectAreaLightHelper(rectLight);
  //  scene.add(rectLightHelper);

    const rectLight2 = new THREE.RectAreaLight(0Xb0e7ec, 3,  2.5, 2 );
    rectLight2.position.set(-3.6, 4, -1.8);

    rectLight2.lookAt( 0, 0, 1 );
    scene.add( rectLight2 )
    //const rectLightHelper2 = createRectAreaLightHelper(rectLight2);
   // scene.add(rectLightHelper2);

    const rectLight3 = new THREE.RectAreaLight(0Xb0e7ec, 3,  2.5, 2 );
    rectLight3.position.set(3.1, 4.1, -1.85);

    rectLight3.lookAt( 0, 0, 1 );
    scene.add( rectLight3 )
    //const rectLightHelper3 = createRectAreaLightHelper(rectLight3);
    //scene.add(rectLightHelper3);
*/
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x0077ff, roughness: 0.5, metalness: 0.5 });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.castShadow = true;
  sphere.receiveShadow = true; 
  sphere.position.set(0, 0, 0);


  scene.add(camera);

  /*
  const cameraLight = new THREE.PointLight(0Xb0e7ec,  10, 1000); // Lumière blanche avec intensité 1
  cameraLight.position.set(0, 6, 1);
  cameraLight.castShadow = true; // Active les ombres projetées
  cameraLight.shadow.bias = -0.005; 
  const pointLightHelper = new THREE.PointLightHelper(cameraLight, 0.1);
  scene.add(pointLightHelper);
  scene.add(cameraLight);
  cameraLight.shadow.mapSize.width = 2048;
  cameraLight.shadow.mapSize.height = 2048;
  cameraLight.shadow.camera.near =0;
  cameraLight.shadow.camera.far = 500; 
  */
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;

  document.getElementById("app").appendChild(renderer.domElement);
}

function initCSSRenderer() {
  cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = "absolute";
  cssRenderer.domElement.style.top = "0";
  cssRenderer.domElement.style.left = "0";
  cssRenderer.domElement.style.pointerEvents = "none";
  document.getElementById("app").appendChild(cssRenderer.domElement);
}

export function initM2() {
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

export function initM1() {
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

export function initM3() {
  menuElement3 = document.getElementById("menu3");
  menuObject3 = new CSS3DObject(menuElement3);
  menuElement3.style.pointerEvents = "auto";
  menuObject3.position.set(3.1, 4.5, -1.85);
  menuObject3.rotation.set(-5.2, -0.6, -0.2);
  menuObject3.scale.set(0.002, 0.002, 0.002);
  menuElement3.style.display = "none";
  menuElement3.classList.add("active");
}

function initSkybox() {
  const skyboxImages = [
    "/src/assets/img/skybox/right.png",
    "/src/assets/img/skybox/left.png",
    "/src/assets/img/skybox/top.png",
    "/src/assets/img/skybox/bottom.png",
    "/src/assets/img/skybox/front.png",
    "/src/assets/img/skybox/back.png",
  ];

  const loader = new THREE.CubeTextureLoader();
  const skyboxTexture = loader.load(skyboxImages);
  scene.background = skyboxTexture;
}


function loadModels() 
{
  const loadingScreen = document.getElementById("loading-screen");
  const progressBar = document.getElementById("progress-bar");
  loadingScreen.style.display = "block";

  const loader = new GLTFLoader();

  function onProgress(xhr) 
  {
    if (xhr.lengthComputable) {
      const percentComplete = (xhr.loaded / xhr.total) * 100;
      progressBar.style.width = percentComplete + "%";
    }
  }

  const satLoader = new GLTFLoader();
  satLoader.load(
    '../src/assets/models/saturn.glb',
    (gltf) => {
      planet = gltf.scene;
      planet.position.set(saturnConfig.positionX, saturnConfig.positionY, saturnConfig.positionZ);
      planet.rotation.set(
        THREE.MathUtils.degToRad(saturnConfig.rotationX),
        THREE.MathUtils.degToRad(saturnConfig.rotationY),
        THREE.MathUtils.degToRad(saturnConfig.rotationZ)
      );
      planet.scale.set(saturnConfig.scale, saturnConfig.scale, saturnConfig.scale);

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

      scene.add(planet);
    },
    onProgress,
    (error) => {
      console.error('Erreur lors du chargement du modèle Saturn:', error);
    }
  );

  loader.load(
    "../src/assets/models/sn13.glb",
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
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      scene.add(model);

      if (menuObject2) 
        scene.add(menuObject2);
      if (menuObject3) 
        scene.add(menuObject3);
      if (menuObject) 
        scene.add(menuObject);

      screenObject1 = model.getObjectByName("_gltfNode_6");
      screenObject2 = model.getObjectByName("_gltfNode_13");
	  screenObject3 = model.getObjectByName("_gltfNode_7");
      const node0 = model.getObjectByName("_gltfNode_0");
      node0.material.metalness = 0.9;
      node0.material.roughness = 0.9;
		const material = new THREE.MeshStandardMaterial({
		  emissive: new THREE.Color(0x050505), // Couleur blanche émise
		  emissiveIntensity: 1, // Ajuste l'intensité lumineuse
		  color: new THREE.Color(0x050505), // Couleur de base du matériau (ici noir pour voir l'émission)
		});
	  
		screenObject1.material = material;
		screenObject2.material = material;
		screenObject3.material = material;

      loadingScreen.style.display = 'none';
    },
    onProgress,
    (error) => {
      console.error("Erreur lors du chargement du modèle SN6:", error);
    }
  );
}

function initLights() 
{
  const sunLight = new THREE.DirectionalLight(0xffffff, 1);
  sunLight.position.set(-15000, 280210.384550551276, -9601.008032820177);
  sunLight.castShadow = true;
  sunLight.receiveShadow = true
  const target = new THREE.Object3D();
target.position.set(100, 0, -100);
  sunLight.target = target
  sunLight.shadow.camera.near = 0.1; 
  sunLight.shadow.camera.far = 2000000;  
  sunLight.shadow.camera.left = -10;
  sunLight.shadow.camera.right = 10;
  sunLight.shadow.camera.top = 10;
  sunLight.shadow.camera.bottom = -10;
  
  

  scene.add(sunLight);
}


function initControls() {
  controls = new FlyControls(camera, renderer.domElement);
  controls.movementSpeed = 20;
  controls.rollSpeed = Math.PI / 2;
  controls.dragToLook = true;
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  cssRenderer.setSize(width, height);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

export function switchwindow(screen) {
  if (screen === null) {
    animateCameraBackToInitialPosition();
  } else if (screen === "pong") {
    animateCameraToTarget(
      new THREE.Vector3(
        -2.559453657498437,
        3.253545045816075,
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
  } else if (screen === "game") {
    animateCameraToTarget(
      new THREE.Vector3(-0.2, 5.257378802731586, -0.8900580859235202),
      { x: Math.PI / 3, y: 0, z: 0 },
      1
    );
  }
}

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  if (screenObject1 && !onScreen) {
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
          3.253545045816075,
          -0.7922370317858861
        ),
        { x: Math.PI / 3.2, y: Math.PI / 5.5, z: -Math.PI / -12 },
        2
      );
    }
  }
}

function animateCameraToTarget(endPosition, endRotation, nb) {
  document.removeEventListener("mousemove", onBaseMouseMove, false);

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

  //controls.enabled = false;

  const dummy = { t: 0 };
  gsap.to(dummy, {
    duration: 2,
    t: 1,
    ease: "power2.inOut",
    onUpdate: () => {
      const t = dummy.t;
      camera.position.lerpVectors(startPosition, endPosition, t);
      camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
    },
    onComplete: () => {
      //controls.enabled = true;
      if (nb == 1) menuElement.classList.remove("active");
      if (nb == 2) {
        menuElement2.classList.remove("active");
      }
      if (nb == 3) menuElement3.classList.remove("active");

      initialCameraRotation.x = camera.rotation.x;
      initialCameraRotation.y = camera.rotation.y;
      cameraRotation.x = camera.rotation.x;
      cameraRotation.y = camera.rotation.y;
      document.addEventListener("mousemove", onBaseMouseMove, false);
    },
  });
  onScreen = true;
}

export function animateCameraBackToInitialPosition() {
  document.removeEventListener("mousemove", onBaseMouseMove, false);

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
  if (freeViewEnabled) disableFreeView();
  camera.position.copy(startPosition);
  camera.quaternion.copy(startQuaternion);
  //controls.enabled = false;
  if (menuElement) menuElement.classList.add("active");
  if (menuElement2) menuElement2.classList.add("active");
  if (menuElement3) menuElement3.classList.add("active");

  const dummy = { t: 0 };
  gsap.to(dummy, {
    duration: 2,
    t: 1,
    ease: "power2.inOut",
    onUpdate: () => {
      const t = dummy.t;
      camera.position.lerpVectors(startPosition, endPosition, t);
      camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
    },
    onComplete: () => {
      camera.position.copy(endPosition);
      camera.quaternion.copy(endQuaternion);
      onScreen = false;
      initialCameraRotation.x = camera.rotation.x;
      initialCameraRotation.y = camera.rotation.y;
      cameraRotation.x = camera.rotation.x;
      cameraRotation.y = camera.rotation.y;
      document.addEventListener("mousemove", onBaseMouseMove, false);
    },
  });
}

function addEventListeners() {
  window.addEventListener("click", onMouseClick);
  window.addEventListener("resize", onWindowResize);
}

let freeViewEnabled = false;
let cameraRotation = { x: 0, y: 0, z: 0 };
let initialCameraRotation = { x: 0, y: 0, z: 0 };

document.getElementById("free-view").addEventListener("click", () => {
  freeViewEnabled = !freeViewEnabled;
  if (freeViewEnabled) {
    onScreen = true;

    enableFreeView();
  } else {
    onScreen = false;

    disableFreeView();
    animateCameraBackToInitialPosition();
  }
});

//document.addEventListener('mousemove', onBaseMouseMove, false);

function onBaseMouseMove(event) {
  let maxRotationAngle = Math.PI / 3;
  const rotationSpeed = 0.000005;

  const deltaX = event.movementX;
  const deltaY = event.movementY;

  cameraRotation.y -= deltaX * rotationSpeed;
  cameraRotation.x -= deltaY * rotationSpeed;

  cameraRotation.y = THREE.MathUtils.clamp(
    cameraRotation.y,
    initialCameraRotation.y - maxRotationAngle,
    initialCameraRotation.y + maxRotationAngle
  );

  cameraRotation.x = THREE.MathUtils.clamp(
    cameraRotation.x,
    initialCameraRotation.x - maxRotationAngle / 2,
    initialCameraRotation.x + maxRotationAngle / 2
  );

  camera.rotation.set(
    cameraRotation.x,
    cameraRotation.y,
    camera.rotation.z,
    "XYZ"
  );
  camera.updateMatrixWorld(true);
}
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement !== renderer.domElement && freeViewEnabled) {
    freeViewEnabled = false;
    disableFreeView();
    onScreen = false;
    animateCameraBackToInitialPosition();
  }
});

function enableFreeView() {
  initialCameraRotation.x = camera.rotation.x;
  initialCameraRotation.y = camera.rotation.y;
  cameraRotation.x = camera.rotation.x;
  cameraRotation.y = camera.rotation.y;
  renderer.domElement.requestPointerLock();
  menuElement.style.pointerEvents = "none";
  menuElement2.style.pointerEvents = "none";
  menuElement3.style.pointerEvents = "none";

  document.addEventListener("mousemove", onFreeViewMouseMove, false);
}

function disableFreeView() {
  document.exitPointerLock();
  menuElement.style.pointerEvents = "auto";
  menuElement2.style.pointerEvents = "auto";
  menuElement3.style.pointerEvents = "auto";
  document.removeEventListener("mousemove", onFreeViewMouseMove, false);
}

function onFreeViewMouseMove(event) {
  let maxRotationAngle = Math.PI / 3;
  const rotationSpeed = 0.00025;

  const deltaX = event.movementX;
  const deltaY = event.movementY;

  cameraRotation.y -= deltaX * rotationSpeed;
  cameraRotation.x -= deltaY * rotationSpeed;

  cameraRotation.y = THREE.MathUtils.clamp(
    cameraRotation.y,
    initialCameraRotation.y - maxRotationAngle,
    initialCameraRotation.y + maxRotationAngle
  );

  cameraRotation.x = THREE.MathUtils.clamp(
    cameraRotation.x,
    initialCameraRotation.x - maxRotationAngle / 2,
    initialCameraRotation.x + maxRotationAngle / 2
  );

  camera.rotation.set(cameraRotation.x, cameraRotation.y, 0, "XYZ");
  camera.updateMatrixWorld(true);
}

export function buildScene() 
{
  initScene();
  initRenderer();
  initCamera();
  initCSSRenderer();
  initSkybox();
  initLights();
  initControls();
  loadModels();
  addEventListeners();
  initialCameraRotation.x = camera.rotation.x;
  initialCameraRotation.y = camera.rotation.y;
  cameraRotation.x = camera.rotation.x;
  cameraRotation.y = camera.rotation.y;

  
    composer = new EffectComposer(renderer);
    const renderScene = new RenderPass(scene, camera);
    composer.addPass(renderScene);
  
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,   // intensité
      0.5,   // rayon
      0.1   // threshold
    );
    composer.addPass(bloomPass);
}


let composer;

function animate() {
  requestAnimationFrame(animate);
  if (controls) controls.update(0.01);

  if (composer) {
    composer.render(scene, camera);
  }

  if (cssRenderer && scene && camera) cssRenderer.render(scene, camera);
}


buildScene();
animate();