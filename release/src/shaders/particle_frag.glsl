float PI = 3.141592653589793;
uniform float progress;
uniform vec3 col;
varying vec3 vColor;
void main() {
	float dist = length( gl_PointCoord * 2.0 - vec2( 1.0 ) );
	float gradient = 1.0 - pow( dist, 2.0 );
	float alpha = sin( progress * PI );
	gl_FragColor = vec4( col, alpha * gradient );
}
