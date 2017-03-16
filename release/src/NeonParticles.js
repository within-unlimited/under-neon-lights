/**
 * @author arodic / https://github.com/arodic
 * @author nopjia / https://github.com/nopjia
 *
 * Inspiration: https://github.com/nopjia/webgl-particles2
*/

THREE.NeonParticles = function( options ) {

    THREE.Object3D.call( this );
    this.type = 'NeonParticles';

    var renderer = options.renderer;

    if ( renderer.extensions.get( 'OES_texture_float_linear' ) === null ) return;

    var size = options.size || 64;
    var tail_size = options.tail_size || 4;
    var scale = options.scale || 0.3;

    var oddpass = false;
    var pass = -1;
    var clock = new THREE.Clock();

    this.motionVector = new THREE.Vector3(0,0,0);
    this.emissionRate = 1;

    this.renderer = renderer;
    this.targetInit = this.createRenderTarget( size * 8, 1);
    this.targetPos0 = this.createRenderTarget( size, tail_size );
    this.targetPos1 = this.createRenderTarget( size, tail_size );
    this.targetCol0 = this.createRenderTarget( size, 1 );
    this.targetCol1 = this.createRenderTarget( size, 1 );

    // var worldPosMaterial = THREE.neonShader.worldPositionShader.clone();
    var simulationShader =  THREE.neonShader.simulationShader.clone();
    simulationShader.defines.SIZE = size + ".0";
    simulationShader.defines.TAIL_SIZE = tail_size + ".0";
    simulationShader.uniforms.tInit.value = this.targetInit.texture;

    var shaderPass = new THREE.ShaderPass( renderer );

    this.particles = new THREE.LineSegments(
      this.createLineGeometry( size, tail_size ),
      THREE.neonShader.particleShader.clone()
    );
    this.particles.frustumCulled = false;
    this.add( this.particles );

    this.points = new THREE.Points(
      this.createParticleGeometry( size, tail_size ),
      THREE.neonShader.particleShader.clone()
    );
    this.points.frustumCulled = false;
    this.add( this.points );

    var _camera = this._camera = new THREE.PerspectiveCamera(45, 4, 0.01, 100 );
    var _scene = this._scene = new THREE.Scene();
    var _randVector = new THREE.Vector3();
    var _center = new THREE.Vector3();
    var _target = new THREE.Vector3();
    var _box = new THREE.Box3();
    this.sampleObject = function( object ) {
        object._parent = object.parent;
        object.matrixAutoUpdate = false;
        renderer._clearColor = renderer.getClearColor().getHex();

        _scene.add(object);
        renderer.setClearColor( 0x000000 );
        // this.setMaterials( object );

        _box.setFromObject( object );
        var fovFactor = Math.tan((_camera.fov / 2) * Math.PI / 180.0);
        _camera.aspect = Math.max(_box.max.x, _box.max.z) / _box.max.y * 1.5;
        _camera.updateProjectionMatrix();
        _target.copy(_box.getCenter());

        _camera.position.copy(_target);
        _randVector.set(Math.random()-0.5, 2*(Math.random()-0.5), Math.random()-0.5);//.normalize();
        _camera.position.add(_randVector);

        var offset = _camera.position.clone().sub(_target);
        offset.normalize().multiplyScalar(_box.getBoundingSphere().radius  / fovFactor);

        _camera.position.copy(_target).add(offset);
        _camera.lookAt(_target);

        renderer.render( _scene, _camera, this.targetInit );

        // this.resetMaterials( object );
        if (object._parent) object._parent.add(object);
        object.matrixAutoUpdate = true;
        renderer.setClearColor( renderer._clearColor );
    }

    this.sampleScene = function( scene, camera ) {
        camera._fov = camera.fov;
        camera._aspect = camera.aspect;
        renderer._clearColor = renderer.getClearColor().getHex();
        camera.fov = 45;
        camera.aspect = 1;
        camera.updateProjectionMatrix();
        renderer.setClearColor( 0x000000 );
        renderer.render( scene, camera, this.targetInit );

        camera.fov = camera._fov;
        camera.aspect = camera._aspect;
        camera.updateProjectionMatrix();
        renderer.setClearColor( renderer._clearColor );
    }

    this.simulate = function( camera ) {
      oddpass = !oddpass;
      pass++;
      var currentPos = oddpass ? this.targetPos1 : this.targetPos0;
      var previousPos = oddpass ? this.targetPos0 : this.targetPos1;
      var currentCol = oddpass ? this.targetCol1 : this.targetCol0;
      var previousCol = oddpass ? this.targetCol0 : this.targetCol1;
      simulationShader.uniforms.fEmissionRate.value = this.emissionRate;
      simulationShader.uniforms.tPrevPos.value = previousPos.texture;
      simulationShader.uniforms.tPrevCol.value = previousCol.texture;
      simulationShader.uniforms.fPass.value = pass;
      simulationShader.uniforms.fTimeDelta.value = Math.min( 1 / 60, clock.getDelta() );
      simulationShader.uniforms.fTime.value = clock.getElapsedTime();
      simulationShader.uniforms.fTarget.value = 0.0;
      simulationShader.uniforms.fScale.value = scale;
      simulationShader.uniforms.mProjectionMatrix.value = camera.projectionMatrix;
      simulationShader.uniforms.mModelViewMatrix.value = camera.matrixWorldInverse;
      simulationShader.uniforms.vMotionVector.value = this.motionVector;

      shaderPass.render( simulationShader, currentPos );
      simulationShader.uniforms.fTarget.value = 1.0;
      shaderPass.render( simulationShader, currentCol );
      // TODO: remove hack
      if (this.particles.material.uniforms.tCurrPos) {
          this.particles.material.uniforms.tCurrPos.value = currentPos.texture;
          this.particles.material.uniforms.tCurrCol.value = currentCol.texture;
          this.points.material.uniforms.tCurrPos.value = currentPos.texture;
          this.points.material.uniforms.tCurrCol.value = currentCol.texture;
      }
  };

  // Trigger shader compilation
  this.simulate( new THREE.Scene(), new THREE.PerspectiveCamera() );
  this.clear();

};

THREE.NeonParticles.prototype = Object.create( THREE.Object3D.prototype );
THREE.NeonParticles.prototype.constructor = THREE.NeonParticles;

THREE.NeonParticles.prototype.setMaterials = function( obj ) {
  obj.traverse( function( child ) {
    if ( child.material && !child._material && !child._neonMat ) {
      child._material = child.material;
      if ( child.material.uniforms && child.material.uniforms.neon ) {
        child._neonMat = child.material.clone();
        child._neonMat.uniforms.neon.value = true;
      } else {
        child._neonMat = THREE.neonShader.worldPositionShader.clone();
      }
    }
    child.material = child._neonMat;
  });
}

THREE.NeonParticles.prototype.resetMaterials = function( obj ) {
  obj.traverse( function( child ) {
    if (child._material) {
      child.material = child._material;
    }
  } );
}

THREE.NeonParticles.prototype.clear = function() {
  this.renderer.setClearAlpha( 0 );
  this.renderer.clearTarget( this.targetInit, true );
  this.renderer.clearTarget( this.targetPos0, true );
  this.renderer.clearTarget( this.targetPos1, true );
  this.renderer.clearTarget( this.targetCol0, true );
  this.renderer.clearTarget( this.targetCol1, true );
  this.renderer.setClearAlpha( 1 );
}

THREE.NeonParticles.prototype.createRenderTarget = function( size, tail_size ) {
  var target = new THREE.WebGLRenderTarget( size, size * tail_size, {
    minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat, type: THREE.FloatType
  });
  target.texture.generateMipmaps = false;
  return target;
};

THREE.NeonParticles.prototype.createLineGeometry = function( size, tail_size ) {
    var ATTR_WIDTH = 3;
    var indices = [];
    var i = 0;
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array( size * size * tail_size * ATTR_WIDTH);
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

THREE.NeonParticles.prototype.createParticleGeometry = function( size, tail_size ) {
  var ATTR_WIDTH = 3;
  var indices = [];
  var i = 0;
  var geo = new THREE.BufferGeometry();
  var pos = new Float32Array( size * size * tail_size * ATTR_WIDTH);
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
