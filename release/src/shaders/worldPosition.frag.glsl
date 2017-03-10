#inject ../release/src/shaders/chunks/FloatPack.glsl

varying vec3 vColor;
varying vec4 vPos;

void main() {
  vec3 col = vColor.rgb;
  gl_FragColor = vec4(vPos.xyz, vec4ToFloat(vec4(col.rgb, 1.0)));
}
