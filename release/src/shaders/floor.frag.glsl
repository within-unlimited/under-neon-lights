#inject ../release/src/shaders/chunks/FloatPack.glsl
#inject ../release/src/shaders/chunks/NeonParsFragment.glsl

uniform vec3 color;

void main() {

  /* float dist = distance( vec2( 0.5 ), vUv ) * 2.0; */
  /* dist = clamp( dist, 0.0, 1.0 ); */
  /* float shadow = smoothstep( 0.09, 0.15, pow( dist, 0.5 ) ); */
  /* vec3 blend = mix( color, fogColor, pow( dist, 0.75 ) ); */
  /* blend = mix( color * 0.75, blend, shadow ); */

  vec3 factor = neonFactor();
  vec3 col = neonColor(color, factor, mPosition.xyz);

  if (neon <= 1.0) {
    gl_FragColor = vec4(col, 1.0);
  } else {
    if (factor.x < 0.75 || length(col.rgb - fogColor) < 0.1) discard;
    gl_FragColor = vec4(mPosition.xyz, vec4ToFloat(vec4(col.rgb, 1.0)));
  }

}
