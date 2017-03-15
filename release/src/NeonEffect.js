THREE.NeonEffect = function( effect, renderer ) {

  this.motionVector = new THREE.Vector3(0,0,0);

  var _particles = new THREE.NeonParticles( renderer );
  var _scene = new THREE.Scene().add( _particles );
  var _srcScene = new THREE.Scene();

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

  this.resetScene = function( scene ) {
    scene.traverse( function( obj ) {
      if (obj._material) {
        obj.material = obj._material;
      }
    } );
  };

  // TODO: optimize
  this.render = function( scene, camera ) {
    _srcScene = scene;

    if ( !this.enabled ) {
      effect.render( _srcScene, camera );
      return;
    };

    _particles.motionVector = this.motionVector;
    _particles.sampleScene( _srcScene, camera );
    _particles.simulate( camera );

    effect.render( _scene, camera );
  }

};
