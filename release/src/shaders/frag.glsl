#inject ../release/src/shaders/chunks/NeonParsFragment.glsl

#ifndef USE_COLOR
	uniform vec3 color;
#endif

#ifdef USE_ROAD
	#inject ../release/src/shaders/chunks/RoadFunc.glsl
#endif

void main() {

	vec3 col = vColor;

	#ifdef USE_CLIPPING
		if ( mPosition.y < clip.x * 2.0 || mPosition.y > clip.y * 2.0 ) discard;
	#endif

	#ifdef USE_GRASS
		col = mix( vec3( 0.55, 0.98, 0.45 ), vec3( 0.559, 0.776, 0.247 ), abs( vUv.y ) );
	#endif

	#ifdef USE_ROAD
		col = roadFunc();
	#endif

	#ifdef USE_FAKE_SHADOW
		float dist = min( length( mPosition.xyz ) * .06, 1.0 );
		float shadow = smoothstep( 0.09, 0.15, pow( dist, 0.5 ) );
		col = mix( col * 0.75, col, shadow );
	#endif

	#ifdef USE_SWIRL
		col = mix( col, vec3( 0.0 ), smoothstep( 0.0, 1.0, length( mPosition.xz ) ) );
		float p = (1.0 - progress) * ( 1.0 + 0.6 ) - 0.3;
		if (vUv.y > p || vUv.y < (p - 0.3)) discard;
	#endif

	#ifdef USE_FOG
		col = neonFog( col );
	#endif

	col = mix( vec3( length( col ) * 0.75 ), col, saturation );

	col = sepiaColor( col );

	col = neonFunc( col );

	gl_FragColor = vec4( col, 1.0 );

}
