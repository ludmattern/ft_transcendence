import { GLTFLoader } from 'https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js';
import { CacheDB } from '/src/utils/IndexedDBCache.js';

class ModelCacheClass {
	constructor() {
		this.models = new Map();
		this.loader = new GLTFLoader();
	}

	async loadModel(url) {
		// Vérifie si le modèle est en mémoire vive
		if (this.models.has(url)) {
			return this.models.get(url).clone();
		}

		// Vérifie si le modèle est en IndexedDB
		const cachedData = await CacheDB.getFile('models', url);
		if (cachedData) {
			return this.loadModelFromBuffer(cachedData, url);
		}

		// Télécharge le modèle si non trouvé
		return this.loadModelFromNetwork(url);
	}

	async loadModelFromBuffer(buffer, url) {
		return new Promise((resolve, reject) => {
			this.loader.parse(
				buffer,
				'',
				(gltf) => {
					this.models.set(url, gltf.scene);
					resolve(gltf.scene.clone());
				},
				reject
			);
		});
	}

	async loadModelFromNetwork(url) {
		return new Promise((resolve, reject) => {
			this.loader.load(
				url,
				async (gltf) => {
					this.models.set(url, gltf.scene);
					const response = await fetch(url);
					const arrayBuffer = await response.arrayBuffer();
					await CacheDB.saveFile('models', url, arrayBuffer); // Utilise saveFile

					resolve(gltf.scene.clone());
				},
				undefined,
				(error) => reject(`Erreur de chargement du modèle 3D: ${url}, ${error}`)
			);
		});
	}
}

export const ModelCache = new ModelCacheClass();
