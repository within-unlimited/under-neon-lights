(function() {

  var TWO_PI = Math.PI * 2;
  var HALF_PI = Math.PI / 2;

  var Floor = Forest.Floor = function(cursor, stage) {

    Floor.Instances.push(this);

    var geometry = Floor.Geometry;
    var material = Floor.Instances.length <= 1
      ? Floor.Material : Floor.Material.clone();

    THREE.Mesh.call(this, geometry, material);
    this.rotation.x = - Math.PI / 2;

    this.material.uniforms.stage.value = stage;
    this.material.uniforms.cursor.value = cursor;

  };

  Floor.prototype = Object.create(THREE.Mesh.prototype);
  Floor.prototype.constructor = Floor;

  Floor.Instances = [];

  var resolution = has.mobile ? 0.5 : 1;

  Floor.Geometry = new THREE.PlaneBufferGeometry(1, 1, 128 * resolution, 128 * resolution);
  Floor.Material = new THREE.ShaderMaterial({

    // wireframe: true,

    uniforms: {

      stage: { type: 'v2', value: new THREE.Vector2(Forest.defaultSize, Forest.defaultSize) },
      cursor: { type: 'v3', value: new THREE.Vector3() },

      color: { type: 'c', value: new THREE.Color(0x8cc63f) },
      fog: { type: 'c', value: new THREE.Color(0x000000) }

    },

    vertexShader: [

      'precision highp float;',

      ['const float TWO_PI = ', TWO_PI, ';'].join(''),
      ['const float PI = ', Math.PI, ';'].join(''),

      'uniform vec2 stage;',
      'uniform vec3 cursor;',

      'varying vec2 vUv;',

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

        'pos.z = displace( pos.x * TWO_PI + cursor.x ) * displace( pos.y * TWO_PI + cursor.y );',
        // Offset character position
        // 'pos.z -= displace( cursor.x ) * displace( cursor.y );',
        'pos.z *= abs( distance( pos.xy, vec2( 0.0 ) ) ) - 0.125;',

        'pos.xy *= stage;',
        'pos.z *= 0.75 * ( stage.x + stage.y ) / 2.0;',

        'gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );',

      '}'

    ].join('\n'),

    fragmentShader: [

      'precision highp float;',

      'uniform vec3 color;',
      'uniform vec3 fog;',

      'varying vec2 vUv;',

      'void main() {',

        'vec2 origin = vec2( 0.5, 0.5 );',
        'float t = 1.0 - 2.0 * distance( vUv, origin );',

        'vec3 c = mix( fog, color, t );',
        'gl_FragColor = vec4( c, 1.0 );',

      '}'

    ].join('\n')

  });

})();
