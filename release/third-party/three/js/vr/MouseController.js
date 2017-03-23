THREE.MouseController = function ( domElement ) {

	THREE.Object3D.call( this );

	var scope = this;
	var mouse = new THREE.Vector2();
	var normal = new THREE.Vector2();
	var axes = [ 0, 0 ];

	var HALF_PI = Math.PI / 2;

	var width = domElement.clientWidth || window.innerWidth;
	var height = domElement.clientHeight || window.innerHeight;

	this.rotation.reorder( 'YXZ' );
	this.matrixAutoUpdate = false;
	this.visible = false;

	var dragging = false;

	var mousedown = function ( e ) {

		e.preventDefault();
		scope.visible = true;
		mouse.set( e.clientX, e.clientY );

		window.addEventListener( 'mousemove', mousemove, false );
		window.addEventListener( 'mouseup', mouseup, false );

		scope.dispatchEvent( { type: 'mousedown' } );
		dragging = true;

	};

	var mousemove = function ( e ) {

		e.preventDefault();
		scope.visible = true;

		if ( dragging ) {

			var x = 2 * ( e.clientX / width ) - 1;
			var y = 2 * ( e.clientY / height ) - 1;

			if ( axes[ 0 ] !== x || axes[ 1 ] !== y ) {
				axes[ 0 ] = - x;
				axes[ 1 ] = y;
				scope.dispatchEvent( { type: 'axischanged', axes: axes } );
			}

		}

		mouse.set( e.clientX, e.clientY );

	};

	var mouseup = function ( e ) {

		e.preventDefault();
		scope.visible = false;
		mouse.set( e.clientX, e.clientY );

		window.removeEventListener( 'mousemove', mousemove, false );
		window.removeEventListener( 'mouseup', mouseup, false );

		dragging = false;
		scope.dispatchEvent( { type: 'mouseup' } );

	};

	var touchstart = function ( e ) {

		e.preventDefault();

		var touches = e.touches;
		var touch = touches[ 0 ];

		scope.visible = true;
		mouse.set( touch.pageX, touch.pageY );
		scope.update();
		scope.dispatchEvent( { type: 'mousedown' } );
		dragging = true;

	};

	var touchmove = function ( e ) {

		e.preventDefault();

		var touches = e.touches;
		var touch = touches[ 0 ];

		var x = 2 * ( touch.pageX / width ) - 1;
		var y = 2 * ( touch.pageY / height ) - 1;
		if ( axes[ 0 ] !== x || axes[ 1 ] !== y ) {
			axes[ 0 ] = - x;
			axes[ 1 ] = y;
			scope.dispatchEvent( { type: 'axischanged', axes: axes } );
		}
		mouse.set( touch.pageX, touch.pageY );

	};

	var touchend = function ( e ) {

		e.preventDefault();
		scope.visible = false;
		dragging = false;
		scope.dispatchEvent( { type: 'mouseup' } );

	};

	var resize = function () {

		width = domElement.clientWidth || window.innerWidth;
		height = domElement.clientHeight || window.innerHeight;

	};

	domElement.addEventListener( 'mousedown', mousedown, false );
	domElement.addEventListener( 'touchstart', touchstart, false );
	domElement.addEventListener( 'touchmove', touchmove, false );
	domElement.addEventListener( 'touchend', touchend, false );
	domElement.addEventListener( 'touchcancel', touchend, false );

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
