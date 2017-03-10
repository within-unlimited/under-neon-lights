THREE.neonShader = {};

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
  var regex = /#inject .+/g;
  var fileStr = THREE.neonShader.loadTextFile(url);
  var matches = fileStr.match(regex);
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
  let src = THREE.neonShader.loadTextFileInject(url).replace(/(?:\r\n|\r|\n)/g, ' ');;
  console.log(url, ':\n', src);
  return src;
}

THREE.neonShader.worldPositionShader = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  vertexColors: THREE.VertexColors,
  // vertexShader: THREE.neonShader.load('../release/src/shaders/worldPosition.vert.glsl'),
  // fragmentShader: THREE.neonShader.load('../release/src/shaders/worldPosition.frag.glsl'),
  vertexShader: 'varying vec3 vColor; varying vec4 vPos;  void main() {   vColor = color;   vPos = modelMatrix * vec4( position, 1.0 );   vec4 mvPosition = viewMatrix * vPos;   gl_Position = projectionMatrix * mvPosition; }',
  fragmentShader: '/* Pack float4 into single float */  /* http://stackoverflow.com/questions/30242013/glsl-compressing-packing-multiple-0-1-colours-var4-into-a-single-var4-variab */  float vec4ToFloat(vec4 c) {   return 1.0/255.0 * (floor(c.r*255.0/64.0)*64.0 + floor(c.g*255.0/64.0)*16.0 + floor(c.b*255.0/64.0)*4.0 + floor(c.a*255.0/64.0)); }  vec4 floatToVec4(float x) {   float a = floor(x * 255.0 / 64.0) * 64.0 / 255.0;   x -= a;   float b = floor(x * 255.0 / 16.0) * 16.0 / 255.0;   x -= b;   b *= 4.0;   float c = floor(x * 255.0 / 4.0) * 4.0 / 255.0;   x -= c;   c *= 16.0;   float d = x * 255.0 * 64.0 / 255.0;   return vec4(a, b, c, d); }   varying vec3 vColor; varying vec4 vPos;  void main() {   vec3 col = vColor.rgb;   gl_FragColor = vec4(vPos.xyz, vec4ToFloat(vec4(col.rgb, 1.0))); } '
});

THREE.neonShader.particleShader = new THREE.ShaderMaterial({
  defines: {
    "POINT_SIZE": "2.0",
  },
  uniforms: {
    "tCurrPos": { type: "t", value: null },
    "tCurrCol": { type: "t", value: null }
  },
  vertexShader: 'uniform sampler2D tCurrPos; uniform sampler2D tCurrCol;  varying vec4 vColorPacked; varying float fLife;  void main() {   gl_PointSize = POINT_SIZE;   vec4 pos = texture2D(tCurrPos, position.yx);   fLife = pos.a;   vColorPacked = texture2D(tCurrCol, position.yx);   gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0); } ',
  fragmentShader: 'varying vec4 vColorPacked; varying float fLife;  /* Pack float4 into single float */  /* http://stackoverflow.com/questions/30242013/glsl-compressing-packing-multiple-0-1-colours-var4-into-a-single-var4-variab */  float vec4ToFloat(vec4 c) {   return 1.0/255.0 * (floor(c.r*255.0/64.0)*64.0 + floor(c.g*255.0/64.0)*16.0 + floor(c.b*255.0/64.0)*4.0 + floor(c.a*255.0/64.0)); }  vec4 floatToVec4(float x) {   float a = floor(x * 255.0 / 64.0) * 64.0 / 255.0;   x -= a;   float b = floor(x * 255.0 / 16.0) * 16.0 / 255.0;   x -= b;   b *= 4.0;   float c = floor(x * 255.0 / 4.0) * 4.0 / 255.0;   x -= c;   c *= 16.0;   float d = x * 255.0 * 64.0 / 255.0;   return vec4(a, b, c, d); }   void main() {   if (fLife < 0.0) {     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);     discard;   } else {     gl_FragColor = vColorPacked;   } }',
  // vertexShader: THREE.neonShader.load('../release/src/shaders/particle.vert.glsl'),
  // fragmentShader: THREE.neonShader.load('../release/src/shaders/particle.frag.glsl'),
});

THREE.neonShader.simulationShader = new THREE.ShaderMaterial({
  defines: {
      "SIZE": "0.0",
      "TAIL_SIZE": "0.0"
  },
  uniforms: {
      "tInit": { type: "t", value: null },
      "tPrevPos": { type: "t", value: null },
      "tPrevCol": { type: "t", value: null },
      "fPass": { type: "f", value: 0 },
      "fTarget": { type: "f", value: 0 },
      "fTime": { type: "f", value: 0 },
      "fTimeDelta": { type: "f", value: 0 },
      "fScale": { type: "f", value: 1 },
      "mProjectionMatrix": { type: "m", value: null },
      "mModelViewMatrix": { type: "m", value: null }
  },
  vertexShader: 'varying vec2 vUv;  void main() {   vUv = uv;   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 ); }',
  fragmentShader: 'varying vec2 vUv;  uniform sampler2D tInit; uniform sampler2D tPrevPos; uniform sampler2D tPrevCol; uniform float fPass; uniform float fTarget; uniform mat4 mProjectionMatrix; uniform mat4 mModelViewMatrix;  uniform float fTime; uniform float fTimeDelta; uniform float fScale;  /* source: http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl */ float rand(vec2 seed) {   return fract(sin(dot(seed.xy,vec2(12.9898,78.233))) * 43758.5453); }  /* Pack float4 into single float */  /* http://stackoverflow.com/questions/30242013/glsl-compressing-packing-multiple-0-1-colours-var4-into-a-single-var4-variab */  float vec4ToFloat(vec4 c) {   return 1.0/255.0 * (floor(c.r*255.0/64.0)*64.0 + floor(c.g*255.0/64.0)*16.0 + floor(c.b*255.0/64.0)*4.0 + floor(c.a*255.0/64.0)); }  vec4 floatToVec4(float x) {   float a = floor(x * 255.0 / 64.0) * 64.0 / 255.0;   x -= a;   float b = floor(x * 255.0 / 16.0) * 16.0 / 255.0;   x -= b;   b *= 4.0;   float c = floor(x * 255.0 / 4.0) * 4.0 / 255.0;   x -= c;   c *= 16.0;   float d = x * 255.0 * 64.0 / 255.0;   return vec4(a, b, c, d); }  /*  * Description : Array and textureless GLSL 2D/3D/4D simplex noise functions.  *      Author : Ian McEwan, Ashima Arts.  *  Maintainer : ijm  *     Lastmod : 20110822 (ijm)  *     License : Copyright (C) 2011 Ashima Arts. All rights reserved.  *               Distributed under the MIT License. See LICENSE file.  *               https://github.com/ashima/webgl-noise  */  vec4 _mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } vec3 _mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } vec2 _mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } float _mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; } vec4 _permute(vec4 x) { return _mod289(((x*34.0)+1.0)*x); } vec3 _permute(vec3 x) { return _mod289(((x*34.0)+1.0)*x); } float _permute(float x) { return _mod289(((x*34.0)+1.0)*x); } vec4 _taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; } float _taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }  vec4 _grad4(float j, vec4 ip) {   const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);   vec4 p,s;   p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;   p.w = 1.5 - dot(abs(p.xyz), ones.xyz);   s = vec4(lessThan(p, vec4(0.0)));   p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;   return p; } /*  * Implemented by Ian McEwan, Ashima Arts, and distributed under the MIT License.  {@link https://github.com/ashima/webgl-noise}  */ float snoise(vec2 v) {   const vec4 C = vec4(     0.211324865405187,     0.366025403784439,    -0.577350269189626,     0.024390243902439);    vec2 i  = floor(v + dot(v, C.yy) );   vec2 x0 = v -   i + dot(i, C.xx);    vec2 i1;   i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);   vec4 x12 = x0.xyxy + C.xxzz;   x12.xy -= i1;    i = _mod289(i);   vec3 p = _permute( _permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);   m = m*m ;   m = m*m ;    vec3 x = 2.0 * fract(p * C.www) - 1.0;   vec3 h = abs(x) - 0.5;   vec3 ox = floor(x + 0.5);   vec3 a0 = x - ox;    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );    vec3 g;   g.x  = a0.x  * x0.x  + h.x  * x0.y;   g.yz = a0.yz * x12.xz + h.yz * x12.yw;   return 130.0 * dot(m, g); }  float snoise(vec3 v) {   const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;   const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);    vec3 i  = floor(v + dot(v, C.yyy) );   vec3 x0 =   v - i + dot(i, C.xxx) ;    vec3 g = step(x0.yzx, x0.xyz);   vec3 l = 1.0 - g;   vec3 i1 = min( g.xyz, l.zxy );   vec3 i2 = max( g.xyz, l.zxy );    vec3 x1 = x0 - i1 + C.xxx;   vec3 x2 = x0 - i2 + C.yyy;   vec3 x3 = x0 - D.yyy;    i = _mod289(i);   vec4 p = _permute( _permute( _permute(     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))     + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))     + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));    float n_ = 0.142857142857;   vec3  ns = n_ * D.wyz - D.xzx;    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);    vec4 x_ = floor(j * ns.z);   vec4 y_ = floor(j - 7.0 * x_ );    vec4 x = x_ *ns.x + ns.yyyy;   vec4 y = y_ *ns.x + ns.yyyy;   vec4 h = 1.0 - abs(x) - abs(y);    vec4 b0 = vec4( x.xy, y.xy );   vec4 b1 = vec4( x.zw, y.zw );    vec4 s0 = floor(b0)*2.0 + 1.0;   vec4 s1 = floor(b1)*2.0 + 1.0;   vec4 sh = -step(h, vec4(0.0));    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;   vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;    vec3 p0 = vec3(a0.xy,h.x);   vec3 p1 = vec3(a0.zw,h.y);   vec3 p2 = vec3(a1.xy,h.z);   vec3 p3 = vec3(a1.zw,h.w);    vec4 norm = _taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));   p0 *= norm.x;   p1 *= norm.y;   p2 *= norm.z;   p3 *= norm.w;    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);   m = m * m;   return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) ); }  vec3 snoiseVec3( vec3 x ) {   float s  = snoise(vec3( x ));   float s1 = snoise(vec3( x.y - 19.1 , x.z + 33.4 , x.x + 47.2 ));   float s2 = snoise(vec3( x.z + 74.2 , x.x - 124.5 , x.y + 99.4 ));   vec3 c = vec3( s , s1 , s2 );   return c; }  vec3 curlNoise( vec3 p ) {   const float e = 1e-1;   vec3 dx = vec3( e   , 0.0 , 0.0 );   vec3 dy = vec3( 0.0 , e   , 0.0 );   vec3 dz = vec3( 0.0 , 0.0 , e   );    vec3 p_x0 = snoiseVec3( p - dx );   vec3 p_x1 = snoiseVec3( p + dx );   vec3 p_y0 = snoiseVec3( p - dy );   vec3 p_y1 = snoiseVec3( p + dy );   vec3 p_z0 = snoiseVec3( p - dz );   vec3 p_z1 = snoiseVec3( p + dz );    float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;   float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;   float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;    const float divisor = 1.0 / ( 2.0 * e );   return normalize( vec3( x , y , z ) * divisor ); }   void main() {   float d = fTimeDelta;    vec2 uv = vUv;   float tail = mod(uv.y * SIZE * TAIL_SIZE, TAIL_SIZE) / TAIL_SIZE;   uv.y = uv.y - tail / SIZE;    vec4 pos = texture2D(tPrevPos, vUv);   vec4 col = texture2D(tPrevCol, vUv);   vec4 pos0 = texture2D(tPrevPos, uv);    float tailNorm = 2.0 - tail;   vec2 uvRandomized = vec2(     0.5 + 2.0 * abs(uv.x - 0.5) * (rand(100.0 * (uv.xy + vec2(fTime, fTimeDelta))) - 0.5),     0.5 + 2.0 * abs(uv.y - 0.5) * (rand(100.0 * (uv.yx + vec2(fTimeDelta, fTime))) - 0.5)   );    vec4 posInit = texture2D(tInit, uvRandomized);   if (length(posInit.xyz) <= 0.01) {     posInit.a = 0.0;   } else {     posInit.xyz += curlNoise(uv.xyx * 1000.0) * 0.05;   }    float speed = 0.04;   float len = fScale * 50.0;    if (pos0.a <= 0.0 && posInit.a != 0.0) {     pos = posInit;     col = floatToVec4(pos.a);     col.rgb *= 0.2 + 0.8 * rand(vec2(uv.y, col.b));     pos.a = tailNorm - rand(uv.yx) * 1.0;   } else if (pos.a < (tailNorm) && pos.a > 1.0) {     float dist = max(1.0, 0.05 * length(pos.xyz));     vec3 force = curlNoise((pos.xyz + vec3(0.0, fTime * 0.5, 0.0)) * 0.3 / fScale / dist) * d * speed * len;     pos.xyz += force * dist;    }    pos.xyz += snoiseVec3((pos.xyz + vec3(0.0, fTime * 0.3, 0.0)) * 0.4 / fScale) * d * speed;    pos.a -= 0.5 * speed;    gl_FragColor = (fTarget == 0.0) ? pos : col; }',
  // vertexShader: THREE.neonShader.load('../release/src/shaders/simulation.vert.glsl'),
  // fragmentShader: THREE.neonShader.load('../release/src/shaders/simulation.frag.glsl'),
});

THREE.neonShader.chunks = {
  'floatPack': '/* Pack float4 into single float */  /* http://stackoverflow.com/questions/30242013/glsl-compressing-packing-multiple-0-1-colours-var4-into-a-single-var4-variab */  float vec4ToFloat(vec4 c) {   return 1.0/255.0 * (floor(c.r*255.0/64.0)*64.0 + floor(c.g*255.0/64.0)*16.0 + floor(c.b*255.0/64.0)*4.0 + floor(c.a*255.0/64.0)); }  vec4 floatToVec4(float x) {   float a = floor(x * 255.0 / 64.0) * 64.0 / 255.0;   x -= a;   float b = floor(x * 255.0 / 16.0) * 16.0 / 255.0;   x -= b;   b *= 4.0;   float c = floor(x * 255.0 / 4.0) * 4.0 / 255.0;   x -= c;   c *= 16.0;   float d = x * 255.0 * 64.0 / 255.0;   return vec4(a, b, c, d); }',
  'rand': '/* source: http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl */ float rand(vec2 seed) {   return fract(sin(dot(seed.xy,vec2(12.9898,78.233))) * 43758.5453); }'
}
