float PI = 3.141592653589793;

uniform vec3 sepia;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform float saturation;
uniform float neon;
uniform float time;
uniform float size;
uniform vec3 base;
uniform vec3 top;
uniform vec2 cursor;
uniform vec2 clip;

varying vec2 vUv;
varying vec3 vColor;
varying vec4 mPosition;
varying vec4 mvPosition;

#inject ../release/src/shaders/chunks/NoiseFuncs.glsl

vec3 neonFog( vec3 col ) {

  float fogDepth = length( mPosition.xyz );
	float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
  return mix( col, fogColor, fogFactor );

}

float neonNoise( vec3 pos, float phase ) {

  float noise = snoise( pos * 0.1 );
  noise = max( 0.0, sin( noise * 16.0 + time * 0.0 ) + phase );
  return noise;

}

vec3 neonColor( vec3 col ) {

	vec3 p = mPosition.xyz + vec3( cursor.y, 0.0, cursor.x );
  // p.y += time;
  vec3 neonFactor = vec3(
    neonNoise( p, 0.3 ),
    neonNoise( p, 0.0 ),
    neonNoise( p, -0.3 )
  );

	float fogDepth = length( mPosition.xyz );
	float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
  vec3 nCol = mix( mix( col, fogColor, fogFactor ), col, neonFactor );
  nCol = clamp( nCol, fogColor, vec3( 1.0 ) );

  return mix( col, nCol, neon );

}
