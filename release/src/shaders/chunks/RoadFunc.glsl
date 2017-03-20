uniform float subdivisions;
uniform vec3 median;

vec3 roadFunc() {

	float threshold = 6.0 / size;
	vec2 wUv = vec2( mPosition.zx ) / size - vec2( 0.5 );
	vec2 rCursor = cursor.zx / size;
	vec2 pos = rCursor + wUv;

	pos = mod( subdivisions * pos, 1.0 );

	vec2 isMedian = vec2( sin( pos * PI ) );
	vec2 isIntersection = vec2( 1.0 - isMedian.y, 1.0 - isMedian.x );

	isMedian = step( vec2( threshold ), isMedian );
	isIntersection = step( vec2( 0.66 ), isIntersection );

	float t = clamp( isMedian.x + isIntersection.x, 0.0, 1.0 );
	vec3 layer = mix( median, color, t );

	t = clamp( isMedian.y + isIntersection.y, 0.0, 1.0 );
	layer = mix( median, layer, t );

	return layer;

}
