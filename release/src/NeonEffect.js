THREE.NeonEffect = function( effect, renderer ) {

	this.annie = new THREE.Object3D();
	this.cursor = new THREE.Vector2();
	this.motionVector = new THREE.Vector3( 0, 0, 0 );

	var clock = new THREE.Clock();

	this.enabled = false;

	this.materials = [];

	this.addMaterial = function ( material ) {
		if ( material.uniforms && material.uniforms.neon ) {
			if ( this.materials.indexOf( material ) == -1 ) {
				this.materials.push( material );
			}
		}
	};

	this.setMaterials = function ( scene ) {
		scene.traverse( function( child ) {
			if ( child.material ) {
				this.addMaterial( child.material );
			}
		}.bind( this ) );
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
			effect.render( scene, camera );

		} else {

			this.setNeon( 1, time );
			effect.render( scene, camera );

		}
	}

};
