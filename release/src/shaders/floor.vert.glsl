varying vec2 vUv;
varying vec4 mPosition;
varying vec4 mvPosition;

void main() {

  vUv = uv;
  mPosition = modelMatrix * vec4( position, 1.0 );
  mvPosition = viewMatrix * mPosition;
  gl_Position = projectionMatrix * mvPosition;

}
