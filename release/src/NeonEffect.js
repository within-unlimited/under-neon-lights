THREE.NeonEffect = function( effect, renderer ) {

  this.annie = new THREE.Object3D();
  this.motionVector = new THREE.Vector3(0,0,0);
  this.emissionRate = 1;

  var _particles = new THREE.NeonParticles( {
      renderer: renderer,
      size: 32,
      tail_size: 8,
      scale: 0.5
  } );
  var _scene = new THREE.Scene().add( _particles );
  var _srcScene = new THREE.Scene();

  var _annieParticles = new THREE.NeonParticles( {
      renderer: renderer,
      size: 32,
      tail_size: 4,
      scale: 0.1
  } );
  _scene.add( _annieParticles );

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
      this.setScene( _srcScene );
    } else {
      this.resetScene( _srcScene );
      _particles.clear();
    }
  };

  this.setScene = function ( scene ) {
      _srcScene = scene;
      _particles.setMaterials( _srcScene );
      _annieParticles.setMaterials( this.annie );
  }

  this.resetScene = function ( scene ) {
      _particles.resetMaterials( scene );
      _annieParticles.resetMaterials( this.annie );
  }

  // TODO: optimize
  this.render = function( scene, camera ) {
    _srcScene = scene;

    if ( !this.enabled ) {
      this.annie.visible = true;
      camera.visible = true;
      effect.render( _srcScene, camera );
      return;
    };

    camera.visible = false;
    this.annie.visible = false;
    _particles.emissionRate = this.emissionRate;
    _particles.motionVector = this.motionVector;
    _particles.sampleScene( _srcScene, camera );
    _particles.simulate( camera );

    this.annie.visible = true;
    _annieParticles.emissionRate = this.emissionRate;
    _annieParticles.sampleObject( this.annie );
    _annieParticles.simulate( camera );

    effect.render( _scene, camera );
  }

};
