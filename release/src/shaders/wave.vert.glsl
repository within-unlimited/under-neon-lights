float PI = 3.141592653589793;

uniform float time;

varying vec4 mPosition;
varying vec4 mvPosition;
varying vec3 vertexColor;

void main() {

  vec3 pos = vec3( position );
  vec4 t = projectionMatrix * vec4( 1.0 );

  float osc = ( 1.0 + sin( time + PI * ( t.x + t.y + t.z ) / 3.0 ) ) / 2.0;
  float sway = pow( pos.y, 2.0 ) * osc;

  pos.x += sway / 100.0;

  vertexColor = color;

  mPosition = modelMatrix * vec4( pos, 1.0 );
  mvPosition = viewMatrix * mPosition;
  gl_Position = projectionMatrix * mvPosition;

}
