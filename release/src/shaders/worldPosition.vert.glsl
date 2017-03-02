varying vec3 vColor;
varying vec4 vPos;

void main() {
  vColor = color;
  vPos = modelMatrix * vec4( position, 1.0 );
  vec4 mvPosition = viewMatrix * vPos;
  gl_Position = projectionMatrix * mvPosition;
}
