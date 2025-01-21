import * as THREE from "https://esm.sh/three";
import { GLTFLoader } from "https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js";
import Store from './store.js';
import { CacheDB } from "/src/utils/IndexedDBCache.js";

export async function loadModels() {

	const loader = new GLTFLoader();

	function onProgress(xhr) {
		if (xhr.lengthComputable) {
			const percentComplete = (xhr.loaded / xhr.total) * 100;
		}
	}

	async function loadModelFromIndexedDB(url) {
		const cachedData = await CacheDB.getFile("models", url);
		if (cachedData) {
			console.debug(`Chargement du modèle depuis IndexedDB: ${url}`);
			return new Promise((resolve, reject) => {
				loader.parse(cachedData, "", resolve, reject);
			});
		}
		return null;
	}

	async function loadAndCacheModel(url) {
		const cachedModel = await loadModelFromIndexedDB(url);
		if (cachedModel) return cachedModel;

		return new Promise((resolve, reject) => {
			loader.load(
				url,
				async (gltf) => {
					console.debug(`Modèle téléchargé depuis le réseau: ${url}`);

					const response = await fetch(url);
					const arrayBuffer = await response.arrayBuffer();
					await CacheDB.saveFile("models", url, arrayBuffer);

					resolve(gltf);
				},
				onProgress,
				(error) => reject(`Erreur lors du chargement du modèle 3D: ${url}, ${error}`)
			);
		});
	}

  try {
    // Charger les modèles en parallèle
    const [gltfSaturn, gltfSN13] = await Promise.all([
      loadAndCacheModel("/src/assets/models/saturn.glb"),
      loadAndCacheModel("/src/assets/models/sn13.glb")
    ]);

    // Configurer Saturn
    Store.planet = gltfSaturn.scene;
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
    Store.scene.add(Store.planet);
    console.log("Modèle Saturn chargé et ajouté à la scène !");

    // Configurer SN13
    Store.model = gltfSN13.scene;
    Store.model.position.set(3.5, -17, -1);
    Store.model.rotation.set(0, 0, 0);
    Store.model.scale.set(0.125, 0.125, 0.125);
    Store.model.lookAt(0, 1000, -180);

    Store.model.traverse((child) => {
      if (child.isMesh) {
        child.material.color.multiplyScalar(3);
        child.material.metalness = 0.2;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });


		Store.scene.add(Store.model);


		Store.screenObject1 = Store.model.getObjectByName("_gltfNode_6");
		Store.screenObject2 = Store.model.getObjectByName("_gltfNode_13");
		Store.screenObject3 = Store.model.getObjectByName("_gltfNode_7");
		const node0 = Store.model.getObjectByName("_gltfNode_0");
		node0.material.metalness = 0.9;
		node0.material.roughness = 0.9;

		Store.screenObject1.material = Store.material;
		Store.screenObject2.material = Store.material;
		Store.screenObject3.material = Store.material;
		console.log("Modèle SN13 chargé et ajouté à la scène !");
	} catch (error) {
		console.error("Erreur lors du chargement du modèle SN13 :", error);
	}

}
