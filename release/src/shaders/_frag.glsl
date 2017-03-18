#inject ../release/src/shaders/chunks/NeonParsFragment.glsl

void main() {

	vec3 col = vColor;

	#ifdef USE_GRASS
		col = mix( base, top, abs( vUv.y ) );
	#endif

	#ifdef USE_FLOOR
	/* float dist = distance( vec2( 0.5 ), vUv ) * 2.0; */
  /* dist = clamp( dist, 0.0, 1.0 ); */
  /* float shadow = smoothstep( 0.09, 0.15, pow( dist, 0.5 ) ); */
  /* vec3 blend = mix( color, fogColor, pow( dist, 0.75 ) ); */
  /* blend = mix( color * 0.75, blend, shadow ); */
	#endif

	#ifdef USE_SKINNING
		if (mPosition.y < clipy.x || mPosition.y > clipy.y) discard;
	#endif

	vec3 factor = neonFactor();
  col = neonColor(col, factor, mPosition.xyz);

  gl_FragColor = vec4(col, 1.0);

}
