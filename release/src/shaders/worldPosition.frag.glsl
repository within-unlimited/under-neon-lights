varying vec3 vColor;
varying vec4 vPos;

#inject /release/src/shaders/chunks/FloatPack.glsl

void main() {
  gl_FragColor = vec4(vPos.xyz, vec4ToFloat(vec4(vColor.rgb, 1.0)));
}
