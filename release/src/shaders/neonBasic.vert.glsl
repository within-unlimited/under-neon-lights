varying vec3 vertexColor;
varying vec4 mPosition;
varying vec4 mvPosition;

void main() {

  vertexColor = color;
  mPosition = modelMatrix * vec4( position, 1.0 );
  mvPosition = viewMatrix * mPosition;
  gl_Position = projectionMatrix * mvPosition;

}
