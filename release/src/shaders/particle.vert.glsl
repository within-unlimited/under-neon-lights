uniform sampler2D tCurrent;
varying float fColorPacked;

void main() {
    gl_PointSize = POINT_SIZE;
    vec4 color = texture2D(tCurrent, position.yx);
    fColorPacked = color.a;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(color.xyz, 1.0);
}
