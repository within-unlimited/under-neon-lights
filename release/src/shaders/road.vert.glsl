uniform float curvature;
uniform float size;

varying vec4 mPosition;
varying vec4 mvPosition;
varying vec2 vUv;

void main() {

  vUv = uv;

  vec3 pos = vec3( position );
  float x = pos.x / size;
  float y = pos.y / size;
  float x2 = x * 2.0;
  float y2 = y * 2.0;
  float dist = curvature * sqrt( x2 * x2 + y2 * y2 );
  pos.z = size * ( dist * dist ) / 2.0;

  mPosition = modelMatrix * vec4( pos, 1.0 );
  mvPosition = viewMatrix * mPosition;
  gl_Position = projectionMatrix * mvPosition;

}
