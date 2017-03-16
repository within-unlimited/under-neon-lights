if (neon <= 1.0) {
  gl_FragColor = vec4(col, 1.0);
} else {
  if (factor.x < 0.75  || length(col.rgb - fogColor) < 0.01) discard;
  gl_FragColor = vec4(mPosition.xyz, vec4ToFloat(vec4(col.rgb, 1.0)));
}
