uniform sampler2D tCurrPos;
uniform sampler2D tCurrCol;

varying vec3 vertexColor;
varying vec4 mPosition;
varying vec4 mvPosition;
varying float fLife;

void main() {
  gl_PointSize = POINT_SIZE;
  vec4 pos = texture2D(tCurrPos, position.yx);
  fLife = pos.a;
  vertexColor = texture2D(tCurrCol, position.yx).rgb;
  mPosition = modelMatrix * vec4(pos.xyz, 1.0);
  mvPosition = viewMatrix * mPosition;
  // mvPosition.z += 0.001;
  gl_Position = projectionMatrix * mvPosition;
}
