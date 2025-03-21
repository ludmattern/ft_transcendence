import * as THREE from 'https://esm.sh/three';
import { GLTFLoader } from 'https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js';
import { CacheDB } from '/src/utils/IndexedDBCache.js';

export async function initWireframeScene() {
	const wireframeDiv = document.getElementById('wireframe');
	if (!wireframeDiv) {
		return;
	}

	const wireframeScene = new THREE.Scene();
	const wireframeCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
	const wireframeRenderer = new THREE.WebGLRenderer({
		antialias: true,
		alpha: true,
	});

	const width = wireframeDiv.offsetWidth;
	const height = wireframeDiv.offsetHeight;
	wireframeRenderer.setSize(width, height);
	wireframeDiv.appendChild(wireframeRenderer.domElement);

	let wireframeModel;
	const loader = new GLTFLoader();
	const modelUrl = '/src/assets/models/sn14.glb';

	async function loadModelFromIndexedDB() {
		const cachedData = await CacheDB.getFile('models', modelUrl);
		if (cachedData) {
			return new Promise((resolve, reject) => {
				loader.parse(cachedData, '', resolve, reject);
			});
		}
		return null;
	}

	async function loadAndCacheModel() {
		const cachedModel = await loadModelFromIndexedDB();
		if (cachedModel) return cachedModel;

		return new Promise((resolve, reject) => {
			loader.load(
				modelUrl,
				async (gltf) => {
					const response = await fetch(modelUrl);
					const arrayBuffer = await response.arrayBuffer();
					await CacheDB.saveFile('models', modelUrl, arrayBuffer);

					resolve(gltf);
				},
				undefined,
				(error) => reject(`Erreur lors du chargement du modèle 3D: ${modelUrl}, ${error}`)
			);
		});
	}

	try {
		const gltf = await loadAndCacheModel();

		wireframeModel = new THREE.Group();
		gltf.scene.traverse((child) => {
			if (child.isMesh) {
				const faceMaterial = new THREE.MeshBasicMaterial({
					color: 0xffffff,
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
		wireframeModel.position.set(0, 0, 0);
		wireframeScene.add(wireframeModel);

		wireframeCamera.position.set(0, -60, -60);
		wireframeCamera.aspect = width / height;
		wireframeCamera.updateProjectionMatrix();
		wireframeCamera.lookAt(wireframeModel.position.x, wireframeModel.position.y - 20, wireframeModel.position.z);

		function animateWireframe() {
			requestAnimationFrame(animateWireframe);

			if (wireframeModel) {
				wireframeModel.rotation.z += 0.004;
			}
			wireframeRenderer.render(wireframeScene, wireframeCamera);
		}
		animateWireframe();
	} catch (error) {
		console.error('Error while loading Wireframe model :', error);
	}

	function onWireframeResize() {
		const newWidth = wireframeDiv.offsetWidth;
		const newHeight = wireframeDiv.offsetHeight;
		wireframeRenderer.setSize(newWidth, newHeight);
		wireframeCamera.aspect = newWidth / newHeight;
		wireframeCamera.updateProjectionMatrix();
	}
	window.addEventListener('resize', onWireframeResize);
}
