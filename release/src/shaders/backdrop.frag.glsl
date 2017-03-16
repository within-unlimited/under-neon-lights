#inject ../release/src/shaders/chunks/FloatPack.glsl
#inject ../release/src/shaders/chunks/NeonParsFragment.glsl

uniform vec3 color;
/* uniform float offset; */
/* uniform vec3 fog; */

void main() {

  /* float t = smoothstep( offset, 1.0, vUv.y ); */
  /* vec3 blend = mix( fog, color, pow( t, 3.0 ) ); */
  /* vec3 factor = neonFactor(mvPosition.xyz); */
  /* vec3 col = neonColor(blend, factor); */

  vec3 factor = neonFactor();
  vec3 col = neonColor(color, factor, mPosition.xyz);

  #inject ../release/src/shaders/chunks/NeonOut.glsl

}
