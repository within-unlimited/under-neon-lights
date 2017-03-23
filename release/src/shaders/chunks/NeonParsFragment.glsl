const float PI = 3.141592653589793;

const vec3 b = vec3( 0.0, 69.0, 116.0 ) * 1.5;
const vec3 a = vec3( 89.0, 188.0, 255.0 ) * 1.5;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

uniform float sepia;
uniform vec3 sepiaCol1;
uniform vec3 sepiaCol2;
uniform vec3 neonCol;
uniform float saturation;
uniform float neon;
uniform float time;
uniform float size;
uniform vec3 cursor;
uniform vec2 clip;
uniform float yrot;
uniform float progress;

varying vec2 vUv;
varying vec3 vColor;
varying vec4 mPosition;
varying vec4 mvPosition;
uniform mat4 projectionMatrix;

uniform float neonFade;
uniform float neonGlow;
uniform float neonFreq1;
uniform float neonFreq2;
uniform float neonNearClip;

vec3 sepiaColor( vec3 col ) {

	float amount = 2.0;
	vec4 clipSpace = projectionMatrix * mvPosition;

	vec2 coord = ( clipSpace.xyz / clipSpace.w ).xy;
	float radius = length( ( coord )  ) / 1.3;
	float magnitude = ( 1.0 - radius ) * ( amount - 1.0 );

	vec3 layer = mix( sepiaCol2.rgb * 2.0, sepiaCol1.rgb, clamp( magnitude, 0.0, 1.0 ) );

	return  col - layer * 0.1 * sepia;

}

vec3 neonFog( vec3 col ) {

	float fogDepth = length( mPosition.xz );
	float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
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

float neonNoise( vec3 pos ) {

	float dist = sin( pos.x * 0.32 ) + sin( pos.y * 0.26 ) + sin( pos.z * 0.45 ) +
		sin( pos.x * 0.078 ) + sin( pos.y * 0.089 ) + sin( pos.z * 0.091 ) +
		sin( pos.x * 0.12 ) + sin( pos.y * 0.34 ) + sin( pos.z * 0.23 ) +
		sin( sqrt( pos.x * pos.x + pos.y * pos.y + pos.z * pos.z ) * 0.5 );
		float f = dist * neonFreq2;
		return abs( sin( f ) );
}

vec3 neonFunc( vec3 col ) {

	vec3 p = rotateY( - yrot ) * ( mPosition.xyz ) + cursor;
	float neonFactor = neonNoise( p * neonFreq1 + vec3( 0.0, - time * 0.5, 0.0 ) );
	float neonFactorFade = smoothstep( 2.0 * ( neonFade * neon ) - 1.0, 1.0, neonFactor );
	vec3 nCol = mix( col * neonCol * 6.0 + neonCol * 2.0, col, pow( neonFactorFade, 5.2 * neonGlow ) );
	nCol = mix( fogColor, nCol, pow( neonFactorFade, 3.0 ) );
	col = mix( col, nCol, neon );

	return col;

}
