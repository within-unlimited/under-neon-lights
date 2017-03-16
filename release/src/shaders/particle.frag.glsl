varying vec3 vertexColor;
varying float fLife;
varying vec4 mvPosition;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform float isParticle;

#inject ../release/src/shaders/chunks/FloatPack.glsl

void main() {
  if (fLife < 0.0) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    discard;
  } else {
    float fogDepth = - mvPosition.z;
    float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
    // if (length(gl_PointCoord.xy - vec2(0.5)) > 0.5) discard;
    gl_FragColor = vec4(vertexColor, (1.0 - fogFactor) * 0.5);
  }
}
