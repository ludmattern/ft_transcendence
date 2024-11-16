import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, -5);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Limiter le ratio de pixels pour améliorer les perfs

let screenObject;
const loader = new GLTFLoader();
loader.load(
    './src/assets/models/cockpit.glb',
    (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, -4.5);
        scene.add(model);
        screenObject = model.getObjectByName('screen_screen2_0');
    },
    undefined,
    (error) => {
        console.error('Erreur lors du chargement du modèle:', error);
    }
);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.minDistance = 1;
controls.maxDistance = 500;
controls.target.set(0, 1, 0);
controls.update();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (screenObject) {
        const intersects = raycaster.intersectObject(screenObject, true);
        if (intersects.length > 0) 
        {
            animateCameraToTarget(intersects[0].point);
        }
    }
});

function animateCameraToTarget(targetPosition) {
    const endPosition = new THREE.Vector3(-0.012959686097734124, -0.34696102939839973, -3.9871320087430786);
    gsap.to(camera.position, {
        duration: 2,
        x: endPosition.x,
        y: endPosition.y,
        z: endPosition.z,
        ease: "power2.inOut",
    });
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();
