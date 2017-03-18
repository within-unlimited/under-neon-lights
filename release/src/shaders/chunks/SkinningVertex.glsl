/* skinbase_vertex */
mat4 boneMatX = getBoneMatrix( skinIndex.x );
mat4 boneMatY = getBoneMatrix( skinIndex.y );
mat4 boneMatZ = getBoneMatrix( skinIndex.z );
mat4 boneMatW = getBoneMatrix( skinIndex.w );

/* skinning_vertex */
vec4 skinVertex = bindMatrix * vec4( position.xyz, 1.0 );
vec4 skinned = vec4( 0.0 );

skinned += boneMatX * skinVertex * skinWeight.x;
skinned += boneMatY * skinVertex * skinWeight.y;
skinned += boneMatZ * skinVertex * skinWeight.z;
skinned += boneMatW * skinVertex * skinWeight.w;
pos = (bindMatrixInverse * skinned).xyz;
