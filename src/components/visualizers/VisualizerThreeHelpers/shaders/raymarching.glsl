float sdOctahedron(vec3 p, float s) {
  p = abs(p);
  return (p.x+p.y+p.z-s)*0.57735027;
}

float mapRaymarching(vec3 p) {
  p.z += iTime * .4;
  p.xy = fract(p.xy) - .5;
  p.z = mod(p.z, .25) - .125;
  return sdOctahedron(p, .15);
}

vec4 renderRaymarching(vec2 fragCoord) {
  vec2 uv = (fragCoord * 2. - iResolution.xy) / iResolution.y;
  vec2 m = (iMouse.xy * 2. - iResolution.xy) / iResolution.y;
  
  if (iMouse.z <= 0.) m = vec2(cos(iTime*.2), sin(iTime*.2));
  
  float freqLow = getFFT(0.1);
  float freqMid = getFFT(0.5);
  float freqHigh = getFFT(0.9);
  
  vec3 ro = vec3(0, 0, -3);
  vec3 rd = normalize(vec3(uv, 1));
  vec3 col = vec3(0);
  
  float t = 0.;
  int i;
  
  for (i = 0; i < 80; i++) {
    vec3 p = ro + rd * t;
    p.xy *= rot2D(t*.15 * m.x);
    p.y += sin(t*(m.y+1.)*.5)*.35;
    
    float d = mapRaymarching(p);
    t += d;
    if (d < .001 || t > 100.) break;
  }
  
  col = paletteFancy(t*.04 + float(i)*.005);
  col = mix(col, paletteUser(t * 0.02 + freqMid), 0.5);
  col *= 1.0 + vec3(freqLow * 0.3, freqMid * 0.2, freqHigh * 0.4);
  
  return vec4(col, 1);
}