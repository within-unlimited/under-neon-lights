varying vec4 mPosition;
varying vec4 mvPosition;
varying vec3 vColor;

#inject ../release/src/shaders/chunks/SkinningParsVertex.glsl

void main() {

  vColor = color;
  vec4 skinned = vec4( 0.0 );

  #inject ../release/src/shaders/chunks/SkinningVertex.glsl

  mPosition = modelMatrix * skinned;
  mvPosition = viewMatrix * mPosition;
  gl_Position = projectionMatrix * mvPosition;

}
