#inject ../release/src/shaders/chunks/NeonParsFragment.glsl

#ifndef USE_COLOR
	uniform vec3 color;
#endif

#ifdef USE_OPACITY
	uniform float opacity;
#endif

#ifdef USE_ROAD
	#inject ../release/src/shaders/chunks/RoadFunc.glsl
#endif

#ifdef USE_MAP
	uniform sampler2D map;
	uniform vec4 offsetRepeat;
#endif

void main() {

	vec3 col = vColor;
	float alpha = 1.0;

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

	col = mix( vec3( length( col ) * 0.75 ), col, saturation );

	#ifndef DONTUSE_NEON
		col = neonFunc( col );
	#endif

	#ifdef USE_FOG
		col = neonFog( col );
	#endif

	col = sepiaColor( col );

	#ifdef USE_SWIRL
		float p = min( progress, 1.0 - progress ) * 2.0;
		float l = length( ( ( vUv + vec2( 0.0, progress - 0.5 ) ) * 2.0 - vec2( 1.0 ) ) / vec2( 1.0, p ) );
		col = vec3( 1.0 - min( l, 1.0 ) ) * p;
	#endif

	#ifdef USE_OPACITY
		alpha = opacity;
	#endif

	#ifdef USE_MAP
		vec4 tex = texture2D( map, vUv * offsetRepeat.zw + offsetRepeat.xy );
		col = tex.rgb;
		alpha = tex.a;
	#endif

	gl_FragColor = vec4( col, alpha );


}
