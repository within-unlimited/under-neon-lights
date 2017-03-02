// Pack float4 into single float

// http://stackoverflow.com/questions/30242013/glsl-compressing-packing-multiple-0-1-colours-var4-into-a-single-var4-variab

float vec4ToFloat(vec4 c){
  return 1.0/255.0 * (floor(c.r*255.0/64.0)*64.0 + floor(c.g*255.0/64.0)*16.0 + floor(c.b*255.0/64.0)*4.0 + floor(c.a*255.0/64.0));
}

vec4 floatToVec4(float x){
  float a = floor(x * 255.0 / 64.0) * 64.0 / 255.0;
  x -= a;
  float b = floor(x * 255.0 / 16.0) * 16.0 / 255.0;
  x -= b;
  b *= 4.0;
  float c = floor(x * 255.0 / 4.0) * 4.0 / 255.0;
  x -= c;
  c *= 16.0;
  float d = x * 255.0 * 64.0 / 255.0;
  return vec4(a, b, c, d);
}
