THREE.NeonEffect = function( effect, renderer ) {

  this.annie = new THREE.Object3D();
  this.cursor = new THREE.Vector2();
  this.motionVector = new THREE.Vector3(0,0,0);
  this.emissionRate = 1;

  var clock = new THREE.Clock();

  var _particles = new THREE.NeonParticles( {
      renderer: renderer,
      size: 32,
      tail_size: 8,
      scale: 0.5
  } );

  // var _annieParticles = new THREE.NeonParticles( {
  //     renderer: renderer,
  //     size: 64,
  //     tail_size: 4,
  //     scale: 0.2
  // } );

  this._enabled = false;
  Object.defineProperty( this, 'enabled', {
    get: function() {
      return this._enabled;
    },
    set: function( value ) {
      if ( value != this._enabled ) {
        this._enabled = value;
        this.enabledChanged( value );
      }
    }
  });

  this.enabledChanged = function( enabled ) {
    if ( enabled ) {
      _particles.visible = true;
    //   _annieParticles.visible = true;
    } else {
      _particles.clear();
      _particles.visible = false;
    //   _annieParticles.clear();
    //   _annieParticles.visible = false;
    }
  };

  this.materials = [];

  this.addMaterial = function ( material ) {
    if ( material.uniforms && material.uniforms.neon ) {
      if ( this.materials.indexOf( material ) == -1 ) {
        this.materials.push( material );
      }
    }
  }

  this.setMaterials = function ( scene ) {
    scene.traverse( function( child ) {
      if ( child.material ) {
        this.addMaterial( child.material );
      }
    }.bind( this ));
  }


  this.setNeon = function ( value, time ) {
    time = clock.getElapsedTime();
    for ( var i = 0; i < this.materials.length; i++ ) {
      this.materials[i].uniforms.neon.value = value;
      this.materials[i].uniforms.time.value = time;
      this.materials[i].uniforms.cursor.value = this.cursor;
    }
  }

  // TODO: optimize
  this.render = function( scene, camera ) {
    time = clock.getElapsedTime();

    this.cursor.x -= this.motionVector.z;
    this.cursor.y -= this.motionVector.x;

    if ( !this.enabled ) {

      this.setNeon( 0, time );
      camera.visible = true;
      _particles.visible = false;
      effect.render( scene, camera );

    } else {

      if (_particles.oddpass) {
        camera.visible = false;
        this.annie.visible = false;
        _particles.visible = false;
        if (!_particles.parent) scene.add( _particles );
        _particles.emissionRate = this.emissionRate;
        _particles.motionVector = this.motionVector;
        this.setNeon( 2, time );
        _particles.sampleScene( scene, camera );
      }
      _particles.simulate( camera );
      _particles.visible = true;

    //   if (_annieParticles.oddpass) {
        // camera.visible = false;
        // this.annie.visible = true;
        // _annieParticles.visible = false;
        // scene.add( _annieParticles );
        // _annieParticles.emissionRate = this.emissionRate;
        // this.setNeon( 2, time );
        // _annieParticles.sampleObject( scene, this.annie );
    //   }
    //   _annieParticles.simulate( camera );
    //   _annieParticles.visible = true;

      camera.visible = true;
      this.annie.visible = true;
      this.setNeon( 1 );
      effect.render( scene, camera );

    }
  }

};
