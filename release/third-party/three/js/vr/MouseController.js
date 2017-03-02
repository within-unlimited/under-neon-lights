THREE.MouseController = function ( domElement ) {

	THREE.Object3D.call( this );

	var scope = this;
	var mouse = new THREE.Vector2();
	var HALF_PI = Math.PI / 2;

	var width = domElement.clientWidth;
	var height = domElement.clientHeight;

	this.rotation.reorder( 'YXZ' );
	this.matrixAutoUpdate = false;

	var mousedown = function ( e ) {

		e.preventDefault();
		mouse.set( e.clientX, e.clientY );
		scope.dispatchEvent( { type: 'mousedown' } );

	};

	var mousemove = function ( e ) {

		e.preventDefault();
		mouse.set( e.clientX, e.clientY );

	};

	var mouseup = function ( e ) {

		e.preventDefault();
		mouse.set( e.clientX, e.clientY );
		scope.dispatchEvent( { type: 'mouseup' } );

	};

	var resize = function () {

		width = domElement.clientWidth;
		height = domElement.clientHeight;

	};

	domElement.addEventListener( 'mousedown', mousedown, false );
	window.addEventListener( 'mousemove', mousemove, false );
	window.addEventListener( 'mouseup', mouseup, false );
	domElement.addEventListener( 'resize', resize, false );

	this.update = function () {

		var xpct = mouse.x / width;
		var ypct = mouse.y / height;

		var nx = 2 * xpct - 1;
		var ny = 2 * ypct - 1;

		scope.rotation.y = nx * HALF_PI;
		scope.rotation.x = ny * HALF_PI;

		scope.position.x = nx;
		scope.position.y = ny;

	};

};

THREE.MouseController.prototype = Object.create( THREE.Object3D.prototype );
THREE.MouseController.prototype.constructor = THREE.MouseController;
