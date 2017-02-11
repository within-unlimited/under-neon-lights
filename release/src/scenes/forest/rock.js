(function() {

  var Rock = Forest.Rock = function(cursor, stage, wind) {

    Rock.Instances.push(this);

    var geometry = Rock.Geometry;
    var material = Rock.Instances.length <= 1
      ? Rock.Material : Rock.Material.clone();

    THREE.Mesh.call(this, geometry, material);

    this.material.uniforms.stage.value = stage;
    this.material.uniforms.cursor.value = cursor;
    this.material.uniforms.wind.value = wind;

    this.material.uniforms.lopsided.value = Math.random() + 1;


  };

  Rock.prototype = Object.create(THREE.Mesh.prototype);
  Rock.prototype.constructor = Rock;

  Rock.Instances = [];

  var resolution = has.mobile ? 0.5 : 1;

  Rock.Geometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 1, 16 * resolution, 16 * resolution, true);
  Rock.Material = new THREE.ShaderMaterial({

    // wireframe: true,

    uniforms: {

      stage: { type: 'v2', value: new THREE.Vector2(Forest.defaultSize, Forest.defaultSize) },
      cursor: { type: 'v3', value: new THREE.Vector3() },
      wind: { type: 'v3', value: new THREE.Vector3(1, 0, 1) },

      size: { type: 'f', value: 10 },
      origin: { type: 'vec2', value: new THREE.Vector2() }, // Math.random() - 0.5

      sharp: { type: 'f', value: 0.33 },
      lopsided: { type: 'f', value: 2 },

      top: { type: 'c', value: new THREE.Color(0xcccccc) },
      bottom: { type: 'c', value: new THREE.Color(0x444444) },
      fog: { type: 'c', value: new THREE.Color(0x000000) }

    },

    vertexShader: [

      'precision highp float;',

      ['const float TWO_PI = ', Math.PI * 2, ';'].join(''),
      ['const float PI = ', Math.PI, ';'].join(''),

      'uniform vec2 stage;',
      'uniform vec3 cursor;',
      'uniform vec3 wind;',

      'uniform float size;',
      'uniform vec2 origin;',

      'uniform float sharp;',
      'uniform float lopsided;',

      'varying vec2 vUv;',
      'varying vec2 placement;',

      'float displace(float x) {',
        Forest.DisplacementAlgorithm.toString()
          .replace(/[\n\r]/ig, '')
          .replace(/\s+/ig, ' ')
          .replace(/Math.sin/ig, 'sin')
          .replace(/^.*(return\s.*)\s\}$/, '$1'),
      '}',

      'void main() {',

        'vUv = uv;',

        'vec3 pos = vec3( position );',
        'float y = pos.y + 0.5;',
        'float pct = y;',
        'float taper = pow( sin( pow( 1.0 - pct, lopsided ) * PI ), sharp );',
        'pos.xz *= taper;',

        'vec3 p = vec3( 0.0 );',
        'p.x = mod( origin.x - cursor.x / TWO_PI + 0.5, 1.0 ) - 0.5;',
        'p.z = mod( origin.y - cursor.y / TWO_PI + 0.5, 1.0 ) - 0.5;',

        'p.y = displace( p.x * TWO_PI + cursor.x ) * displace( p.z * TWO_PI + cursor.y );',
        'p.y -= displace( cursor.x ) * displace( cursor.y );',

        'placement = vec2( p.xz );',
        // 'float proximity = pow( 1.0 - distance( vec2( 0.0 ), placement ), 24.0 );',

        // 'pos.y += 0.2;',

        'p.xz *= stage;',
        'p.y *= 0.125 * ( stage.x + stage.y ) / 2.0;',

        'pos *= size * 0.66;',

        'pos.x += p.x;',
        'pos.y += p.y;',
        'pos.z -= p.z;',

        'gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );',

      '}'

    ].join('\n'),

    fragmentShader: [

      'precision highp float;',

      'uniform vec3 top;',
      'uniform vec3 bottom;',
      'uniform vec3 fog;',

      'varying vec2 vUv;',
      'varying vec2 placement;',

      'void main() {',

        'vec2 origin = vec2( 0.0 );',

        'vec3 layer = mix( bottom, top, vUv.y );',
        'float t = 1.0 - 2.0 * distance( placement, origin );',
        'layer = mix( fog, layer, t );',

        'gl_FragColor = vec4( layer, 1.0 );',

      '}'

    ].join('\n')

  });

  // Weighting
  (function() {
    for (var i = 0; i < 1; i++) {
      Forest.register(Rock);
    }
  })();

})();
