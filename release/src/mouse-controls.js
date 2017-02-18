/**
 * @author jonobr1 / http://jonobr1.com/
 */
THREE.MouseControls = function( object, domElement ) {

  var scope = this;
  var HALF_PI = Math.PI / 2;

  this.object = object;
  this.object.rotation.reorder( 'YXZ' );

  this.enabled = false;
  this.domElement = domElement || window;
  this.domElement.isWindow = !domElement;

  this.drag = 0.66;
  this.scale = 1;
  this.dragging = false;

  this.mouse = new THREE.Vector2();
  this.destination = new THREE.Euler(
    this.object.rotation.x,
    this.object.rotation.y,
    this.object.rotation.z
  );
  this.destination.reorder( 'YXZ' );

  var mousedown = function ( e ) {

    e.preventDefault();

    scope.mouse.set(e.clientX, e.clientY);

    window.addEventListener('mousemove', mousemove, false);
    window.addEventListener('mouseup', mouseup, false);
    scope.dragging = true;

  };

  var mousemove = function( e ) {

    e.preventDefault();

    var x = e.clientX;
    var y = e.clientY;

    var width = scope.domElement[scope.domElement.isWindow ? 'innerWidth' : 'offsetWidth'];
    var height = scope.domElement[scope.domElement.isWindow ? 'innerHeight' : 'offsetHeight'];

    var dx = (x - scope.mouse.x) / width;
    var dy = (y - scope.mouse.y) / height;

    scope.destination.y += dx * scope.scale;
    scope.destination.x += dy * scope.scale;

    scope.destination.x = clamp(scope.destination.x, - HALF_PI, HALF_PI);

    scope.mouse.set(x, y);

  };

  var mouseup = function( e ) {
    e.preventDefault();
    window.removeEventListener('mousemove', mousemove, false);
    window.removeEventListener('mouseup', mouseup, false);
    scope.dragging = false;
  };

  this.connect = function() {

    scope.domElement.addEventListener('mousedown', mousedown, false);
    scope.enabled = true;

    return this;

  };

  this.disconnect = function() {

    scope.domElement.removeEventListener('mousedown', mousedown, false);
    scope.enabled = false;

    return this;

  };

  this.update = function() {

    if ( scope.enabled === false ) {
      return this;
    }

    scope.object.rotation.x += ( scope.destination.x - scope.object.rotation.x ) * scope.drag;
    scope.object.rotation.y += ( scope.destination.y - scope.object.rotation.y ) * scope.drag;
    scope.object.rotation.z += ( scope.destination.z - scope.object.rotation.z ) * scope.drag;

    return this;

  };

  function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
  }

};
