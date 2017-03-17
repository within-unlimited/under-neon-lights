varying vec2 vUv;

uniform sampler2D tInit;
uniform sampler2D tPrevPos;
uniform sampler2D tPrevCol;
uniform float fPass;
uniform float fTarget;
uniform vec3 vMotionVector;
uniform mat4 mProjectionMatrix;
uniform mat4 mModelViewMatrix;

uniform float fTime;
uniform float fTimeDelta;
uniform float fScale;
uniform float fEmissionRate;

#inject ../release/src/shaders/chunks/Rand.glsl
#inject ../release/src/shaders/chunks/FloatPack.glsl
#inject ../release/src/shaders/chunks/NoiseFuncs.glsl

void main() {
  float d = fTimeDelta;

  vec2 uv = vUv;
  float tail = mod(uv.y * SIZE * TAIL_SIZE, TAIL_SIZE) / TAIL_SIZE;
  uv.y = uv.y - tail / SIZE;

  vec4 pos = texture2D(tPrevPos, vUv);
  vec4 col = texture2D(tPrevCol, vUv);
  vec4 pos0 = texture2D(tPrevPos, uv);

  float tailNorm = 2.0 - tail;
  vec2 uvRandomized = vec2(
    0.5 + 2.0 * abs(uv.x - 0.5) * (rand(100.0 * (uv.xy + vec2(fTime, fTimeDelta))) - 0.5),
    0.5 + 2.0 * abs(uv.y - 0.5) * (rand(100.0 * (uv.yx + vec2(fTimeDelta, fTime))) - 0.5)
  );

  vec4 posInit = texture2D(tInit, uvRandomized);
  if (length(posInit.xyz) <= 0.01) {
    posInit.a = 0.0;
  }

  float speed = 0.04;
  float len = fScale * 50.0;

  if (pos0.a <= 0.0 && posInit.a != 0.0 && uv.x < fEmissionRate) {
    pos = posInit;
    col = floatToVec4(pos.a);
    col.rgb *= 0.5 + 1.2 * rand(vec2(uv.y, col.b));
    pos.a = tailNorm - rand(uv.yx) * 1.0;
  } else if (pos.a < (tailNorm) && pos.a > 1.0) {
    float dist = max(1.0, 0.05 * length(pos.xyz));
    vec3 force = curlNoise((pos.xyz + vec3(0.0, fTime * 0.5, 0.0)) * 0.0015 / fScale / dist / d) * speed * len;
    pos.xyz += force * dist * d * 1.5;
    pos.xyz -= vMotionVector * d * 2.0;
  }

  pos.xyz += snoiseVec3((pos.xyz + vec3(0.0, -fTime * 0.1, 0.0)) * 0.003 / fScale / d) * d * speed * 5.0;
  pos.xyz += vMotionVector;
  pos.a -= 0.5 * speed;

  gl_FragColor = (fTarget == 0.0) ? pos : col;
}
