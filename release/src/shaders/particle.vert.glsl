uniform sampler2D tCurrPos;
uniform sampler2D tCurrCol;

varying vec4 vColorPacked;
varying float fLife;

void main() {
  gl_PointSize = POINT_SIZE;
  vec4 pos = texture2D(tCurrPos, position.yx);
  fLife = pos.a;
  vColorPacked = texture2D(tCurrCol, position.yx);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
}
