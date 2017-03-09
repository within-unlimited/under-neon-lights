(function(){

  // http://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/

  const triangle = new THREE.BufferGeometry();

  const p = new Float32Array(9);
  p[0] = -1; p[1] = -1; p[2] = 0;
  p[3] =  3; p[4] = -1; p[5] = 0;
  p[6] = -1; p[7] =  3; p[8] = 0;

  const uv = new Float32Array(6);
  uv[0] = 0; uv[1] = 0;
  uv[2] = 2; uv[3] = 0;
  uv[4] = 0; uv[5] = 2;

  triangle.addAttribute("position", new THREE.BufferAttribute(p, 3));
  triangle.addAttribute("uv", new THREE.BufferAttribute(uv, 2));

  const mesh = new THREE.Mesh(triangle);
  const scene  = new THREE.Scene().add(mesh);
  const camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );

  THREE.ShaderPass = function( renderer ) {

    this.renderer = renderer;

  }

  THREE.ShaderPass.prototype.render = function(material, writeBuffer) {

    mesh.material = material;
    material.blending = THREE.NoBlending;
    material.depthWrite = false;
    material.depthTest = false;
    this.renderer.render(scene, camera, writeBuffer, false);

  };

})();
