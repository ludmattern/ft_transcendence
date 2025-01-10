
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
    raycaster.setFromCamera(mouse, camera);
  
    if (screenObject1 && !onScreen) {
      const intersects1 = raycaster.intersectObject(screenObject1, true);
      const intersects2 = raycaster.intersectObject(screenObject2, true);
      const intersects3 = raycaster.intersectObject(screenObject3, true);
  
      if (intersects1.length > 0) {
        animateCameraToTarget(
          new THREE.Vector3(-0.2, 5.257378802731586, -0.8900580859235202),
          { x: Math.PI / 3, y: 0, z: 0 },
          1
        );
      } else if (intersects2.length > 0) {
        animateCameraToTarget(
          new THREE.Vector3(
            1.9765430745879866,
            3.434172967891374,
            -0.9419868064632663
          ),
          { x: Math.PI / 3.2, y: Math.PI / -5.5, z: -Math.PI / 12 },
          3
        );
      } else if (intersects3.length > 0) {
        animateCameraToTarget(
          new THREE.Vector3(
            -2.559453657498437,
            3.253545045816075,
            -0.7922370317858861
          ),
          { x: Math.PI / 3.2, y: Math.PI / 5.5, z: -Math.PI / -12 },
          2
        );
      }
    }
  }



  function createRectAreaLightHelper(light) {
    if (!light.isRectAreaLight) {
      console.error("Provided object is not a RectAreaLight.");
      return null;
    }
  
    const width = light.width;
    const height = light.height;
  
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -width / 2,
      -height / 2,
      0,
      width / 2,
      -height / 2,
      0,
      width / 2,
      height / 2,
      0,
      -width / 2,
      height / 2,
      0,
      -width / 2,
      -height / 2,
      0,
    ]);
    geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  
    const material = new THREE.LineBasicMaterial({ color: 0xffcc00 });
  
    const helper = new THREE.Line(geometry, material);
  
    helper.position.copy(light.position);
    helper.rotation.copy(light.rotation);
  
    light.add(helper);
  
    return helper;
  }