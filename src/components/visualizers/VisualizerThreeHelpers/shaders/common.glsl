// Common functions used across all shaders
float getFFT(float x){
  float c = clamp(x, 0.0, 1.0);
  return texture2D(fftTexture, vec2(c, 0.5)).r;
}

mat2 rot2D(float a){
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

vec3 hueRotate(vec3 color, float shift){
  float angle = shift * 6.28318;
  vec3 k = vec3(0.57735, 0.57735, 0.57735);
  float cosAngle = cos(angle);
  return color * cosAngle + cross(k, color) * sin(angle) + k * dot(k, color) * (1.0 - cosAngle);
}

vec3 paletteFancy(float t){
  return 0.5 + 0.5 * cos(6.28318*(t + vec3(0.3,0.416,0.557)));
}

vec3 paletteUser(float t){
  float scaled = t * 4.0;
  float idx = floor(scaled);
  float frac = fract(scaled);
  int i1 = int(mod(idx, 5.0));
  int i2 = int(mod(idx + 1.0, 5.0));
  vec3 c1 = colorPalette[i1];
  vec3 c2 = colorPalette[i2];
  return mix(c1, c2, smoothstep(0.0, 1.0, frac));
}

vec3 H(float a) {
  return cos(radians(vec3(0, 60, 120))+(a)*6.28318)*.5+.5;
}