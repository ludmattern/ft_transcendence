import * as THREE from "https://esm.sh/three";
import Store from './store.js';

let aspectRatio;

export const renderTargetP1 = new THREE.WebGLRenderTarget(2048, 1024, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  type: THREE.UnsignedByteType
});

export const renderTargetP2 = new THREE.WebGLRenderTarget(2048, 1024, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  type: THREE.UnsignedByteType
});

export let cameraPlayer1, cameraPlayer2, screenMesh;

export let screenMaterial = new THREE.ShaderMaterial({
  uniforms: {
    textureP1: { value: renderTargetP1.texture },
    textureP2: { value: renderTargetP2.texture }
  },
  vertexShader: ``,
  fragmentShader: ``
});

const shaders = {
  local: {
    vertex: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform sampler2D textureP1;
      uniform sampler2D textureP2;
      varying vec2 vUv;

      void main() {
        vec4 color;
        if (vUv.x < 0.5) {
          color = texture2D(textureP1, vec2(vUv.x * 2.0, vUv.y));
        } else {
          color = texture2D(textureP2, vec2((vUv.x - 0.5) * 2.0, vUv.y));
        }
        gl_FragColor = color;
      }
    `
  },
  matchmaking: {
    vertex: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragment: `
      uniform sampler2D textureP1;
      varying vec2 vUv;

      void main() {
        gl_FragColor = texture2D(textureP1, vUv);
      }
    `
  }
};






export let cameraCube;

export function buildGameScene(gameConfig) {
  Store.gameConfig = gameConfig; 

  if (Store.pongScene) {
    Store.pongScene.clear();
  } else {
    Store.pongScene = new THREE.Scene();
  }

  if (gameConfig.mode === "local") {
    aspectRatio = 1;

    cameraPlayer1 = new THREE.PerspectiveCamera(30, aspectRatio, 0.1, 1000);
    cameraPlayer1.position.set(0, 0, -12);
    cameraPlayer1.lookAt(0, 0, 0);

    cameraPlayer2 = new THREE.PerspectiveCamera(30, aspectRatio, 0.1, 1000);
    cameraPlayer2.position.set(0, 0, 12);
    cameraPlayer2.lookAt(0, 0, 0);

    // Applique le shader split-screen
    screenMaterial.vertexShader = shaders.local.vertex;
    screenMaterial.fragmentShader = shaders.local.fragment;
    screenMaterial.needsUpdate = true;

    cameraPlayer1.aspect = aspectRatio;
    cameraPlayer1.updateProjectionMatrix();

    cameraPlayer2.aspect = aspectRatio;
    cameraPlayer2.updateProjectionMatrix();

  } else if (gameConfig.mode === "matchmaking") {
    aspectRatio = 2;

    cameraPlayer1 = new THREE.PerspectiveCamera(25, aspectRatio, 0.01, 1000);
    cameraPlayer1.position.set(0, 0, 12);
    cameraPlayer1.lookAt(0, 0, 0);

    screenMaterial.vertexShader = shaders.matchmaking.vertex;
    screenMaterial.fragmentShader = shaders.matchmaking.fragment;
    screenMaterial.needsUpdate = true;
  }

  const screenGeometry = new THREE.PlaneGeometry(2, 1);
  screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
  screenMesh.position.set(0, 1, -2);
  Store.pongScene.add(screenMesh);



  cameraCube = new THREE.PerspectiveCamera(25, aspectRatio, 0.01, 1000); 
  cameraCube.position.z = 7;



const sideWallMaterial = new THREE.MeshStandardMaterial({
  color: 0x444444,
  side: THREE.DoubleSide,
  transparent: true, 
  opacity: 0.5, 
});

const floorCeilingMaterial = new THREE.MeshStandardMaterial({
  color: 0x333333,
  side: THREE.DoubleSide,
  transparent: true, 
  opacity: 0.7,
});

const endWallMaterial = new THREE.MeshStandardMaterial({
  color: 0x222222,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.8,
});

  const tunnelWidth = 10;  
  const tunnelHeight = 6;  
  const tunnelDepth = 8;  
  
  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(tunnelDepth, tunnelHeight),
    sideWallMaterial
  );
  leftWall.position.set(-tunnelWidth / 2, 0, 0);
  leftWall.rotation.y = Math.PI / 2;
  
  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(tunnelDepth, tunnelHeight),
    sideWallMaterial
  );
  rightWall.position.set(tunnelWidth / 2, 0, 0);
  rightWall.rotation.y = -Math.PI / 2;
  
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(tunnelWidth, tunnelDepth),
    floorCeilingMaterial
  );
  ceiling.position.set(0, tunnelHeight / 2, 0);
  ceiling.rotation.x = Math.PI / 2;
  
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(tunnelWidth, tunnelDepth),
    floorCeilingMaterial
  );
  floor.position.set(0, -tunnelHeight / 2, 0);
  floor.rotation.x = -Math.PI / 2;
  
  const frontWall = new THREE.Mesh(
    new THREE.PlaneGeometry(tunnelWidth, tunnelHeight),
    endWallMaterial
  );
  frontWall.position.set(0, 0, -tunnelDepth / 2);
  
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(tunnelWidth, tunnelHeight),
    endWallMaterial
  );
  backWall.position.set(0, 0, tunnelDepth / 2);
  backWall.rotation.y = Math.PI;
  
  //Store.pongScene.add(leftWall);
  //Store.pongScene.add(rightWall);
  Store.pongScene.add(ceiling);
  Store.pongScene.add(floor);
  Store.pongScene.add(frontWall);
  Store.pongScene.add(backWall);
  
  


  const paddleGeometry = new THREE.BoxGeometry(1, 1, 1);
  const paddleMaterial = new THREE.MeshStandardMaterial({
    color: 0x00ff00, 
    opacity: 0.2,
    transparent: true  
  });
  
  Store.player1Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
  Store.player1Paddle.position.set(-6, -2, 0); 
  Store.pongScene.add(Store.player1Paddle);

  Store.player2Paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
  Store.player2Paddle.position.set(6, -2, 0); 
  Store.pongScene.add(Store.player2Paddle);

  const meshBallGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.3);
  const meshBallMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 });
  Store.meshBall = new THREE.Mesh(meshBallGeometry, meshBallMaterial);
  Store.meshBall.position.set(0, 0, 0);
  Store.pongScene.add(Store.meshBall);

  cameraPlayer1 = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 100);
  cameraPlayer1.lookAt(0, 0, 0);

  cameraPlayer2 = new THREE.PerspectiveCamera(60,  aspectRatio, 0.1, 100);
  cameraPlayer2.lookAt(0, 0, 0);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  Store.pongScene.add(ambientLight);
  const light = new THREE.PointLight(0xffffff, 1.5);
  light.position.set(0, 5, 0);
  Store.pongScene.add(light);
  
}


export function animatePong(renderer) {
  if (!Store.pongScene || !Store.gameConfig) return;

  if (Store.gameConfig.mode === "local") {
    if (!cameraPlayer1 || !cameraPlayer2) return;

    cameraPlayer1.position.set(
      Store.player1Paddle.position.x - 3,
      Store.player1Paddle.position.y ,
      Store.player1Paddle.position.z 
    );
    cameraPlayer1.lookAt(Store.player1Paddle.position);

    cameraPlayer2.position.set(
      Store.player2Paddle.position.x + 3,
      Store.player2Paddle.position.y ,
      Store.player2Paddle.position.z 
    );
    cameraPlayer2.lookAt(Store.player2Paddle.position);


    screenMesh.visible = false;



    renderer.setRenderTarget(renderTargetP1);
    renderer.render(Store.pongScene, cameraPlayer1);

    renderer.setRenderTarget(renderTargetP2);
    renderer.render(Store.pongScene, cameraPlayer2);
    
    screenMesh.visible = true;

    screenMaterial.uniforms.textureP1.value = renderTargetP1.texture;
    screenMaterial.uniforms.textureP2.value = renderTargetP2.texture;

    renderer.setRenderTarget(null);
    renderer.render(Store.pongScene, cameraCube);

  } else if (Store.gameConfig.mode === "matchmaking") {
    if (!cameraPlayer1) return;
    let cam;
    if (Store.gameConfig.side == "left")
    {
      cameraPlayer1.position.set(
        Store.player1Paddle.position.x - 3,
        Store.player1Paddle.position.y,
        Store.player1Paddle.position.z
      );
      cameraPlayer1.lookAt(Store.player1Paddle.position);
      cam = cameraPlayer1;
    }
    else if (Store.gameConfig.side == "right")
    {
      cameraPlayer2.position.set(
        Store.player2Paddle.position.x + 3,
        Store.player2Paddle.position.y,
        Store.player2Paddle.position.z
      );
      cameraPlayer2.lookAt(Store.player2Paddle.position);
      cam = cameraPlayer2;
    }
    screenMesh.visible = false;

    renderer.setRenderTarget(renderTargetP1);
    renderer.render(Store.pongScene, cam);
    
    screenMesh.visible = true;
    screenMaterial.uniforms.textureP1.value = renderTargetP1.texture;

    renderer.setRenderTarget(null);
    renderer.render(Store.pongScene, cameraCube);
  }
}
