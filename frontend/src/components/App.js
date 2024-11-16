import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';
import { FlyControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/FlyControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0);
const lookBehindPosition = new THREE.Vector3(0, 0, 180);
camera.lookAt(lookBehindPosition);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));


let onScreen = false;
let screenObject;
const loader = new GLTFLoader();
loader.load(
    './src/assets/models/cockpit/cockpit.glb',
    (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
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

const controls = new FlyControls(camera, renderer.domElement);
controls.movementSpeed = 10;
controls.rollSpeed = Math.PI / 24;
controls.dragToLook = true;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (screenObject && onScreen == false) 
    {
        const intersects = raycaster.intersectObject(screenObject, true);
        if (intersects.length > 0) {
            animateCameraToTarget();
        }
    }
});

function animateCameraToTarget() 
{
    const endPosition = new THREE.Vector3(0, -0.2500000987201895, 0.5399999812245369);
    const startQuaternion = camera.quaternion.clone();
    camera.lookAt(endPosition);
    const endQuaternion = camera.quaternion.clone();

    camera.quaternion.copy(startQuaternion);
    controls.enabled = false;

    gsap.to(camera.position, {
        duration: 2,
        x: endPosition.x,
        y: endPosition.y,
        z: endPosition.z,
        ease: "power2.inOut",
        onUpdate: function () {
            const progress = this.progress();
            THREE.Quaternion.slerp(startQuaternion, endQuaternion, camera.quaternion, progress);
        },
        onComplete: function () 
        {
            camera.position.copy(endPosition);
            camera.quaternion.copy(endQuaternion);
            controls.enabled = true;
        }
    });

    onScreen = true;
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

function animate() {
    requestAnimationFrame(animate);
    controls.update(0.01);
    renderer.render(scene, camera);
}

animate();
