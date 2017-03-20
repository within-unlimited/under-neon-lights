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

varying vec2 vUv;
varying vec3 vColor;
varying vec4 mPosition;
varying vec4 mvPosition;
uniform mat4 projectionMatrix;

#inject ../release/src/shaders/chunks/NoiseFuncs.glsl

float rand( vec2 co ) {
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 rgb2hsv( vec3 c ) {
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb( vec3 c ) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
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

	float fogDepth = length( mPosition.xyz );
	float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
	fogFactor -= rand( mPosition.xz ) / 128.0;
	return mix( col, fogColor, fogFactor );

}

float neonNoise( vec3 pos, float phase ) {

	float noise = snoise( pos * 0.1 );
	noise = max( 0.0, sin( noise * 16.0 + time * 0.1 ) + phase );
	return noise;

}

vec3 neonColor( vec3 col ) {

	vec3 p = mPosition.xyz + vec3( cursor.x, cursor.y + time * 0.1, cursor.z );
	vec3 neonFactor = vec3(
		neonNoise( p, 0.3 ),
		neonNoise( p, 0.0 ),
		neonNoise( p, -0.3 )
	);

	vec3 nCol = mix( vec3( 0.0 ), col, neonFactor );

	float fogDepth = length( mPosition.xyz );
	float fogFactor = smoothstep( fogNear, fogFar, fogDepth );
	nCol = mix( nCol, vec3( 0.0 ), fogFactor );

	return mix( col, nCol, neon );

}
