/**
 * @author arodic / https://github.com/arodic
 * @author nopjia / https://github.com/nopjia
 *
 * Inspiration: https://github.com/nopjia/webgl-particles2
*/

(function(){

THREE.NeonEffect = function( effect, renderer, size, tail_size ) {

  let oddpass = false;
  let pass = 0;

  let clock = new THREE.Clock();

  this.targetInit = this.createRenderTarget(size * 4, 1);
  this.targetPos0 = this.createRenderTarget(size, tail_size);
  this.targetPos1 = this.createRenderTarget(size, tail_size);
  this.targetCol0 = this.createRenderTarget(size, 1);
  this.targetCol1 = this.createRenderTarget(size, 1);

  this.enabled = true;

  let basicMaterial = new THREE.MeshBasicMaterial({
    wireframe: true,
    vertexColors: THREE.VertexColors,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending
  });

  let worldPosMaterial = this.loadMaterial( {
    vertexShader: "/release/src/shaders/worldPosition.vert.glsl",
    fragmentShader: "/release/src/shaders/worldPosition.frag.glsl",
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors
  });

  let particleMaterial = this.loadMaterial({
    defines: {
        "POINT_SIZE": "1.0",
    },
    uniforms: {
        "tCurrPos": { type: "t", value: null },
        "tCurrCol": { type: "t", value: null }
    },
    vertexShader: "/release/src/shaders/particle.vert.glsl",
    fragmentShader: "/release/src/shaders/particle.frag.glsl"
  });

  let simulationShader = this.loadMaterial({
    defines: {
        "SIZE": size + ".0",
        "TAIL_SIZE": tail_size + ".0"
    },
    uniforms: {
        "tInit": { type: "t", value: this.targetInit.texture },
        "tPrevPos": { type: "t", value: null },
        "tPrevCol": { type: "t", value: null },
        "fPass": { type: "f", value: 0 },
        "fTarget": { type: "f", value: 0 },
        "fTime": { type: "f", value: 0 },
        "fTimeDelta": { type: "f", value: 0 },
        "mProjectionMatrix": { type: "m", value: null },
        "mModelViewMatrix": { type: "m", value: null }
    },
    vertexShader: "/release/src/shaders/simulation.vert.glsl",
    fragmentShader: "/release/src/shaders/simulation.frag.glsl"
  });

  var shaderPass = new THREE.ShaderPass(renderer);

  let particles = new THREE.LineSegments(
    this.createParticleGeometry(size, tail_size),
    particleMaterial
  );
  particles.frustumCulled = false;

  this.isReady = function () {
    return worldPosMaterial.ready && simulationShader.ready && particleMaterial.ready;
  }

  this.simulate = function(camera) {
    if (!this.isReady()) return;
    oddpass = !oddpass;
    let currentPos = oddpass ? this.targetPos1 : this.targetPos0;
    let previousPos = oddpass ? this.targetPos0 : this.targetPos1;
    let currentCol = oddpass ? this.targetCol1 : this.targetCol0;
    let previousCol = oddpass ? this.targetCol0 : this.targetCol1;
    simulationShader.uniforms.tPrevPos.value = previousPos.texture;
    simulationShader.uniforms.tPrevCol.value = previousCol.texture;
    simulationShader.uniforms.fPass.value = pass;
    pass++;
    simulationShader.uniforms.fTimeDelta.value = Math.min(1/60, clock.getDelta());
    simulationShader.uniforms.fTime.value = clock.getElapsedTime();
    simulationShader.uniforms.fTarget.value = 0.0;
    simulationShader.uniforms.mProjectionMatrix.value = camera.projectionMatrix;
    simulationShader.uniforms.mModelViewMatrix.value = camera.matrixWorldInverse;
    shaderPass.render(simulationShader, currentPos);
    simulationShader.uniforms.fTarget.value = 1.0;
    shaderPass.render(simulationShader, currentCol);
    particles.material.uniforms.tCurrPos.value = currentPos.texture;
    particles.material.uniforms.tCurrCol.value = currentCol.texture;
  }

  this.render = function( scene, camera ) {

    camera._fov = camera.fov;
    camera._aspect = camera.aspect;
    scene.traverse(function(obj) {
      if (obj.material) {
        obj.material = obj._material || obj.material;
      }
    });

    scene.remove(particles);

    if (!this.isReady() || !this.enabled) {
      effect.render(scene, camera);
      return;
    };

    camera.fov = 120;
    camera.aspect = 1;
    camera.updateProjectionMatrix();

    scene.overrideMaterial = worldPosMaterial;

    renderer.setClearColor( 0x000000 );
    renderer.render(scene, camera, this.targetInit);
    this.simulate(camera);
    scene.overrideMaterial = null;

    scene.traverse(function(obj) {
      if (obj.material) {
        obj._material = obj.material;
        obj.material = basicMaterial;
      }
    })

    scene.add(particles);

    camera.fov = camera._fov;
    camera.aspect = camera._aspect;
    camera.updateProjectionMatrix();

    effect.render(scene, camera);
  }

};

THREE.NeonEffect.prototype.createRenderTarget = function(size, tail_size) {
  let target = new THREE.WebGLRenderTarget( size, size * tail_size, {
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat, type: THREE.FloatType
  });
  target.texture.generateMipmaps = false;
  return target;
};

THREE.NeonEffect.prototype.createParticleGeometry = function(size, tail_size) {
    let ATTR_WIDTH = 3;
    let indices = [];
    let i = 0;
    let geo = new THREE.BufferGeometry();
    let pos = new Float32Array(size * size * tail_size * ATTR_WIDTH);
    var idx = 0;
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < tail_size; z++) {
          pos[idx + 1] = (x + 0.5) / size; // +0.5 to be at center of texel
          pos[idx + 0] = ((y + 0.5) / size) + ((z - tail_size / 2 + 0.5) / tail_size / size);// / tail_size;
          pos[idx + 2] = 0;//z / tail_size;
          if (z < tail_size - 1) {
            indices.push(i);
            indices.push(i + 1);
          }
          i++;
          idx += ATTR_WIDTH;
        }
      }
    }
    geo.addAttribute( 'position', new THREE.BufferAttribute( pos, ATTR_WIDTH ) );
    geo.setIndex( new THREE.BufferAttribute( new Uint32Array( indices ), 1 ) );
    geo.computeBoundingBox();
    return geo;
}

THREE.NeonEffect.prototype.loadMaterial = function( args, callback ) {
  let vertexShader, fragmentShader;
  let mat = new THREE.ShaderMaterial();
  callback = callback || function () {}
  const compile = function() {
    if (vertexShader && fragmentShader) {
      args.vertexShader = vertexShader;
      args.fragmentShader = fragmentShader;
      for (let arg in args) mat[arg] = args[arg];
      mat.ready = true;
      callback(mat);
    }
  }
  this.loadShader(args.vertexShader, function(result) {
    vertexShader = result;
    compile();
  });
  this.loadShader(args.fragmentShader, function(result) {
    fragmentShader = result;
    compile();
  });
  return mat;
}

THREE.NeonEffect.prototype.loadShader = function(url, callback) {
  let shaderStr;
  let injectLine;
  const regex = /#inject .+/g;
  var compile = function(fileStr) {
    if (!shaderStr) {
      shaderStr = fileStr;
    }
    if (injectLine) {
      shaderStr = shaderStr.replace(injectLine, fileStr);
      injectLine = null;
    }
    var matches = shaderStr.match(regex);
    if (!matches) {
      callback(shaderStr);
    } else {
      injectLine = matches[0];
      xhr.get(injectLine.split(" ")[1], compile);
    }
  }
  xhr.get(url, compile);
};

THREE.NeonEffect.prototype.loadTextFile = function(url) {
  let result;
  const req = new XMLHttpRequest();
  req.onerror = function() {
    console.log("Error: request error on " + url);
  };
  req.onload = function() {
    result = this.responseText;
  };
  req.open("GET", url, false);
  req.send();
  return result;
};

})();
