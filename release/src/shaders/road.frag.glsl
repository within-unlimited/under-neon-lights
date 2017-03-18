#inject ../release/src/shaders/chunks/NeonParsFragment.glsl

float PI = 3.141592653589793;

uniform float subdivisions;

uniform vec3 median;
uniform vec3 fog;
uniform vec3 color;

void main() {
  float threshold = 6.0 / size;
  vec2 pos = vec2( cursor.x + vUv.x, - cursor.y + vUv.y );
  pos = mod( subdivisions * pos, 1.0 );

  vec2 isMedian = vec2( sin( pos * PI ) );
  vec2 isIntersection = vec2( 1.0 - isMedian.y, 1.0 - isMedian.x );

  isMedian = step( vec2( threshold ), isMedian );
  isIntersection = step( vec2( 0.66 ), isIntersection );

  float t = clamp( isMedian.x + isIntersection.x, 0.0, 1.0 );
  vec3 layer = mix( median, color, t );

  t = clamp( isMedian.y + isIntersection.y, 0.0, 1.0 );
  layer = mix( median, layer, t );

  float dist = distance( vec2( 0.5 ), vUv ) * 2.0;
  t = clamp( dist, 0.0, 1.0 );

  layer = mix( layer, fog, pow( t, 0.5 ) );
  float shadow = smoothstep( 0.0006, 0.0012, t );

  vec3 col = mix( layer * 0.66, layer, shadow );
  col = mix( col.rrr, col, saturation );

  vec3 factor = neonFactor();
  col = neonColor(col, factor, mPosition.xyz);

  gl_FragColor = vec4(col, 1.0);

}
