/**
 * @author arodic / https://github.com/arodic
 * @author nopjia / https://github.com/nopjia
 *
 * Inspiration: https://github.com/nopjia/webgl-particles2
*/

(function(){

THREE.NeonEffect = function( effect, renderer ) {

  const size = 64;
  const tail_size = 4;

  let oddpass = false;
  let pass = 0;
  let inited = false;

  let clock = new THREE.Clock();
  let neonScene = new THREE.Scene();

  this.targetInit = this.createRenderTarget(size * 8, 1);
  this.targetPos0 = this.createRenderTarget(size, tail_size);
  this.targetPos1 = this.createRenderTarget(size, tail_size);
  this.targetCol0 = this.createRenderTarget(size, 1);
  this.targetCol1 = this.createRenderTarget(size, 1);

  this._enabled = false;
  Object.defineProperty(this, 'enabled', {
    get: function() {
      return this._enabled;
    },
    set: function(value) {
      if (value != this._enabled) {
        this._enabled = value;
        this.enabledChanged(value);
      }
    }
  });

  this.scale = 1;

  let worldPosMaterial = this.loadMaterial( {
    vertexShader: "../release/src/shaders/worldPosition.vert.glsl",
    fragmentShader: "../release/src/shaders/worldPosition.frag.glsl",
    side: THREE.DoubleSide,
    vertexColors: THREE.VertexColors
  });

  let particleMaterial = this.loadMaterial({
    defines: {
        "POINT_SIZE": "6.0",
    },
    uniforms: {
        "tCurrPos": { type: "t", value: null },
        "tCurrCol": { type: "t", value: null }
    },
    vertexShader: "../release/src/shaders/particle.vert.glsl",
    fragmentShader: "../release/src/shaders/particle.frag.glsl"
  });

  let particleMaterial2 = this.loadMaterial({
    defines: {
        "POINT_SIZE": "3.0",
    },
    uniforms: {
        "tCurrPos": { type: "t", value: null },
        "tCurrCol": { type: "t", value: null }
    },
    vertexShader: "../release/src/shaders/particle.vert.glsl",
    fragmentShader: "../release/src/shaders/particle.frag.glsl"
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
        "fScale": { type: "f", value: 1 },
        "mProjectionMatrix": { type: "m", value: null },
        "mModelViewMatrix": { type: "m", value: null }
    },
    vertexShader: "../release/src/shaders/simulation.vert.glsl",
    fragmentShader: "../release/src/shaders/simulation.frag.glsl"
  });

  var shaderPass = new THREE.ShaderPass(renderer);

  let particles = new THREE.LineSegments(
    this.createLineGeometry(size, tail_size),
    particleMaterial
  );
  particles.frustumCulled = false;
  neonScene.add(particles);

  let particles2 = new THREE.Points(
    this.createParticleGeometry(size, tail_size),
    particleMaterial2
  );
  particles2.frustumCulled = false;
  neonScene.add(particles2);

  this.isReady = function () {
    return worldPosMaterial.ready && simulationShader.ready && particleMaterial.ready && particleMaterial2.ready;
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
    simulationShader.uniforms.fScale.value = this.scale;
    simulationShader.uniforms.mProjectionMatrix.value = camera.projectionMatrix;
    simulationShader.uniforms.mModelViewMatrix.value = camera.matrixWorldInverse;
    shaderPass.render(simulationShader, currentPos);
    simulationShader.uniforms.fTarget.value = 1.0;
    shaderPass.render(simulationShader, currentCol);
    particles.material.uniforms.tCurrPos.value = currentPos.texture;
    particles.material.uniforms.tCurrCol.value = currentCol.texture;
    particles2.material.uniforms.tCurrPos.value = currentPos.texture;
    particles2.material.uniforms.tCurrCol.value = currentCol.texture;
  }

  this.enabledChanged = function(enabled) {
    if (enabled) {
      renderer._clearColor = renderer.getClearColor().getHex();
      this.scene.traverse(function(obj) {
        if (obj.material && !obj._material && !obj._neonMat) {
          obj._material = obj.material;
          if (obj.material.uniforms && obj.material.uniforms.neon) {
            obj._neonMat = obj.material.clone();
            obj._neonMat.uniforms.neon.value = true;
          } else {
            obj._neonMat = worldPosMaterial.clone();
          }
        }
        obj.material = obj._neonMat;
      });
    } else {
      renderer.setClearColor( renderer._clearColor );
      this.scene.traverse(function(obj) {
        if (obj._material) {
          obj.material = obj._material;
        }
      });
      this.clear();
    }
  };

  this.clear = function() {
    renderer.setClearAlpha( 0 );
    renderer.clearTarget(this.targetInit, true);
    renderer.clearTarget(this.targetPos0, true);
    renderer.clearTarget(this.targetPos1, true);
    renderer.clearTarget(this.targetCol0, true);
    renderer.clearTarget(this.targetCol1, true);
  };

  // TODO: optimize
  this.render = function( scene, camera ) {
    camera._fov = camera.fov;
    camera._aspect = camera.aspect;

    this.scene = scene;

    if (this.isReady() && !inited) {
      this.simulate(camera);
      this.clear();
      inited = true;
    }

    if (!this.isReady() || !this.enabled) {
      renderer.setClearColor( renderer._clearColor );
      effect.render(scene, camera);
      return;
    };

    camera.fov = 45;
    camera.aspect = 1;
    camera.updateProjectionMatrix();

    renderer.setClearColor( 0x000000 );
    renderer.render(scene, camera, this.targetInit);
    this.simulate(camera);

    camera.fov = camera._fov;
    camera.aspect = camera._aspect;
    camera.updateProjectionMatrix();

    effect.render(neonScene, camera);
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

THREE.NeonEffect.prototype.createLineGeometry = function(size, tail_size) {
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

THREE.NeonEffect.prototype.createParticleGeometry = function(size, tail_size) {
  let ATTR_WIDTH = 3;
  let indices = [];
  let i = 0;
  let geo = new THREE.BufferGeometry();
  let pos = new Float32Array(size * size * tail_size * ATTR_WIDTH);
  var idx = 0;
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      for (let z = 0; z < 1; z++) {
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
