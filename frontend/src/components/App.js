import * as THREE from 'https://unpkg.com/three@0.128.0/build/three.module.js';
import { FlyControls } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/controls/FlyControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';
import { CSS3DRenderer, CSS3DObject } from 'https://cdn.skypack.dev/three@0.128.0/examples/jsm/renderers/CSS3DRenderer.js';

/*6h4vl9mc0gk0   lfr8v60tfjk    https://tools.wwwtyro.net/space-3d/index.html#animationSpeed=0.8199880281747889&fov=150&nebulae=true&pointStars=true&resolution=1024&seed=6h4vl9mc0gk0&stars=true&sun=false */

/*----------------------INIT SCENE LOAD ELEMENT-------------------------*/


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1600
);


const cameraLight = new THREE.PointLight(0xf2f2f2, 10, 100);
cameraLight.position.set(0, 0, 0);
camera.add(cameraLight);
scene.add(camera);
camera.position.set(0, 0.06275803512326787, 1.9990151147571098);
camera.lookAt(0, 50, -15)

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

const menuElement2 = document.getElementById('menu2');
menuElement2.style.pointerEvents = 'auto';

const menuObject2 = new CSS3DObject(menuElement2);

menuObject2.position.set(-3.5, 4.5, -1.8);
menuObject2.rotation.set(-5.2, 0.65, 0.2);
menuObject2.scale.set(0.002, 0.002, 0.002);
menuElement2.style.display = 'none';

const menuElement3 = document.getElementById('menu3');
menuElement3.style.pointerEvents = 'auto';

const menuObject3 = new CSS3DObject(menuElement3);

menuObject3.position.set(3.1, 4.5, -1.85);
menuObject3.rotation.set(-5.2, -0.60, -0.2);
menuObject3.scale.set(0.002, 0.002, 0.002);
menuElement3.style.display = 'none';

let onScreen = false;
let screenObject1;
let screenObject2;
let screenObject3;

const skyboxImages = [
    'src/assets/img/skybox3/right.png',
    'src/assets/img/skybox3/left.png',
    'src/assets/img/skybox3/top.png',
    'src/assets/img/skybox3/bottom.png',
    'src/assets/img/skybox3/front.png',
    'src/assets/img/skybox3/back.png'
];

const loaderr = new THREE.CubeTextureLoader();
const skyboxTexture = loaderr.load(skyboxImages);

scene.background = skyboxTexture;

const loader = new GLTFLoader();
document.getElementById('loading-screen').style.display = 'block';
loader.load(
    './src/assets/sn2.glb',
    (gltf) => {
        const model = gltf.scene;
        model.position.set(3.5, -17, -1);
        model.rotation.set(0,0,0);
        model.scale.set(0.125, 0.125, 0.125);
        model.lookAt(0, 1000, -180)

        scene.add(model);
        
        screenObject1 = model.getObjectByName('_gltfNode_6');
        screenObject2 = model.getObjectByName('_gltfNode_13');
        screenObject3 = model.getObjectByName('_gltfNode_7');
        document.getElementById('loading-screen').style.display = 'none';


    },
    undefined,
    (error) => {
        console.error('Erreur lors du chargement du modèle:', error);
    }
);




const pointLight = new THREE.PointLight(0xffffff, 1.5, 1000);
pointLight.position.set(0, 750, -160);
scene.add(pointLight);

const controls = new FlyControls(camera, renderer.domElement);
controls.movementSpeed = 20;
controls.rollSpeed = Math.PI / 2;
controls.dragToLook = true;


function addPlanet(position, texturePath, size, ringOptions) {
    const textureLoader = new THREE.TextureLoader();

    const planetTexture = textureLoader.load(texturePath);
    const planetGeometry = new THREE.SphereGeometry(size, 64, 64);
    const planetMaterial = new THREE.MeshStandardMaterial({
        map: planetTexture,
    });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);

    const planetGroup = new THREE.Group();
    planetGroup.add(planet);

    if (ringOptions) 
        {
        const ringGeometry = new THREE.RingGeometry(
            ringOptions.innerRadius,
            ringOptions.outerRadius,
            ringOptions.thetaSegments
        );
        ringGeometry.rotateX(Math.PI / 2);

        const ringTexture = textureLoader.load(ringOptions.texturePath);
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: ringOptions.opacity || 0.8
        });

        const ring = new THREE.Mesh(ringGeometry, ringMaterial);

        ring.rotation.x = Math.PI / 2 + 0.6;
        planetGroup.add(ring);

    }

    planetGroup.position.copy(position);
    scene.add(planetGroup);

    return planetGroup;
}


addPlanet(
    new THREE.Vector3(750, 400, -360), 
    './src/assets/img/2k_jupiter.jpg', 
    500, 
    {
        innerRadius: 600, 
        outerRadius: 850, 
        thetaSegments: 64,
        texturePath: './src/assets/img/uranusringcolour.jpg', 
        opacity: 0.2 
    }
);



/*----------------------EVENT HANDLER-------------------------*/

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (screenObject1 && onScreen == false) 
    {
        const intersects1 = raycaster.intersectObject(screenObject1, true);
        const intersects2 = raycaster.intersectObject(screenObject2, true);
        const intersects3 = raycaster.intersectObject(screenObject3, true);

        if (intersects1.length > 0) 
        {
            animateCameraToTarget(
                new THREE.Vector3(-0.2, 5.257378802731586, -0.8900580859235202),
                { x: Math.PI / 3, y: 0, z: 0 },
                1
            );}
        else if (intersects2.length > 0) 
        {
            animateCameraToTarget(
                new THREE.Vector3(1.9765430745879866, 3.434172967891374, -0.9419868064632663),
                { x: Math.PI / 3.5, y: Math.PI / -4.5, z: -Math.PI / 9},
                3
            );}
        else if (intersects3.length > 0) 
        {
            animateCameraToTarget(
                new THREE.Vector3(-2.559453657498437, 3.3453545045816075, -0.7922370317858861),
                { x: Math.PI / 3.5, y: Math.PI / 5, z: -Math.PI / -10},
                2
        );}
    }
});
/*----------------------ANIMATON-------------------------*/

function animateCameraToTarget(endPosition, endRotation, nb) 
{
    const startPosition = camera.position.clone();
    const startQuaternion = camera.quaternion.clone();

    camera.position.copy(endPosition);

    camera.rotation.set(endRotation.x, endRotation.y, endRotation.z, 'XYZ');

    const endQuaternion = camera.quaternion.clone();

    camera.position.copy(startPosition);
    camera.quaternion.copy(startQuaternion);

    if (startQuaternion.dot(endQuaternion) < 0) 
    {
        endQuaternion.x *= -1;
        endQuaternion.y *= -1;
        endQuaternion.z *= -1;
        endQuaternion.w *= -1;
    }
    controls.enabled = false;

    const dummy = { t: 0 };

    gsap.to(dummy, {
        duration: 2,
        t: 1,
        ease: "power2.inOut",
        onUpdate: function () {
            const t = dummy.t;
            camera.position.lerpVectors(startPosition, endPosition, t);
            camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
        },
        onComplete: function () 
        {
            controls.enabled = true;
            if (nb == 1)
                scene.add(menuObject);
            else if (nb == 2)
                scene.add(menuObject2);
            else if (nb == 3)
                scene.add(menuObject3);
        }
    });

    onScreen = true;
}



function animateCameraBackToInitialPosition() {
    const startPosition = camera.position.clone();
    const startQuaternion = camera.quaternion.clone(); 

    const endPosition = new THREE.Vector3(0, 0.06275803512326787, 1.9990151147571098); 
    const lookAtTarget = new THREE.Vector3(0, 50, -15);


    camera.position.copy(endPosition);
    camera.lookAt(lookAtTarget);
    const endQuaternion = camera.quaternion.clone();

    camera.position.copy(startPosition);
    camera.quaternion.copy(startQuaternion);

    controls.enabled = false;

    const dummy = { t: 0 };
    gsap.to(dummy, {
        duration: 2,
        t: 1,
        ease: 'power2.inOut',
        onUpdate: function () 
        {
            const t = dummy.t;
            camera.position.lerpVectors(startPosition, endPosition, t);
            camera.quaternion.slerpQuaternions(startQuaternion, endQuaternion, t);
        },
        onComplete: function () 
        {
            camera.position.copy(endPosition);
            camera.quaternion.copy(endQuaternion);
            controls.enabled = true;
        
            scene.remove(menuObject);
            scene.remove(menuObject2);
            scene.remove(menuObject3);
            onScreen = false;
        }
    });
}

const backButtons = document.querySelectorAll('.back');
backButtons.forEach((button) => {
    button.addEventListener('click', () => {
        animateCameraBackToInitialPosition(); 
    });
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
}


animate();
