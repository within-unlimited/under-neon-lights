(function() {

  var renderer = new THREE.WebGLRenderer({ antialias: true });
  var scene = new THREE.Scene();
  var cameras = new CameraAngles(new THREE.PerspectiveCamera());

  var isLocal = /localhost/i.test(window.location.href);
  var root = isLocal ? '/assets' : '//player-dev.cabrilleros.com/NEON_LIGHTS/assets';
  var filetype = url.filetype || 'fbx';
  var path = [root, '/models', '/', url.filename, '.', filetype].join('');

  var loaders = {
    obj: new THREE.OBJLoader(),
    fbx: new THREE.FBXLoader()
  };

  var controls = new THREE.OrbitControls(cameras.current, renderer.domElement);
  controls.enableDamping = true;

  loaders[filetype].load(path, function(object) {

    var radius = 0;
    console.log(object);

    var expose = function(object) {
      for (var i = 0; i < object.children.length; i++) {
        var child = object.children[i];
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshBasicMaterial({
            vertexColors: THREE.VertexColors
          });
          child.geometry.computeBoundingSphere();
          radius = Math.max(child.geometry.boundingSphere.radius, radius);
        } else if (child.children.length > 0) {
          expose(child);
        }
      }
    };

    expose(object);
    scene.add(object);
    setup(radius);

  });

  function setup(radius) {

    document.body.appendChild(renderer.domElement);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    renderer.domElement.style.left = 0;

    cameras.current.position.z = radius * 2;
    cameras.current.position.y = radius;
    cameras.current.far = 10000;
    cameras.current.lookAt(new THREE.Vector3());

    window.addEventListener('resize', resize, false);
    resize();
    loop();

  }

  function resize() {

    var width = window.innerWidth;
    var height = window.innerHeight;

    renderer.setSize(width, height);
    for (var i = 0; i < cameras.length; i++) {
      var camera = cameras[i];
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

  }

  function loop() {

    requestAnimationFrame(loop);

    controls.update();

    for (var i = 0; i < scene.children.length; i++) {
      var child = scene.children[i];
      child.rotation.y += 0.01;
    }

    renderer.render(scene, cameras.current);

  }

})();