varying vec3 vColor;
varying vec4 vPos;

#inject /release/src/shaders/chunks/FloatPack.glsl
#inject /release/src/shaders/chunks/Utils.glsl

void main() {
  vec3 col = vColor.rgb;
  if (rgb2hsv(col).g < 0.01) discard; // hide desaturated
  gl_FragColor = vec4(vPos.xyz, vec4ToFloat(vec4(col.rgb, 1.0)));
}
