import * as THREE from "https://esm.sh/three";
import { GLTFLoader } from "https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js";
import Store from './store.js';

// =============== LOADS MODELS ===============

export function loadModels() {
    const loadingScreen = document.getElementById("loading-screen");
    const progressBar = document.getElementById("progress-bar");
    loadingScreen.style.display = "block";
  
    const loader = new GLTFLoader();
  
    function onProgress(xhr) {
      if (xhr.lengthComputable) {
        const percentComplete = (xhr.loaded / xhr.total) * 100;
        progressBar.style.width = percentComplete + "%";
      }
    }
  
    const satLoader = new GLTFLoader();
    satLoader.load(
      "/src/assets/models/saturn.glb",
      (gltf) => {
        Store.planet = gltf.scene;
        Store.planet.position.set(
          Store.saturnConfig.positionX,
          Store.saturnConfig.positionY,
          Store.saturnConfig.positionZ
        );
        Store.planet.rotation.set(
          THREE.MathUtils.degToRad(Store.saturnConfig.rotationX),
          THREE.MathUtils.degToRad(Store.saturnConfig.rotationY),
          THREE.MathUtils.degToRad(Store.saturnConfig.rotationZ)
        );
        Store.planet.scale.set(
          Store.saturnConfig.scale,
          Store.saturnConfig.scale,
          Store.saturnConfig.scale
        );
        Store.planet.traverse((child) => {
          if (child.isMesh) {
            const oldMaterial = child.material;
            // Conversion potentiel d'un GLTFSpecularGlossinessMaterial
            if (oldMaterial.isGLTFSpecularGlossinessMaterial) {
              child.material = new THREE.MeshStandardMaterial({
                map: oldMaterial.map,
              });
            }
          }
        });
        Store.scene.add(Store.planet);
      },
      onProgress,
      (error) => {
        console.error("Error on saturn loading :", error);
      }
    );
  
    loader.load(
      "/src/assets/models/sn15/untitled.gltf",
      (gltf) => {
        Store.model = gltf.scene;
        Store.model.position.set(3.5, -17, -1);
        Store.model.rotation.set(0, 0, 0);
        Store.model.scale.set(0.125, 0.125, 0.125);
        Store.model.lookAt(0, 1000, -180);
  
        Store.model.traverse((child) => {
          //console.log(child.name, child);
         
          
          if (child.isMesh) {

            child.material.color.multiplyScalar(3);
            child.material.metalness = 0.2;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        Store.scene.add(Store.model);
  
        if (Store.menuObject2) Store.scene.add(Store.menuObject2);
        if (Store.menuObject3) Store.scene.add(Store.menuObject3);
        if (Store.menuObject) Store.scene.add(Store.menuObject);
  
        Store.screenObject1 = Store.model.getObjectByName("_gltfNode_6");
        Store.screenObject2 = Store.model.getObjectByName("_gltfNode_13");
        Store.screenObject3 = Store.model.getObjectByName("_gltfNode_7");
        const node0 = Store.model.getObjectByName("_gltfNode_0");
        node0.material.metalness = 0.9;
        node0.material.roughness = 0.9;
  
        Store.screenObject1.material = Store.material;
        Store.screenObject2.material = Store.material;
        Store.screenObject3.material = Store.material;
  
        loadingScreen.style.display = "none";
      },
      onProgress,
      (error) => {
        console.error("error on model loading :", error);
      }
    );
  }