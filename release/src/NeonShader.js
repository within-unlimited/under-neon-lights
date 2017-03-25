THREE.neonShader = {
	globals: {
		saturation: { type: 'f', value: url.number( 'saturation', 0.21 ) },
		sepia: { type: 'f', value: url.number( 'sepia', 3.5 ) },
		sepiaCol1: { type: 'c', value: new THREE.Color( 0x1488b9 ) },
		sepiaCol2: { type: 'c', value: new THREE.Color( 0x10bfca ) },
		neonCol: { type: 'c', value: new THREE.Color( 0x3109eb ) },
		neon: { type: 'f', value: url.number( 'neon', 0.0 ) },
		time: { type: 'f', value: url.number( 'neon', 0.0 ) },
		cursor: { type: 'v3', value: new THREE.Vector3() },
		motionVector: { type: 'v3', value: new THREE.Vector3() },
		ySpin: { type: 'f', value: 0 },
		yRot: { type: 'f', value: 0 },
		neonFade: { type: 'f', value: 0.62 },
		neonGlow: { type: 'f', value: 0.85 },
		neonFreq1: { type: 'f', value: 1.1 },
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
	"varying vec2 vUv;",
	"varying vec4 mPosition;",
	"varying vec4 mvPosition;",
	"varying vec3 vColor;",
	"uniform float time;",
	"uniform float curvature;",
	"uniform float size;",
	"#ifndef USE_COLOR",
	"	uniform vec3 color;",
	"#endif",
	"float PI = 3.141592653589793;",
	"#ifdef USE_SKINNING",
	"	uniform mat4 bindMatrix;",
	"uniform mat4 bindMatrixInverse;",
	"#ifdef BONE_TEXTURE",
	"  uniform sampler2D boneTexture;",
	"  uniform int boneTextureSize;",
	"  mat4 getBoneMatrix( const in float i ) {",
	"    float j = i * 4.0;",
	"    float x = mod( j, float( boneTextureSize ) );",
	"    float y = floor( j / float( boneTextureSize ) );",
	"    float dx = 1.0 / float( boneTextureSize );",
	"    float dy = 1.0 / float( boneTextureSize );",
	"    y = dy * ( y + 0.5 );",
	"    vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );",
	"    vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );",
	"    vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );",
	"    vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );",
	"    mat4 bone = mat4( v1, v2, v3, v4 );",
	"    return bone;",
	"  }",
	"#else",
	"  uniform mat4 boneMatrices[ MAX_BONES ];",
	"  mat4 getBoneMatrix( const in float i ) {",
	"    mat4 bone = boneMatrices[ int(i) ];",
	"    return bone;",
	"  }",
	"#endif",
	"#endif",
	"#ifdef USE_INSTANCING",
	"	attribute vec3 instancedTranslation;",
	"	attribute vec3 instancedScale;",
	"#endif",
	"void main() {",
	"	vUv = uv;",
	"	vColor = color;",
	"	vec3 pos = vec3( position );",
	"	#ifdef USE_SKINNING",
	"		/* skinbase_vertex */",
	"mat4 boneMatX = getBoneMatrix( skinIndex.x );",
	"mat4 boneMatY = getBoneMatrix( skinIndex.y );",
	"mat4 boneMatZ = getBoneMatrix( skinIndex.z );",
	"mat4 boneMatW = getBoneMatrix( skinIndex.w );",
	"vec4 skinVertex = bindMatrix * vec4( position.xyz, 1.0 );",
	"vec4 skinned = vec4( 0.0 );",
	"skinned += boneMatX * skinVertex * skinWeight.x;",
	"skinned += boneMatY * skinVertex * skinWeight.y;",
	"skinned += boneMatZ * skinVertex * skinWeight.z;",
	"skinned += boneMatW * skinVertex * skinWeight.w;",
	"pos = ( bindMatrixInverse * skinned ).xyz;",
	"	#endif",
	"	#ifdef USE_GRASS",
	"		float pct = clamp( pos.y, 0.0, 1.0 );",
	"		float taper = sin( pow( pct, 0.5 ) * PI );",
	"		pos.x *= taper;",
	"		pos.z *= taper;",
	"	#endif",
	"	#ifdef USE_ROAD",
	"		float x = pos.x / size;",
	"		float y = pos.y / size;",
	"		float x2 = x * 2.0;",
	"		float y2 = y * 2.0;",
	"		float dist = curvature * sqrt( x2 * x2 + y2 * y2 );",
	"		pos.z = size * ( dist * dist ) / 2.0;",
	"	#endif",
	"	#ifdef USE_WAVE",
	"		vec4 t = projectionMatrix * vec4( 1.0 );",
	"		float osc = ( 1.0 + sin( time + PI * ( t.x + t.y + t.z ) / 3.0 ) ) / 2.0;",
	"		float sway = pow( pos.y, 2.0 ) * osc;",
	"		pos.x += sway / 100.0;",
	"	#endif",
	"	#ifdef USE_INSTANCING",
	"		pos *= instancedScale;",
	"		pos += instancedTranslation;",
	"	#endif",
	"	mPosition = modelMatrix * vec4( pos, 1.0 );",
	"	mvPosition = viewMatrix * mPosition;",
	"	gl_Position = projectionMatrix * mvPosition;",
	"}",
].join( '\n' );
// NOTE: Uncomment line below to use glsl shader source.
// THREE.neonShader._vert = THREE.neonShader.load( '../release/src/shaders/vert.glsl' );

THREE.neonShader._frag = [
	"const float PI = 3.141592653589793;",
	"uniform vec3 fogColor;",
	"uniform float fogNear;",
	"uniform float fogFar;",
	"uniform float sepia;",
	"uniform vec3 sepiaCol1;",
	"uniform vec3 sepiaCol2;",
	"uniform vec3 neonCol;",
	"uniform float saturation;",
	"uniform float neon;",
	"uniform float time;",
	"uniform float size;",
	"uniform vec3 cursor;",
	"uniform vec2 clip;",
	"uniform float yRot;",
	"uniform float progress;",
	"varying vec2 vUv;",
	"varying vec3 vColor;",
	"varying vec4 mPosition;",
	"varying vec4 mvPosition;",
	"uniform mat4 projectionMatrix;",
	"uniform float neonFade;",
	"uniform float neonGlow;",
	"uniform float neonFreq1;",
	"uniform float neonFreq2;",
	"uniform float neonNearClip;",
	"vec3 sepiaColor( vec3 col ) {",
	"	float amount = 2.0;",
	"	vec4 clipSpace = projectionMatrix * mvPosition;",
	"	vec2 coord = ( clipSpace.xyz / clipSpace.w ).xy;",
	"	float radius = length( ( coord )  ) / 1.3;",
	"	float magnitude = ( 1.0 - radius ) * ( amount - 1.0 );",
	"	vec3 layer = mix( sepiaCol2.rgb * 2.0, sepiaCol1.rgb, clamp( magnitude, 0.0, 1.0 ) );",
	"	return  col - layer * 0.1 * sepia;",
	"}",
	"vec3 neonFog( vec3 col ) {",
	"	#ifdef USE_MIRROR_FOG",
	"		float md = 6.5;",
	"		vec2 mPos = mPosition.xz;",
	"		mPos.x = mod( mPos.x + md / 2.0, md ) - ( md / 2.0 );",
	"		float fogDepth = length( mPos );",
	"	#else",
	"		float fogDepth = length( mPosition.xz );",
	"	#endif",
	"	float fogFactor = smoothstep( fogNear, fogFar, fogDepth );",
	"	return  mix( col, fogColor, fogFactor );",
	"}",
	"mat3 rotateY( float rad ) {",
	"	float c = cos( rad );",
	"	float s = sin( rad );",
	"	return mat3(",
	"		c, 0.0, -s,",
	"		0.0, 1.0, 0.0,",
	"		s, 0.0, c",
	"	);",
	"}",
	"float neonNoise( vec3 pos ) {",
	"	float dist = sin( pos.x * 0.32 ) + sin( pos.y * 0.26 ) + sin( pos.z * 0.45 ) +",
	"		sin( pos.x * 0.078 ) + sin( pos.y * 0.089 ) + sin( pos.z * 0.091 ) +",
	"		sin( pos.x * 0.12 ) + sin( pos.y * 0.34 ) + sin( pos.z * 0.23 ) +",
	"		sin( sqrt( pos.x * pos.x + pos.y * pos.y + pos.z * pos.z ) * 0.5 );",
	"	float f = dist * neonFreq2;",
	"	return abs( sin( f ) );",
	"}",
	"vec3 neonFunc( vec3 col ) {",
	"	vec3 p = rotateY( - yRot ) * ( mPosition.xyz ) + cursor / neonFreq1;",
	"	float neonFactor = neonNoise( p * neonFreq1 );",
	"	float neonFactorFade = smoothstep( min( 2.0 * ( neonFade * neon ) - 1.0, 1.0 ), 1.0, neonFactor );",
	"	vec3 nCol = mix( col * neonCol * 6.0 + neonCol * 2.0, col, pow( neonFactorFade, 5.2 * neonGlow ) );",
	"	nCol = mix( fogColor, nCol, pow( neonFactorFade, 3.0 ) );",
	"	col = mix( col, nCol, neon );",
	"	return col;",
	"}",
	"#ifndef USE_COLOR",
	"	uniform vec3 color;",
	"#endif",
	"#ifdef USE_ROAD",
	"	uniform float subdivisions;",
	"uniform vec3 median;",
	"vec3 roadFunc() {",
	"	/*",
	"	float threshold = 6.0 / size;",
	"	vec2 wUv = vec2( mPosition.zx ) / size - vec2( 0.5 );",
	"	vec2 rCursor = cursor.zx / size;",
	"	vec2 pos = rCursor + wUv;",
	"	pos = mod( subdivisions * pos, 1.0 );",
	"	vec2 isMedian = vec2( sin( pos * PI ) );",
	"	vec2 isIntersection = vec2( 1.0 - isMedian.y, 1.0 - isMedian.x );",
	"	isMedian = step( vec2( threshold ), isMedian );",
	"	isIntersection = step( vec2( 0.66 ), isIntersection );",
	"	float t = clamp( isMedian.x + isIntersection.x, 0.0, 1.0 );",
	"	vec3 layer = mix( median, color, t );",
	"	t = clamp( isMedian.y + isIntersection.y, 0.0, 1.0 );",
	"	layer = mix( median, layer, t );",
	"	return layer;",
	"	*/",
	"	return color;",
	"}",
	"#endif",
	"void main() {",
	"	vec3 col = vColor;",
	"	#ifdef USE_CLIPPING",
	"		if ( mPosition.y < clip.x * 2.0 || mPosition.y > clip.y * 2.0 ) discard;",
	"	#endif",
	"	#ifdef USE_GRASS",
	"		col = mix( vec3( 0.55, 0.98, 0.45 ), vec3( 0.559, 0.776, 0.247 ), abs( vUv.y ) );",
	"	#endif",
	"	#ifdef USE_ROAD",
	"		col = roadFunc();",
	"	#endif",
	"	#ifdef USE_FAKE_SHADOW",
	"		float dist = min( length( mPosition.xyz ) * .06, 1.0 );",
	"		float shadow = smoothstep( 0.09, 0.15, pow( dist, 0.5 ) );",
	"		col = mix( col * 0.75, col, shadow );",
	"	#endif",
	"	col = mix( vec3( length( col ) * 0.75 ), col, saturation );",
	"	#ifndef DONTUSE_NEON",
	"		col = neonFunc( col );",
	"	#endif",
	"	#ifdef USE_FOG",
	"		col = neonFog( col );",
	"	#endif",
	"	col = sepiaColor( col );",
	"	#ifdef USE_SWIRL",
	"		float p = min( progress, 1.0 - progress ) * 2.0;",
	"		float l = length( ( ( vUv + vec2( 0.0, progress - 0.5 ) ) * 2.0 - vec2( 1.0 ) ) / vec2( 1.0, p ) );",
	"		col = vec3( 1.0 - min( l, 1.0 ) ) * p;",
	"	#endif",
	"	gl_FragColor = vec4( col, 1.0 );",
	"}",
].join( '\n' );
// NOTE: Uncomment line below to use glsl shader source.
// THREE.neonShader._frag = THREE.neonShader.load( '../release/src/shaders/frag.glsl' );

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
	defines: {
		USE_MIRROR_FOG: ''
	},
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
THREE.neonShader.swirlShader.defines = { USE_SWIRL: '', DONTUSE_NEON: '' };
THREE.neonShader.swirlShader.transparent = true;
THREE.neonShader.swirlShader.depthWrite = false;
THREE.neonShader.swirlShader.fog = false;
THREE.neonShader.swirlShader.side = THREE.DoubleSide;
THREE.neonShader.swirlShader.blending = THREE.AdditiveBlending;


THREE.neonShader.floorShader = THREE.neonShader.basicShader.clone();
THREE.neonShader.floorShader.defines = { USE_FAKE_SHADOW: '' };
THREE.neonShader.floorShader.uniforms.color.value.set( 0x08FA82 );

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

THREE.neonShader.hallway = THREE.neonShader.vertexColoredDoubleSided.clone();
THREE.neonShader.hallway.defines.USE_MIRROR_FOG = '';

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
