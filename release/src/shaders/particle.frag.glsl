varying vec4 vColorPacked;
varying float fLife;

#inject ../release/src/shaders/chunks/FloatPack.glsl

void main() {
  if (fLife < 0.0) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    discard;
  } else {
    gl_FragColor = vColorPacked;
  }
}
