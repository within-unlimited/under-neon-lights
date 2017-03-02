varying vec2 vUv;

uniform sampler2D tInit;
uniform sampler2D tPrev;
uniform float fPass;

#inject /release/src/shaders/chunks/Rand.glsl
#inject /release/src/shaders/chunks/FloatPack.glsl
#inject /release/src/shaders/chunks/NoiseFuncs.glsl

void main() {
  vec2 uv = vUv;
  float tailNorm = mod(uv.y * SIZE * TAIL_SIZE, TAIL_SIZE) / TAIL_SIZE;
  float tail = tailNorm / SIZE;
  uv.y = uv.y - tail;

  vec4 pos = texture2D(tPrev, vUv);
  vec4 pos_head = texture2D(tPrev, uv);

  float randId = 0.0;//rand(uv);

  tailNorm = 1.0 - tailNorm;

  if (pos_head.a <= (randId)) {
    pos = texture2D(tInit, uv);
    pos.a = 1.0 + tailNorm + rand(uv);
  } else if (pos.a < (1.0 + tailNorm) && pos.a > 1.0) {
    pos.y += 0.01;
    pos.xyz += curlNoise(pos.xyz * 0.3) * 0.01;
  }
  pos.a -= 0.002;

  gl_FragColor = pos;
}
