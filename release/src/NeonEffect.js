/**
 * @author arodic / https://github.com/arodic
 * @author nopjia / https://github.com/nopjia
 *
 * Inspiration: https://github.com/nopjia/webgl-particles2
*/

(function(){

THREE.NeonEffect = function( effect, renderer ) {

  var size = 64;
  var tail_size = 4;

  var oddpass = false;
  var pass = 0;
  var inited = false;

  var clock = new THREE.Clock();
  var neonScene = new THREE.Scene();

  this.motionVector = new THREE.Vector3(0,0,0);

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
  this.fogColor = new THREE.Color(0x333333);

  var worldPosMaterial = THREE.neonShader.worldPositionShader.clone();
  var lineMaterial = THREE.neonShader.particleShader.clone();
  var particleMaterial = THREE.neonShader.particleShader.clone();
  var simulationShader =  THREE.neonShader.simulationShader.clone();;
  simulationShader.defines.SIZE = size + ".0";
  simulationShader.defines.TAIL_SIZE = tail_size + ".0";
  simulationShader.uniforms.tInit.value = this.targetInit.texture;

  var shaderPass = new THREE.ShaderPass(renderer);

  var particles = new THREE.LineSegments(
    this.createLineGeometry(size, tail_size),
    lineMaterial
  );
  particles.frustumCulled = false;
  neonScene.add(particles);

  var points = new THREE.Points(
    this.createParticleGeometry(size, tail_size),
    particleMaterial
  );
  points.frustumCulled = false;
  neonScene.add(points);

  this.simulate = function(camera) {
    oddpass = !oddpass;
    var currentPos = oddpass ? this.targetPos1 : this.targetPos0;
    var previousPos = oddpass ? this.targetPos0 : this.targetPos1;
    var currentCol = oddpass ? this.targetCol1 : this.targetCol0;
    var previousCol = oddpass ? this.targetCol0 : this.targetCol1;
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
    simulationShader.uniforms.vMotionVector.value = this.motionVector;
    shaderPass.render(simulationShader, currentPos);
    simulationShader.uniforms.fTarget.value = 1.0;
    shaderPass.render(simulationShader, currentCol);
    particles.material.uniforms.tCurrPos.value = currentPos.texture;
    particles.material.uniforms.tCurrCol.value = currentCol.texture;
    points.material.uniforms.tCurrPos.value = currentPos.texture;
    points.material.uniforms.tCurrCol.value = currentCol.texture;
  }

  this.enabledChanged = function(enabled) {
    if (!this.scene) {
      return;
    }
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
      this.resetScene( this.scene );
      this.clear();
    }
  };

  this.resetScene = function(scene) {
    scene.traverse(function(obj) {
      if (obj._material) {
        obj.material = obj._material;
      }
    });
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

    if (!inited) {
      this.simulate(camera);
      this.clear();
      inited = true;
    }

    if (!this.enabled) {
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
    renderer.setClearColor( this.fogColor );

    camera.fov = camera._fov;
    camera.aspect = camera._aspect;
    camera.updateProjectionMatrix();

    effect.render(neonScene, camera);
  }

};

THREE.NeonEffect.prototype.createRenderTarget = function(size, tail_size) {
  var target = new THREE.WebGLRenderTarget( size, size * tail_size, {
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat, type: THREE.FloatType
  });
  target.texture.generateMipmaps = false;
  return target;
};

THREE.NeonEffect.prototype.createLineGeometry = function(size, tail_size) {
    var ATTR_WIDTH = 3;
    var indices = [];
    var i = 0;
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(size * size * tail_size * ATTR_WIDTH);
    var idx = 0;
    for (var x = 0; x < size; x++) {
      for (var y = 0; y < size; y++) {
        for (var z = 0; z < tail_size; z++) {
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
  var ATTR_WIDTH = 3;
  var indices = [];
  var i = 0;
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array(size * size * tail_size * ATTR_WIDTH);
  var idx = 0;
  for (var x = 0; x < size; x++) {
    for (var y = 0; y < size; y++) {
      for (var z = 0; z < 1; z++) {
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

})();
