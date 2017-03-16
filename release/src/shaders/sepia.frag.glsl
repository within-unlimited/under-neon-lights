uniform float opacity;

float t;

const vec3 b = vec3( 0.0, 69.0, 116.0 );
const vec3 a = vec3( 89.0, 188.0, 255.0 );

/*
const vec3 a = vec3( 61.0, 44.0, 32.00 );
const vec3 b = vec3( 79.0, 54.0, 33.0 );
const vec3 c = vec3( 155.0, 121.0, 68.0 );
const vec3 d = vec3( 208.0, 174.0, 111.0 );
const vec3 e = vec3( 250.0, 244.0, 205.0 );
*/

varying vec2 vUv;

float average ( vec3 v ) {
    return ( v.x + v.y + v.z ) / 3.0;
}

void main () {

    float reduction = 1.4;
    float amount = 2.0;
    float radius = length( vUv - 0.5 ) * reduction;

    float magnitude = ( 1.0 - radius ) * ( amount - 1.0 );

    float space = 255.0;
    vec3 layer = a.xyz / space;

    t = magnitude;
    layer = mix( layer, b.xyz / space, clamp( t, 0.0, 1.0 ) );

/*
    t = magnitude - 1.0;
    layer = mix( layer, c.xyz / space, clamp( t, 0.0, 1.0 ) );

    t = magnitude - 2.0;
    layer = mix( layer, d.xyz / space, clamp( t, 0.0, 1.0 ) );

    t = magnitude - 3.0;
    layer = mix( layer, e.xyz / space, clamp( t, 0.0, 1.0 ) );
*/

    gl_FragColor = vec4( layer * opacity, 1.0 );

}
