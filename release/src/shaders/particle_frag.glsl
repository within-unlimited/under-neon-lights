uniform float progress;
uniform vec3 col;

varying vec3 vColor;

void main() {
	float gradient = max( 0.0, 1.0 - length( gl_PointCoord * 2.0 - vec2( 1.0 ) ) );
	float alpha = min( 1.0, min( progress * 2.0  , ( 1.0 - progress ) * 3.0 ) );
	gl_FragColor = vec4( col * vColor * vec3( gradient ), alpha );
}
