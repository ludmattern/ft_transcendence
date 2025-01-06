import * as THREE from 'https://esm.sh/three';
import { GLTFLoader } from 'https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js';
import { FlyControls } from 'https://esm.sh/three/examples/jsm/controls/FlyControls.js';
import { CSS3DRenderer, CSS3DObject } from 'https://esm.sh/three/examples/jsm/renderers/CSS3DRenderer.js';
import { EffectComposer } from 'https://esm.sh/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://esm.sh/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://esm.sh/three/examples/jsm/postprocessing/UnrealBloomPass.js';

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
const material = new THREE.MeshStandardMaterial({
  emissive: new THREE.Color(0x050505), 
  emissiveIntensity: 1, 
  color: new THREE.Color(0x050505), 
});

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

function initScene() 
{
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
  camera.lookAt(0, 50, -12);

  const cameraLight = new THREE.PointLight(0Xb0e7ec,  1, 6);
  cameraLight.position.set(0, 5.5, -1.5);
  cameraLight.castShadow = false;
  cameraLight.shadow.bias = -0.005; 
  const pointLightHelper = new THREE.PointLightHelper(cameraLight, 0.1);
  //scene.add(pointLightHelper);
  scene.add(cameraLight);
  cameraLight.shadow.mapSize.width = 1024;
  cameraLight.shadow.mapSize.height = 1024;
  cameraLight.shadow.camera.near =0.5;
  cameraLight.shadow.camera.far = 50; 

  const cameraLight2 = new THREE.PointLight(0Xb0e7ec, 1, 6); 
  cameraLight2.position.set(-3, 3, -1.5);
  cameraLight2.castShadow = false; 
  cameraLight2.shadow.bias = -0.005;
  const pointLightHelper2 = new THREE.PointLightHelper(cameraLight2, 0.1);
  //scene.add(pointLightHelper2);
  scene.add(cameraLight2);
  cameraLight2.shadow.mapSize.width = 1024;
  cameraLight2.shadow.mapSize.height = 1024;
  cameraLight2.shadow.camera.near = 0.5;
  cameraLight2.shadow.camera.far = 50; 

  const cameraLight3 = new THREE.PointLight(0Xb0e7ec, 1, 6); 
  cameraLight3.position.set(3, 3, -1.5);
  cameraLight3.castShadow = false; 
  cameraLight3.shadow.bias = -0.005; 
  const pointLightHelper3 = new THREE.PointLightHelper(cameraLight3, 0.1);
  //scene.add(pointLightHelper3);
  scene.add(cameraLight3);
  cameraLight3.shadow.mapSize.width = 1024;
  cameraLight3.shadow.mapSize.height = 1024;
  cameraLight3.shadow.camera.near = 0.5;
  cameraLight3.shadow.camera.far = 50; 

  scene.add(camera)
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
    console.error('Error on saturn loading :', error);
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


  screenObject1.material = material;
  screenObject2.material = material;
  screenObject3.material = material;
  
  
    loadingScreen.style.display = 'none';
  },
  onProgress,
  (error) => {
    console.error("error on model loading :", error);
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
  sunLight.shadow.camera.far = 20;  
  sunLight.shadow.camera.left = -10;
  sunLight.shadow.camera.right = 10;
  sunLight.shadow.camera.top = 10;
  sunLight.shadow.camera.bottom = -10;
  
  

  scene.add(sunLight);
}


function initControls() {
  controls = new FlyControls(camera, renderer.domElement);
  controls.movementSpeed = 20000;
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

let currentTween = null; 

function animateCameraToTarget(endPosition, endRotation, nb) {
  document.removeEventListener("mousemove", onBaseMouseMove, false);

  if (currentTween) {
    currentTween.kill();
    camera.position.copy(camera.position); 
    camera.quaternion.copy(camera.quaternion); 
  }

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

  const dummy = { t: 0 };
  currentTween = gsap.to(dummy, {
    duration: 2,
    t: 1,
    ease: "power2.inOut",
    onUpdate: () => {
      const t = dummy.t;
      camera.position.lerpVectors(startPosition, endPosition, t);
      camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
    },
    onComplete: () => {
      currentTween = null;
      if (nb == 1) {
        screenObject1.material = screenMaterial;
        menuElement.classList.remove("active");
      }
      if (nb == 2) {
        menuElement2.classList.remove("active");
      }
      if (nb == 3) {
        screenObject3.material = screenMaterial;
        menuElement3.classList.remove("active");
      }
      initialCameraRotation.x = camera.rotation.x;
      initialCameraRotation.y = camera.rotation.y;
      cameraRotation.x = camera.rotation.x;
      cameraRotation.y = camera.rotation.y;
      onScreen = true;
      document.addEventListener("mousemove", onBaseMouseMove, false);
    },
  });
}


export function animateCameraBackToInitialPosition() 
{
  document.removeEventListener("mousemove", onBaseMouseMove, false);

  const startPosition = camera.position.clone();
  const startQuaternion = camera.quaternion.clone();

  const endPosition = new THREE.Vector3(
    0,
    0,
    1.45
  );
  const lookAtTarget = new THREE.Vector3(0, 50, -12);

  camera.position.copy(endPosition);
  camera.lookAt(lookAtTarget);
  const endQuaternion = camera.quaternion.clone();
  if (freeViewEnabled) disableFreeView();
  camera.position.copy(startPosition);
  camera.quaternion.copy(startQuaternion);
  //controls.enabled = false;
  if (menuElement)
  {
    menuElement.classList.add("active");
    screenObject1.material = material;
  }
  if (menuElement2) 
    menuElement2.classList.add("active");
  if (menuElement3) 
  {
    menuElement3.classList.add("active");
  }

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
  //initControls();
  loadModels();
  addEventListeners();
  initialCameraRotation.x = camera.rotation.x;
  initialCameraRotation.y = camera.rotation.y;
  cameraRotation.x = camera.rotation.x;
  cameraRotation.y = camera.rotation.y;

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1,   // intensity
    1,   // radius
    0.2   // threshold
  );
    composer = new EffectComposer(renderer);
    const renderScene = new RenderPass(scene, camera);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    animate();

}

let composer;

const sceneCube = new THREE.Scene();
const cameraCube = new THREE.PerspectiveCamera(25, 1, 0.1, 1000); 
cameraCube.position.z = 7; 
cameraCube.aspect = 636 / 512;
cameraCube.updateProjectionMatrix();
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

const screenMaterial = new THREE.MeshStandardMaterial({
  map: renderTargetCube.texture,
  emissive: 0x000000,
  emissiveIntensity: 0.1,
});
let lastRenderTime = 0;
const targetFPS = 30; 
const frameInterval = 1000 / targetFPS; 

function animate() {
  requestAnimationFrame(animate);

  const currentTime = Date.now();
    meshCube.rotation.x += 0.01;
    meshCube.rotation.y += 0.01;
  if (currentTime - lastRenderTime >= frameInterval) {
    lastRenderTime = currentTime;



    renderer.setRenderTarget(renderTargetCube);
    renderer.render(sceneCube, cameraCube);
    renderer.setRenderTarget(null);
  }

  if (composer) {
    composer.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }

  if (cssRenderer && scene && camera) {
    cssRenderer.render(scene, camera);
  }
}



export function initWireframeScene() {
  const wireframeDiv = document.getElementById('wireframe');
  if (!wireframeDiv) {
    console.error("Div 'wireframe' not fine");
    return;
  }

  const wireframeScene = new THREE.Scene();
  const wireframeCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  const wireframeRenderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  const width = wireframeDiv.offsetWidth;
  const height = wireframeDiv.offsetHeight;
  wireframeRenderer.setSize(width, height);
  wireframeDiv.appendChild(wireframeRenderer.domElement);

  let wireframeModel;

  const loader = new GLTFLoader();
  loader.load(
    "../src/assets/models/sn14.glb",
    (gltf) => {
      wireframeModel = new THREE.Group();

      gltf.scene.traverse((child) => {
        if (child.isMesh) 
        {
          const faceMaterial = new THREE.MeshBasicMaterial({
            color: 0Xffffff,
            transparent: true,
            opacity: 0.2,
          });

          const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x66ccff,
            transparent: true,
			      opacity: 1,
            wireframe: true,
          });

          const faceMesh = child.clone();
          faceMesh.material = faceMaterial;

          const wireframeMesh = child.clone();
          wireframeMesh.material = wireframeMaterial;

          wireframeModel.add(faceMesh);
          wireframeModel.add(wireframeMesh);
        }
      });

      wireframeModel.scale.set(0.1, 0.1, 0.1);
      wireframeModel.rotation.set(Math.PI, 0, 0);
      wireframeModel.position.set(0,0,0);
      wireframeScene.add(wireframeModel);
      wireframeCamera.position.set(0, -60, -60);
	    wireframeCamera.aspect = width / height;
      wireframeCamera.updateProjectionMatrix();
      wireframeCamera.lookAt(wireframeModel.position.x, wireframeModel.position.y - 20, wireframeModel.position.z);
      function animateWireframe()
      {
        requestAnimationFrame(animateWireframe);

        if (wireframeModel) 
        {
          wireframeModel.rotation.z += 0.004;
        }       
        wireframeRenderer.render(wireframeScene, wireframeCamera);
      }
      animateWireframe();
    },
    undefined,
    (error) => {
      console.error("Error on wireframe loading :", error);
    }
  );

  function onWireframeResize() 
  {
    const newWidth = wireframeDiv.offsetWidth;
    const newHeight = wireframeDiv.offsetHeight;
    wireframeRenderer.setSize(newWidth, newHeight);
    wireframeCamera.aspect = newWidth / newHeight;
    wireframeCamera.updateProjectionMatrix();
  }
  window.addEventListener("resize", onWireframeResize);
}
