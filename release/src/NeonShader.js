THREE.neonShader = {}

THREE.neonShader.loadTextFile = function(url) {
	var result;
	var req = new XMLHttpRequest();
	req.onerror = function() {
		console.log("Error: request error on " + url);
	};
	req.onload = function() {
		result = this.responseText;
	};
	req.open("GET", url, false);
	req.send();
	return result;
};

THREE.neonShader.loadTextFileInject = function(url) {
	var fileStr = THREE.neonShader.loadTextFile(url);
	var matches = fileStr.match(/#inject .+/g);
	if (!matches) return fileStr;
	for (var i = 0; i < matches.length; i++) {
		var injectLine = matches[i];
		var injectUrl = injectLine.split(" ")[1];
		var injectFileStr = THREE.neonShader.loadTextFileInject(injectUrl);
		fileStr = fileStr.replace(injectLine, injectFileStr);
	}
	return fileStr;
};

THREE.neonShader.load = function(url) {
	var src = THREE.neonShader.loadTextFileInject(url);
	var lines = src.match(/.+/g);
	var srcFormatted = '';
	for (var i = 0; i < lines.length; i++) {
		var line = '"' + lines[i] + '",';
		srcFormatted += line;
		srcFormatted += '\r\n';
	}
	// console.log(url, ':\n');
	// console.log(srcFormatted);
	// console.log('\n');
	return src;
}

THREE.neonShader._vert = [
	"varying vec2 vUv;",
	"varying vec4 mPosition;",
	"varying vec4 mvPosition;",
	"varying vec3 vColor;",
	"void main() {",
	"  vUv = uv;",
	"  #ifdef USE_COLOR",
	"    vColor = color;",
	"  #elseif",
	"    vColor = vec3(0.0);",
	"  #endif",
	"  mPosition = modelMatrix * vec4( position, 1.0 );",
	"  mvPosition = viewMatrix * mPosition;",
	"  gl_Position = projectionMatrix * mvPosition;",
	"}"
].join('\n');
THREE.neonShader._vert = THREE.neonShader.load('../release/src/shaders/_vert.glsl');

THREE.neonShader.backdropShader = new THREE.ShaderMaterial({
	uniforms: {
		offset: { type: 'f', value: 0.5 },
		color: { type: 'c', value: new THREE.Color( 0xffffff ) },
		fogColor: { type: 'c', value: new THREE.Color( 0x333333 ) },
		fogNear: { type: 'f', value: 0 },
		fogFar: { type: 'f', value: 1 },
		neon: { type: 'f', value: 0 },
		time: { type: 'f', value: 0 },
		cursor: { type: "v2", value: new THREE.Vector2() },
		saturation: { type: 'f', value: 1 }
	},
	vertexShader: THREE.neonShader._vert,
	fragmentShader: [
	].join('\n'),
	fragmentShader: THREE.neonShader.load('../release/src/shaders/backdrop.frag.glsl')
});

THREE.neonShader.floorShader = new THREE.ShaderMaterial({
	uniforms: {
		size: { type: 'f', value: 1 },
		color: { type: 'c', value: new THREE.Color( 0xffffff ) },
		fogColor: { type: 'c', value: new THREE.Color( 0x333333 ) },
		fogNear: { type: 'f', value: 0 },
		fogFar: { type: 'f', value: 1 },
		neon: { type: 'f', value: 0 },
		time: { type: 'f', value: 0 },
		cursor: { type: "v2", value: new THREE.Vector2() },
		saturation: { type: 'f', value: 1 }
	},
	vertexShader: THREE.neonShader._vert,
	fragmentShader: [
	].join('\n'),
	fragmentShader: THREE.neonShader.load('../release/src/shaders/floor.frag.glsl')
});

THREE.neonShader.grassShader = new THREE.ShaderMaterial({
	defines: {
		'USE_GRASS': '' // TODO: defines broken?
	},
	uniforms: {
		size: { type: 'f', value: 1 },
		base: { type: 'c', value: new THREE.Color( 0xffffff ) },
		color: { type: 'c', value: new THREE.Color( 0x8cc63f ) },
		neon: { type: 'f', value: 0 },
		time: { type: 'f', value: 0 },
		cursor: { type: "v2", value: new THREE.Vector2() },
		fogColor: { type: 'c', value: new THREE.Color() },
		fogNear: { type: 'f', value: 0 },
		fogFar: { type: 'f', value: 1 },
		saturation: { type: 'f', value: 1 }
	},
	vertexShader: '#define USE_GRASS\r\n' + THREE.neonShader._vert,
	fragmentShader: [
	].join('\n'),
	fragmentShader: THREE.neonShader.load('../release/src/shaders/grass.frag.glsl')
});

THREE.neonShader.neonBasicShader = new THREE.ShaderMaterial({
	side: THREE.DoubleSide,
	vertexColors: THREE.VertexColors,
	uniforms: {
		fogColor: { type: 'c', value: new THREE.Color('#333') },
		fogNear: { type: 'f', value: 0 },
		fogFar: { type: 'f', value: 50 },
		neon: { type: "f", value: 0 },
		time: { type: 'f', value: 0 },
		cursor: { type: "v2", value: new THREE.Vector2() },
		saturation: { type: "f", value: 1 }
	},
	vertexShader: THREE.neonShader._vert,
	fragmentShader: [
	].join('\n'),
	fragmentShader: THREE.neonShader.load('../release/src/shaders/neonBasic.frag.glsl')
});

THREE.neonShader.roadShader = new THREE.ShaderMaterial({
	defines: {
		'USE_ROAD': '' // TODO: defines broken?
	},
	uniforms: {
		subdivisions: { type: 'f', value: 32 },
		curvature: { type: 'f', value: 1 },
		size: { type: 'f', value: 1 },
		neon: { type: 'f', value: 0 },
		time: { type: 'f', value: 0 },
		cursor: { type: "v2", value: new THREE.Vector2() },
		median: { type: 'c', value: new THREE.Color( 'red' ) },
		color: { type: 'c', value: new THREE.Color( 0xffffff ) },
		fogColor: { type: 'c', value: new THREE.Color( 0x333333 ) },
		fogNear: { type: 'f', value: 0 },
		fogFar: { type: 'f', value: 1 },
		saturation: { type: 'f', value: 1 }
	},
	vertexShader: '#define USE_ROAD\r\n' + THREE.neonShader._vert,
	fragmentShader: [
	].join('\n'),
	fragmentShader: THREE.neonShader.load('../release/src/shaders/road.frag.glsl'),
});

THREE.neonShader.sepiaShader = new THREE.ShaderMaterial({
	uniforms: {
		opacist: { type: 'f', value: 1 }
	},
	vertexShader: THREE.neonShader._vert,
	fragmentShader: [
	].join('\n'),
	fragmentShader: THREE.neonShader.load('../release/src/shaders/sepia.frag.glsl'),
});

THREE.neonShader.skinnedShader = new THREE.ShaderMaterial({
	uniforms: {
		fogColor: { type: 'c', value: new THREE.Color() },
		fogNear: { type: 'f', value: 0 },
		fogFar: { type: 'f', value: 50 },
		clipy: { type: 'v2', value: new THREE.Vector2(-1e10, 1e10) },
		neon: { type: 'f', value: 0 },
		time: { type: 'f', value: 0 },
		cursor: { type: "v2", value: new THREE.Vector2() },
		saturation: { type: 'f', value: 1 }
	},
	vertexShader: [
	].join('\n'),
	fragmentShader: [
	].join('\n'),
	vertexShader: THREE.neonShader.load('../release/src/shaders/skinned.vert.glsl'),
	fragmentShader: THREE.neonShader.load('../release/src/shaders/skinned.frag.glsl')
});

THREE.neonShader.waveShader = new THREE.ShaderMaterial({
	defines: {
		'USE_WAVE': '' // TODO: defines broken?
	},
	uniforms: {
		fogColor: { type: 'c', value: new THREE.Color() },
		fogNear: { type: 'f', value: 0 },
		fogFar: { type: 'f', value: 1 },
		neon: { type: 'f', value: 0 },
		time: { type: 'f', value: 0 },
		cursor: { type: "v2", value: new THREE.Vector2() },
		saturation: { type: 'f', value: 1 }
	},
	vertexShader: '#define USE_WAVE\r\n' + THREE.neonShader._vert,
	fragmentShader: [
	].join('\n'),
	fragmentShader: THREE.neonShader.load('../release/src/shaders/wave.frag.glsl')
});
