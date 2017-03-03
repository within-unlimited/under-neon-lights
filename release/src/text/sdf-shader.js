var SDFShader = {

  uniforms: {
    map: { type: 't', value: null },
    color: { type: 'v3', value: new THREE.Color('#fff') },
    smoothing: { type: 'f', value: 0.1 },
    threshold: { type: 'f', value: 0.5 },
    outlineDistance: { type: 'f', value: 0.3 },
    outlineColor: { type: 'v3', value: new THREE.Color('#000') },
  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",
      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"

  ].join('\n'),

  // outline
  // https://github.com/libgdx/libgdx/wiki/Distance-field-fonts#adding-an-outline
  // http://stackoverflow.com/questions/26155614/outlining-a-font-with-a-shader-and-using-distance-field

  fragmentShader: [

    "varying vec2 vUv;",

    "uniform sampler2D map;",
    "uniform vec3 color;",

    "uniform float smoothing;",
    "uniform float threshold;",

    "uniform float outlineDistance;", // Between 0 and 0.5, 0 = thick outline, 0.5 = no outline
    "uniform vec3 outlineColor;",

    "void main() {",
      "float distance = texture2D( map, vUv ).a;",

      // no outline
      // "float alpha = smoothstep( threshold - smoothing, threshold + smoothing, distance );",
      // "gl_FragColor = vec4( color, alpha );",

      // outline
      "float outlineFactor = smoothstep(threshold - smoothing, threshold + smoothing, distance);", // change 0.5 to threshold?
      "vec3 color2 = mix(outlineColor, color, outlineFactor);",
      "float alpha = smoothstep(outlineDistance - smoothing, outlineDistance + smoothing, distance);",
      "gl_FragColor = vec4( color2, alpha );",
    "}"

  ].join('\n')

};
