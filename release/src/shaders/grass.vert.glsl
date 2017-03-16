float PI = 3.141592653589793;

varying vec2 vUv;
varying vec4 mPosition;
varying vec4 mvPosition;

void main() {

  vec3 pos = vec3( position );
  float pct = clamp( pos.y, 0.0, 1.0 );
  float taper = sin( pow( pct, 0.5 ) * PI );

  pos.x *= taper;
  pos.z *= taper;

  mPosition = modelMatrix * vec4( pos, 1.0 );
  mvPosition = viewMatrix * mPosition;

  vUv = uv;

  gl_Position = projectionMatrix * mvPosition;

}
