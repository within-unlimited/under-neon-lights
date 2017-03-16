#inject ../release/src/shaders/chunks/FloatPack.glsl
#inject ../release/src/shaders/chunks/NeonParsFragment.glsl

uniform vec3 color;

void main() {

  /*float dist = distance( vec2( 0.5 ), mvPosition.xz / size + 0.5 ) * 2.0;*/
  /*dist = clamp( abs( dist ), 0.0, 1.0 );*/
  /*vec3 col = mix( blend, fogColor, dist );*/

  vec3 blend = mix( base, color, abs( vUv.y ) );
  vec3 factor = neonFactor();
  vec3 col = neonColor(blend, factor, mPosition.xyz);

  #inject ../release/src/shaders/chunks/NeonOut.glsl

}
