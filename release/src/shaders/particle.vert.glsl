uniform sampler2D tCurrPos;
uniform sampler2D tCurrCol;
varying vec4 vColorPacked;
varying float fLife;

void main() {
    gl_PointSize = POINT_SIZE;
    vec4 pos = texture2D(tCurrPos, position.yx);
    fLife = pos.a;
    /*fLife = 1.0;*/
    /*pos.xy = (position.yx - 0.5) * 60.0;*/
    /*pos.z = -9.99;*/
    vColorPacked = texture2D(tCurrCol, position.yx);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1.0);
}
