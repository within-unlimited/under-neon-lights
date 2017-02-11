(function() {

  var Mushroom = Forest.Mushroom = function(cursor, stage, wind) {

    Mushroom.Instances.push(this);

    var geometry = Mushroom.Geometry;
    var material = Mushroom.Instances <= 1
      ? Mushroom.Material : Mushroom.Material.clone();

    THREE.Mesh.call(this, geometry, material);

    this.material.uniforms.stage.value = stage;
    this.material.uniforms.cursor.value = cursor;
    this.material.uniforms.wind.value = wind;

    this.material.uniforms.age.value = Math.random() * Math.PI * 2;

  };

  Mushroom.prototype = Object.create(THREE.Mesh.prototype);
  Mushroom.prototype.constructor = Mushroom;

  Mushroom.Instances = [];

  var resolution = has.mobile ? 0.5 : 1;

  Mushroom.Geometry = new THREE.SphereBufferGeometry(0.5, 16 * resolution, 24 * resolution);
  Mushroom.Material = new THREE.ShaderMaterial({

    // wireframe: true,

    uniforms: {

      stage: { type: 'v2', value: new THREE.Vector2(Forest.defaultSize, Forest.defaultSize) },
      cursor: { type: 'v3', value: new THREE.Vector3() },
      wind: { type: 'v3', value: new THREE.Vector3(1, 0, 1) },

      age: { type: 'f', value: Math.PI / 4 }, // 0 - Math.PI * 2

      size: { type: 'f', value: 10 },
      origin: { type: 'vec2', value: new THREE.Vector2() }, // Math.random() - 0.5

      top: { type: 'c', value: new THREE.Color(0xff3333) },
      bottom: { type: 'c', value: new THREE.Color(0xffe1c8) },
      fog: { type: 'c', value: new THREE.Color(0x000000) }

    },

    vertexShader: [

      'precision highp float;',

      ['const float TWO_PI = ', Math.PI * 2, ';'].join(''),
      ['const float PI = ', Math.PI, ';'].join(''),

      'uniform vec2 stage;',
      'uniform vec3 cursor;',
      'uniform vec3 wind;',

      'uniform float age;',

      'uniform float size;',
      'uniform vec2 origin;',

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

        'vec3 direction = normalize( position );',
        'float length = length( position );',
        'float phi = 10.0;',

        'float time = cursor.z * 2.0;',
        'vec3 pos = direction * ( length + length * sin( position.y * phi + age + time ) / 4.0 );',

        'float taper = 0.6 * step( 0.5, pos.y + 0.5 ) + 0.4;',
        'pos.xz *= taper;',

        'vec3 p = vec3( 0.0 );',
        'p.x = mod( origin.x - cursor.x / TWO_PI + 0.5, 1.0 ) - 0.5;',
        'p.z = mod( origin.y - cursor.y / TWO_PI + 0.5, 1.0 ) - 0.5;',

        'p.y = displace( p.x * TWO_PI + cursor.x ) * displace( p.z * TWO_PI + cursor.y );',
        'p.y -= displace( cursor.x ) * displace( cursor.y );',

        'placement = vec2( p.xz );',

        'pos.y += 0.45;',

        'p.xz *= stage;',
        'p.y *= 0.125 * ( stage.x + stage.y ) / 2.0;',

        'pos *= size * 0.5;',

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

        'vec3 layer = mix( bottom, top, pow( vUv.y, 2.0 ) );',
        'float t = 1.0 - 2.0 * distance( placement, origin );',
        'layer = mix( fog, layer, t );',

        'gl_FragColor = vec4( layer, 1.0 );',

      '}'

    ].join('\n')

  });

  // Weighting
  (function() {
    for (var i = 0; i < 1; i++) {
      Forest.register(Mushroom);
    }
  })();

})();
