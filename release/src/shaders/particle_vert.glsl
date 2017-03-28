attribute float size;
attribute vec3 destination;

varying vec3 vColor;

uniform float time;
uniform float progress;

void main() {
	vColor = vec3(1.0);
	vec4 mvPosition = modelViewMatrix * vec4( mix( position, destination, progress ), 1.0 );
	gl_PointSize = size * ( 10.0 / -mvPosition.z );
	gl_Position = projectionMatrix * mvPosition;
}
