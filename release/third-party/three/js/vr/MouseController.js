THREE.MouseController = function ( domElement ) {

	THREE.Object3D.call( this );

	var scope = this;
	var mouse = new THREE.Vector2();
	var normal = new THREE.Vector2();

	var HALF_PI = Math.PI / 2;

	var width = domElement.clientWidth;
	var height = domElement.clientHeight;

	this.rotation.reorder( 'YXZ' );
	this.matrixAutoUpdate = false;
	this.visible = false;

	var dragging = false;
	var idle = debounce(function() {
		scope.visible = false;
	}, 350);

	var mousedown = function ( e ) {

		e.preventDefault();
		scope.visible = true;
		mouse.set( e.clientX, e.clientY );
		dragging = true;
		idle();
		scope.dispatchEvent( { type: 'mousedown' } );

	};

	var mousemove = function ( e ) {

		e.preventDefault();
		scope.visible = true;
		if ( !dragging ) {
			idle();
		}
		mouse.set( e.clientX, e.clientY );

	};

	var mouseup = function ( e ) {

		e.preventDefault();
		scope.visible = true;
		mouse.set( e.clientX, e.clientY );
		dragging = false;
		idle();
		scope.dispatchEvent( { type: 'mouseup' } );

	};

	var resize = function () {

		width = domElement.clientWidth;
		height = domElement.clientHeight;

	};

	domElement.addEventListener( 'mousedown', mousedown, false );
	window.addEventListener( 'mousemove', mousemove, false );
	window.addEventListener( 'mouseup', mouseup, false );
	window.addEventListener( 'resize', resize, false );

	this.resize = resize;

	this.getNormal = function ( v ) {

		var xpct = mouse.x / width;
		var ypct = mouse.y / height;

		var nx = 2 * xpct - 1;
		var ny = 2 * ypct - 1;

		if ( v ) {
			v.set( nx, ny );
			return v;
		}

		return new THREE.Vector2( nx, ny );

	};

	this.update = function () {

		scope.getNormal( normal );

		var nx = normal.x;
		var ny = normal.y;

		scope.rotation.y = nx * HALF_PI;
		scope.rotation.x = ny * HALF_PI;

		scope.position.x = nx;
		scope.position.y = ny;

	};

	function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = Date.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = Date.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  }

};

THREE.MouseController.prototype = Object.create( THREE.Object3D.prototype );
THREE.MouseController.prototype.constructor = THREE.MouseController;
