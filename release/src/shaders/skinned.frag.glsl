#inject ../release/src/shaders/chunks/FloatPack.glsl
#inject ../release/src/shaders/chunks/NeonParsFragment.glsl

uniform vec2 clipy;

void main() {
  if (mPosition.y < clipy.x || mPosition.y > clipy.y) discard;

  vec3 factor = neonFactor();
  vec3 col = neonColor(vertexColor, factor, mPosition.xyz);

  #inject ../release/src/shaders/chunks/NeonOut.glsl
}
