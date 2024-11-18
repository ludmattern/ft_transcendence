import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';
import { FlyControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/FlyControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';
import { CSS3DRenderer, CSS3DObject } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/renderers/CSS3DRenderer.js';


/*----------------------INIT SCENE LOAD ELEMENT-------------------------*/


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    80,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 0, 0);

const lookBehindPosition = new THREE.Vector3(0, 0, 180);
camera.lookAt(lookBehindPosition);



const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
const pixelRatio = window.devicePixelRatio || 1;

const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0';
cssRenderer.domElement.style.left = '0';
cssRenderer.domElement.style.pointerEvents = 'none';

document.getElementById('app').appendChild(cssRenderer.domElement);

const menuElement = document.getElementById('menu');
menuElement.style.pointerEvents = 'auto';

const menuObject = new CSS3DObject(menuElement);

menuObject.position.set(-0.01, -0.30, 0.70);
menuObject.rotation.set(0.49, 3.1, 0);
menuObject.scale.set(0.001, 0.001, 0.001);

const loginElement = document.getElementById('login');

const loginObject = new CSS3DObject(loginElement);

loginObject.position.set(-0.01, 0.04, 0.70); // Ajustez les coordonnées
loginObject.rotation.set(-1.3, 3.1, 0);
loginObject.scale.set(0.001, 0.001, 0.001); // Réduisez la taille si nécessaire
scene.add(loginObject);
loginElement.style.pointerEvents = 'auto';

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
controls.rollSpeed = Math.PI / 2;
controls.dragToLook = true;



/*----------------------EVENT HANDLER-------------------------*/

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

const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {

    animateCameraBackToInitialPosition();
});

const loginButton = document.getElementById('loginButton');
loginButton.addEventListener('click', () => {

    animateCameraBackToInitialPosition();
});

/*----------------------ANIMATON-------------------------*/

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
            camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, progress);
        },
        onComplete: function () 
        {
            camera.position.copy(endPosition);
            camera.quaternion.copy(endQuaternion);
            controls.enabled = true;
            scene.add(menuObject);
        }
    });
    onScreen = true;
}


function animateCameraBackToInitialPosition() {
    const startPosition = camera.position.clone();
    const startQuaternion = camera.quaternion.clone();

    const endPosition = new THREE.Vector3(0, 0, 0);
    const lookBehindPosition = new THREE.Vector3(0, 0, 180);
    camera.position.set(0, 0, 0);
    camera.lookAt(lookBehindPosition);
    const endQuaternion = camera.quaternion.clone();

    camera.position.copy(startPosition);
    camera.quaternion.copy(startQuaternion);

    controls.enabled = false;

    const dummy = { t: 0 };

    gsap.to(dummy, {
        duration: 2,
        t: 1,
        ease: 'power2.inOut',
        onUpdate: function () {
            const t = dummy.t;
            camera.position.lerpVectors(startPosition, endPosition, t);
            camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
        },
        onComplete: function () {
            camera.position.copy(endPosition);
            camera.quaternion.copy(endQuaternion);
            controls.enabled = true;
            scene.remove(menuObject);
            onScreen = false;
            console.log('done');
        }
    });
}



/*----------------------ANIMATE-------------------------*/


window.addEventListener('resize', () => {
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
}

animate();