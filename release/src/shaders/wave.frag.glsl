#inject ../release/src/shaders/chunks/FloatPack.glsl
#inject ../release/src/shaders/chunks/NeonParsFragment.glsl

void main() {

  vec3 factor = neonFactor();
  vec3 col = neonColor(vertexColor, factor, mPosition.xyz);

  #inject ../release/src/shaders/chunks/NeonOut.glsl

}
