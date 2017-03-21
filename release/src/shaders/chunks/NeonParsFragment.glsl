const float PI = 3.141592653589793;

const vec3 b = vec3( 0.0, 69.0, 116.0 ) * 1.5;
const vec3 a = vec3( 89.0, 188.0, 255.0 ) * 1.5;

uniform float sepia;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform float saturation;
uniform float neon;
uniform float time;
uniform float size;
uniform vec3 base;
uniform vec3 top;
uniform vec3 cursor;
uniform vec2 clip;
uniform float yrot;

varying vec2 vUv;
varying vec3 vColor;
varying vec4 mPosition;
varying vec4 mvPosition;
uniform mat4 projectionMatrix;

#inject ../release/src/shaders/chunks/NoiseFuncs.glsl

float rand( vec2 co ) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 sepiaColor( vec3 col ) {

	float amount = 2.0;
	vec4 clipSpace = projectionMatrix * mvPosition;

	vec2 coord = ( clipSpace.xyz / clipSpace.w ).xy;
	float radius = length( ( coord )  ) / 1.0;

	float magnitude = ( 1.0 - radius ) * ( amount - 1.0 );
	magnitude += rand( coord ) / 255.0;

	vec3 layer = a.xyz / 128.0;
	layer = mix( layer, b.xyz / 255.0, clamp( magnitude, 0.0, 1.0 ) );

	return  col - layer * 0.1 * sepia;

}

vec3 neonFog( vec3 col ) {

	float fogDepth = length( mPosition.xz );
	float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
	// fogFactor -= rand( mPosition.xz ) / 128.0;
	return mix( col, fogColor, fogFactor );

}

mat3 rotateY( float rad ) {
	float c = cos( rad );
	float s = sin( rad );
	return mat3(
		c, 0.0, -s,
		0.0, 1.0, 0.0,
		s, 0.0, c
	);
}

float neonNoise( vec3 pos, float phase ) {

	float noise = snoise( pos * 0.1 );
	noise = max( 0.0, sin( noise * 16.0 + time * 0.1 ) + phase );
	return noise;

}

vec3 neonColor( vec3 col ) {

	mat3 r = rotateY( -yrot );
	vec3 p = r * mPosition.xyz;
	p += cursor * vec3( 1.0, 1.0, 1.2 );

	float neonFactor = neonNoise( p * 0.3, 0.0 );

	if ( ( neonFactor + neon ) > 1.75 ) discard;

	vec3 nCol = ( col * 1.5 ) + vec3( neonFactor, 0.0, 0.25 - neonFactor * 0.25 ) * 0.5;

	float fogDepth = length( mPosition.xz );
	float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
	nCol = mix( nCol, vec3( 0.0 ), fogFactor );

	return mix( col, nCol, neon );

}
