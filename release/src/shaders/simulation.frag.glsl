varying vec2 vUv;

uniform sampler2D tInit;
uniform sampler2D tPrevPos;
uniform sampler2D tPrevCol;
uniform float fPass;
uniform float fTarget;
uniform mat4 mProjectionMatrix;
uniform mat4 mModelViewMatrix;

uniform float fTime;
uniform float fTimeDelta;

#inject /release/src/shaders/chunks/Rand.glsl
#inject /release/src/shaders/chunks/FloatPack.glsl
#inject /release/src/shaders/chunks/NoiseFuncs.glsl

void main() {
  float d = fTimeDelta;

  vec2 uv = vUv;
  float tail = mod(uv.y * SIZE * TAIL_SIZE, TAIL_SIZE) / TAIL_SIZE;
  uv.y = uv.y - tail / SIZE;

  vec4 pos = texture2D(tPrevPos, vUv);
  vec4 col = texture2D(tPrevCol, vUv);
  vec4 pos0 = texture2D(tPrevPos, uv);

  float tailNorm = 2.0 - tail;
  vec2 uvBiased = (uv - vec2(0.5)) * rand(uv + vec2(fTime, fTimeDelta)) + vec2(0.5);

  vec4 posInit = texture2D(tInit, uvBiased);
  vec4 sPosInit = mProjectionMatrix * mModelViewMatrix * vec4(posInit.xyz, 1.0);
  if (length(posInit.xyz) == 0.0) {
    posInit.a = 0.0;
  } else {
    posInit.xyz += curlNoise(uv.xyx * 1000.0) * 0.1 * (0.1 + 0.04 * sPosInit.z);
    /*vec3 attractor = posInit.xyz - pos.xyz;*/
    /*pos.xyz += attractor * 0.5 * d;*/
  }

  float speed = 0.1;
  float len = 230.0;

  if (pos0.a <= 0.0) {
    pos = posInit;
    col = floatToVec4(pos.a);
    col.rgb *= 0.2 + 0.8 * rand(vec2(uv.y, col.b));
    pos.a = tailNorm - rand(uv.yx);
  } else if (pos.a < (tailNorm) && pos.a > 1.0) {
    pos.xyz += curlNoise((pos.xyz + vec3(0.0, fTime * 0.5, 0.0)) * 0.3) * 0.125 * d * speed * len;
  }

  pos.xyz += snoiseVec3((pos.xyz + vec3(0.0, fTime * 0.3, 0.0)) * 0.1) * 3.3 * d * speed;

  pos.a -= 0.05 * speed;

  gl_FragColor = (fTarget == 0.0) ? pos : col;
}
