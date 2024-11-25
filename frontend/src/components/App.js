import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';
import { FlyControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/FlyControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';
import { CSS3DRenderer, CSS3DObject } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/renderers/CSS3DRenderer.js';


/*----------------------INIT SCENE LOAD ELEMENT-------------------------*/


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
const cameraLight = new THREE.PointLight(0xffffff, 5, 100); // Crée une lumière ponctuelle
cameraLight.position.set(0.05, 0.08, 0.16); // Position initiale relative à la caméra
camera.add(cameraLight); // Ajoute la lumière à la caméra
scene.add(camera); // Ajoute la caméra (et donc la lumière) à la scène
camera.position.set(0,0,0);
const lookBehindPosition = new THREE.Vector3(0, 0, 180);
camera.lookAt(0, 1000, 0)

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('app').appendChild(renderer.domElement);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

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

menuObject.position.set(-0.2, 6.6, -1.75);
menuObject.rotation.set(-5.2, 0, 0);
menuObject.scale.set(0.002, 0.002, 0.002);
menuElement.style.display = 'none';

scene.add(menuObject);
let onScreen = false;
let screenObject;
const loader = new GLTFLoader();
document.getElementById('loading-screen').style.display = 'block';
loader.load(
    './src/assets/sn2.glb',
    (gltf) => {
        const model = gltf.scene;
        model.position.set(3.5, -17, -1);
        model.scale.set(0.125, 0.125, 0.125);
        model.lookAt(0, 1000, -180)

        scene.add(model);
        screenObject = model.getObjectByName('_gltfNode_13');

    },
    undefined,
    (error) => {
        console.error('Erreur lors du chargement du modèle:', error);
    }
);
document.getElementById('loading-screen').style.display = 'none';
const ambientLight = new THREE.AmbientLight(0x404040, 3);
scene.add(ambientLight);


const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 2400, 0.16);
pointLight.intensity = 1000;
scene.add(pointLight);

const controls = new FlyControls(camera, renderer.domElement);
controls.movementSpeed = 20;
controls.rollSpeed = Math.PI / 2;
controls.dragToLook = true;

function addStars() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;

    const starVertices = [];

    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}

addStars();

function addPlanet(position, texturePath, size) {
    const textureLoader = new THREE.TextureLoader();
    const planetTexture = textureLoader.load(texturePath);

    const planetGeometry = new THREE.SphereGeometry(size, 32, 32);
    const planetMaterial = new THREE.MeshStandardMaterial({
        map: planetTexture,
    });

    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.copy(position);
    scene.add(planet);

    return planet;
}

const planet1 = addPlanet(new THREE.Vector3(80, 100, -80), './src/assets/img/2k_mars.jpg', 100);
const planet2 = addPlanet(new THREE.Vector3(20, 150, 50), './src/assets/img/2k_jupiter.jpg', 8);



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

const backButton = document.getElementById('backButton');
backButton.addEventListener('click', () => {

    animateCameraBackToInitialPosition();
});

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
    console.log(camera.position.x, camera.position.y, camera.position.z);

    if (planet1) {
        planet1.rotation.y += 0.0002;
    }
    if (planet2) {
        planet2.rotation.y += 0.0002;
    }
}

animate();
