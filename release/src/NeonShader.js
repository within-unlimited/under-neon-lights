THREE.neonShader = {
	globals: {
		saturation: { type: 'f', value: url.number( 'saturation', 0.2 ) },
		sepia: { type: 'f', value: url.number( 'sepia', 2.5 ) },
		sepiaCol1: { type: 'c', value: new THREE.Color( 0, 0.35, 0.68 ) },
		sepiaCol2: { type: 'c', value: new THREE.Color( 0.52, 1.10, 1.5 ) },
		neon: { type: 'f', value: url.number( 'neon', 0.0 ) },
		time: { type: 'f', value: url.number( 'neon', 0.0 ) },
		cursor: { type: 'v3', value: new THREE.Vector3() },
		motionVector: { type: 'v3', value: new THREE.Vector3() },
		yrot: { type: 'f', value: 0 },
		neonFade: { type: 'f', value: 0.8 },
		neonGlow: { type: 'f', value: 0.7 },
		neonFreq1: { type: 'f', value: 3.0 },
		neonFreq2  : { type: 'f', value: 2.0 },
		neonNearClip: { type: 'f', value: 0.0 }
	}
}

THREE.neonShader.loadTextFile = function( url ) {
	var result;
	var req = new XMLHttpRequest();
	req.onerror = function() {
		console.log( "Error: request error on " + url );
	};
	req.onload = function() {
		result = this.responseText;
	};
	req.open( "GET", url, false );
	req.send();
	return result;
};

THREE.neonShader.loadTextFileInject = function( url ) {
	var fileStr = THREE.neonShader.loadTextFile( url );
	var matches = fileStr.match( /#inject .+/g );
	if ( !matches ) return fileStr;
	for ( var i = 0; i < matches.length; i++ ) {
		var injectLine = matches[i];
		var injectUrl = injectLine.split( " " )[1];
		var injectFileStr = THREE.neonShader.loadTextFileInject( injectUrl );
		fileStr = fileStr.replace( injectLine, injectFileStr );
	}
	return fileStr;
};

THREE.neonShader.load = function( url ) {
	var src = THREE.neonShader.loadTextFileInject( url );
	var lines = src.match( /.+/g );
	var srcFormatted = '';
	for ( var i = 0; i < lines.length; i++ ) {
		var line = '"' + lines[i] + '",';
		srcFormatted += line;
		srcFormatted += '\r\n';
	}
	console.log( url, ':\n' );
	console.log( srcFormatted );
	return src;
}

THREE.neonShader._vert = [

].join( '\n' );
// NOTE: Uncomment line below to use glsl shader source.
THREE.neonShader._vert = THREE.neonShader.load( '../release/src/shaders/vert.glsl' );

THREE.neonShader._frag = [

].join( '\n' );
// NOTE: Uncomment line below to use glsl shader source.
THREE.neonShader._frag = THREE.neonShader.load( '../release/src/shaders/frag.glsl' );

THREE.neonShader._uniforms = {
	color: { type: 'c', value: new THREE.Color( 0xffffff ) },
	fogColor: { type: 'c', value: new THREE.Color( 0x000000 ) },
	fogNear: { type: 'f', value: 0 },
	fogFar: { type: 'f', value: 1 }
};

THREE.neonShader.basicShader = new THREE.ShaderMaterial( {
	fog: true,
	side: THREE.FrontSide,
	uniforms: THREE.UniformsUtils.clone( THREE.neonShader._uniforms ),
	vertexShader: THREE.neonShader._vert,
	fragmentShader: THREE.neonShader._frag
} );

THREE.neonShader.grassShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.grassShader.setValues( {
	defines: {
		USE_GRASS: '',
		USE_INSTANCING: ''
	},
	uniforms: THREE.UniformsUtils.merge( [
		THREE.neonShader._uniforms, {
			size: { type: 'f', value: 1 }
		}
	] )
} );

THREE.neonShader.roadShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.roadShader.setValues( {
	defines: {
		USE_ROAD: '',
		USE_FAKE_SHADOW: ''
	},
	uniforms: THREE.UniformsUtils.merge( [
		THREE.neonShader._uniforms, {
			subdivisions: { type: 'f', value: 32 },
			curvature: { type: 'f', value: 1 },
			size: { type: 'f', value: 1 },
			median: { type: 'c', value: new THREE.Color( 'red' ) }
		}
	] )
} );

THREE.neonShader.skinnedShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.skinnedShader.setValues( {
	side: THREE.DoubleSide,
	vertexColors: true,
	skinning: true,
	uniforms: THREE.UniformsUtils.merge( [
		THREE.neonShader._uniforms, {
			clip: { type: 'v2', value: new THREE.Vector2( -1e10, 1e10 ) }
		}
	] )
} );
THREE.neonShader.skinnedShader.defines = { USE_CLIPPING: '' };

THREE.neonShader.swirlShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.swirlShader.uniforms = THREE.UniformsUtils.merge( [
	THREE.neonShader._uniforms, {
		progress: { type: 'f', value: 0 }
	}
] );
THREE.neonShader.swirlShader.defines = { USE_SWIRL: '' };

THREE.neonShader.floorShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.floorShader.defines = { USE_FAKE_SHADOW: '' };

THREE.neonShader.waveShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.waveShader.defines = { USE_WAVE: '' };
THREE.neonShader.waveShader.vertexColors = true;
THREE.neonShader.waveShader.side = THREE.DoubleSide;

THREE.neonShader.backSided = THREE.neonShader.basicShader.clone();
THREE.neonShader.backSided.defines = { DONTUSE_NEON: '' };
THREE.neonShader.backSided.side = THREE.BackSide;
THREE.neonShader.backSided.depthWrite = false;

THREE.neonShader.vertexColoredDoubleSided = THREE.neonShader.basicShader.clone();
THREE.neonShader.vertexColoredDoubleSided.vertexColors = true;
THREE.neonShader.vertexColoredDoubleSided.defines = { USE_FAKE_SHADOW: '' };
THREE.neonShader.vertexColoredDoubleSided.side = THREE.DoubleSide;

THREE.neonShader.vertexColored = THREE.neonShader.basicShader.clone();
THREE.neonShader.vertexColored.vertexColors = true;
THREE.neonShader.vertexColored.defines = { USE_FAKE_SHADOW: '' };

THREE.neonShader.doubleSided = THREE.neonShader.roadShader.clone();
THREE.neonShader.doubleSided.side = THREE.DoubleSide;

for ( var i in THREE.neonShader  ) {
	if ( THREE.neonShader[i] instanceof THREE.ShaderMaterial ) {
		for ( var j in THREE.neonShader.globals ) {
			THREE.neonShader[i].uniforms[j] = THREE.neonShader.globals[j];
		}
	}
}
