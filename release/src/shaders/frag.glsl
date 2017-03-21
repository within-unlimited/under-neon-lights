#inject ../release/src/shaders/chunks/NeonParsFragment.glsl

#ifndef USE_COLOR
	uniform vec3 color;
#endif

#ifdef USE_ROAD
	#inject ../release/src/shaders/chunks/RoadFunc.glsl
#endif

void main() {

	#ifdef USE_CLIPPING
		if ( mPosition.y < clip.x * 2.0 || mPosition.y > clip.y * 2.0 ) discard;
	#endif

	vec3 col = vColor;

	#ifdef USE_GRASS
		col = mix( base, top, abs( vUv.y ) );
	#endif

	#ifdef USE_ROAD
		col = roadFunc();
	#endif

	#ifdef USE_FAKE_SHADOW
		float dist = length( mPosition.xyz ) * .06;
		dist = clamp( dist, 0.0, 1.0 );
		float shadow = smoothstep( 0.09, 0.15, pow( dist, 0.5 ) );
		col = mix( col * 0.75, col, shadow );
	#endif

	#ifdef USE_SWIRL
		col = mix( col, vec3( 0.0 ), smoothstep( 0.0, 1.0, length( mPosition.xz ) ) );
	#endif

	#ifdef USE_FOG
		col = neonFog( col );
	#endif

	col = neonColor( col );

	vec3 hsv = rgb2hsv( col );
	col = hsv2rgb( vec3( hsv.r, hsv.g * saturation, hsv.b ) );

	col = sepiaColor( col );

	gl_FragColor = vec4( col, 1.0 );

}
