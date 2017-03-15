THREE.NeonEffect = function( effect, renderer ) {

  this.annie = new THREE.Object3D();
  this.motionVector = new THREE.Vector3(0,0,0);
  this.emmitRate = 1;

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
      _particles.setMaterials( _srcScene );
    } else {
      _particles.resetMaterials( _srcScene );
      _particles.clear();
    }
  };

  this.resetScene = function () {
      _particles.resetMaterials( _srcScene );
      _particles.clear();
      _annieParticles.resetMaterials( this.annie );
      _annieParticles.clear();
  }

  // TODO: optimize
  this.render = function( scene, camera ) {
    _srcScene = scene;

    if ( !this.enabled ) {
      this.annie.visible = true;
      effect.render( _srcScene, camera );
      return;
    };

    this.annie.visible = false;
    _particles.emmitRate = this.emmitRate;
    _particles.motionVector = this.motionVector;
    _particles.sampleScene( _srcScene, camera );
    _particles.simulate( camera );

    this.annie.visible = true;
    _annieParticles.emmitRate = this.emmitRate;
    _annieParticles.sampleObject( this.annie );
    _annieParticles.simulate( camera );

    // this.annie.visible = true;
    effect.render( _scene, camera );
  }

};
