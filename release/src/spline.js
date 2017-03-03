
var Spline = function() {

  this.splineHelperObjects = [];
  this.splinePointsLength = 4;
  this.positions = [];

  this.helperGeo = new THREE.BoxGeometry( 20, 20, 20 );
  this._visible = true;

  this.ARC_SEGMENTS = 200;

   // rotation looks messed up when this is true
  this.lookAhead = false;

  this.binormal = new THREE.Vector3();
  this.normal = new THREE.Vector3();

  // segments for computeFrenetFrames tangents.length
  // should this be the same as ARC_SEGMENTS?
  this.fSegments = 200;

  // var scope = this;

  // 0 - 1 percentage along path
  // duration should probably be spline.getLength()
  // how to update duration when adding or modifying point? create new tween?
  this.pct = { t: 0 };
  this.tween = new TWEEN.Tween( this.pct )
    .to({ t: 1 }, 2000)
    .onUpdate(function() {
      // scope.update();
    })
    .repeat( Infinity )
    .yoyo( true );

  // --------------------------------------------

  var i;
  for ( i = 0; i < this.splinePointsLength; i ++ ) {

    this.addSplineObject( this.positions[ i ] );

  }
  this.positions = [];
  for ( i = 0; i < this.splinePointsLength; i ++ ) {

    this.positions.push( this.splineHelperObjects[ i ].position );

  }

  var geometry = new THREE.Geometry();

  for ( var i = 0; i < this.ARC_SEGMENTS; i ++ ) {

    geometry.vertices.push( new THREE.Vector3() );

  }

  var curve = this.curve = new THREE.CatmullRomCurve3( this.positions );
  curve.type = 'centripetal';
  curve.closed = false;
  curve.tension = 0.5; // only for uniform 'catmullrom' curve.type

  this.curveMesh = new THREE.Line(
    geometry.clone(),
    new THREE.LineBasicMaterial({
      color: 0xff0000,
      opacity: 0.35,
      linewidth: 2
    })
  );

  scene.add( this.curveMesh );

};

Spline.prototype.addSplineObject = function( position ) {

  var object = new THREE.Mesh(
    this.helperGeo,
    new THREE.MeshLambertMaterial( {
      color: Math.random() * 0xffffff
    } )
  );

  if ( position ) {

    object.position.copy( position );

  } else {

    object.position.x = Math.random() * 1000 - 500;
    // object.position.y = Math.random() * 600;
    object.position.y = 0;
    object.position.z = Math.random() * 800 - 400;

  }

  object.castShadow = true;
  object.receiveShadow = true;
  scene.add( object );
  this.splineHelperObjects.push( object );
  return object;

};

Spline.prototype.updateSplineOutline = function() {

  var p;

  var curveMesh = this.curveMesh;

  for ( var i = 0; i < this.ARC_SEGMENTS; i ++ ) {

    p = curveMesh.geometry.vertices[ i ];
    p.copy( this.curve.getPoint( i /  ( this.ARC_SEGMENTS - 1 ) ) );

  }

  curveMesh.geometry.verticesNeedUpdate = true;

};

Spline.prototype.load = function( new_positions ) {

  var positions = this.positions;

  while ( new_positions.length > positions.length ) {

    this.addPoint();

  }

  while ( new_positions.length < positions.length ) {

    this.removePoint();

  }

  for ( i = 0; i < positions.length; i ++ ) {

    positions[ i ].copy( new_positions[ i ] );

  }

  this.updateSplineOutline();

}

Spline.prototype.addPoint = function() {
  this.splinePointsLength++;
  this.positions.push( this.addSplineObject().position );
  this.updateSplineOutline();
};

Spline.prototype.removePoint = function() {
  if ( this.splinePointsLength <= 4 ) {
    return;
  }

  this.splinePointsLength--;
  this.positions.pop();
  scene.remove( this.splineHelperObjects.pop() );

  this.updateSplineOutline();
};

Spline.prototype.export = function() {
  var p;
  var strplace = [];
  for ( i = 0; i < this.splinePointsLength; i ++ ) {

    p = this.splineHelperObjects[ i ].position;
    strplace.push( 'new THREE.Vector3(' + p.x + ', ' + p.y + ', ' + p.z + ')' );

  }
  console.log( strplace.join( ',\n' ) );
  var code = '[' + ( strplace.join( ',\n\t' ) ) + ']';
  prompt( 'copy and paste code', code );
};

Spline.prototype.start = function() {
  this.tween.start();
};

Spline.prototype.stop = function() {
  this.tween.stop();
};

Spline.prototype.update = function( obj ) {
  // position obj along curve, facing forward in the direction of movement

  if (obj == undefined) return;

  var t = this.pct.t;
  var curve = this.curve;

  var pos = this.curve.getPointAt( t );

  // from webgl_geometry_extrude_splines example:

  // http://www.cs.indiana.edu/pub/techreports/TR425.pdf
  var frames = curve.computeFrenetFrames( this.fSegments, curve.closed );

  var pickt = t * this.fSegments;
  var pick = Math.floor( pickt );
  var pickNext = ( pick + 1 ) % this.fSegments;

  // http://gamedev.stackexchange.com/questions/51399/what-are-normal-tangent-and-binormal-vectors-and-how-are-they-used
  this.binormal.subVectors( frames.binormals[ pickNext ], frames.binormals[ pick ] );
  this.binormal.multiplyScalar( pickt - pick ).add( frames.binormals[ pick ] );

  var dir = curve.getTangentAt( t );

  var offset = 15;

  this.normal.copy( this.binormal ).cross( dir );

  // We move on a offset on its binormal
  pos.add( this.normal.clone().multiplyScalar( offset ) );

  obj.position.copy( pos );

  // Using arclength for stablization in look ahead.
  var lookAt = curve.getPointAt( ( t + 30 / curve.getLength() ) % 1 );

  // Camera Orientation 2 - up orientation via normal
  if ( !this.lookAhead ) lookAt.copy( pos ).add( dir.negate() );
  obj.matrix.lookAt(obj.position, lookAt, this.normal.negate() );
  obj.rotation.setFromRotationMatrix( obj.matrix, obj.rotation.order );

};

Object.defineProperty(Spline.prototype, 'visible', {

  get: function() {
    return this._visible;
  },

  set: function(b) {

    this._visible = b;

    this.curveMesh.visible = b;

    for(var i = 0; i < this.splineHelperObjects.length; i++) {
      this.splineHelperObjects[i].visible = b;
    }

    return this;

  }

});
