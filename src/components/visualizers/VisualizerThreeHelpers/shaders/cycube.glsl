#define A(a) mat2(cos((a)*6.2832 + vec4(0, -1.5708, 1.5708, 0)))

float cube(vec3 p, mat2 h, mat2 v) {
  float a, b;
  p.yz *= h;
  p.xz *= v;
  p = abs(p);
  a = max(p.x, max(p.y, p.z))-2.414;
  p = abs(p-round(p));
  b = max(p.x, max(p.y, p.z))-.3;
  return max(a, b);
}

vec4 renderCycube(vec2 fragCoord) {
  float t = iTime/60.;
  float d = 0., i = d, s, r, r2;
  
  vec2 R = iResolution.xy;
  vec2 m = (iMouse.z > 0.) ? 
    (iMouse.xy-.5*R)/R.y:
    vec2(t*3., cos(t*12.5664 + 3.1416)*.5);
  
  float freqLow = getFFT(0.1);
  float freqMid = getFFT(0.5);
  float freqHigh = getFFT(0.9);
  
  vec3 o = vec3(0, -6, -40./(m.y+1.));
  vec3 u = normalize(vec3(fragCoord-.5*R, R.y*.7));
  vec3 c = vec3(.1), p;
  
  mat2 h = A(m.x);
  mat2 v = A(m.y/30.);
  mat2 ch = A(cos(iTime/2. + freqLow)*.1);
  mat2 cv = A(sin(-iTime/2. + freqMid)*.5);
  
  for (; i++<90.;) {
    p = o+u*d;
    p.yz *= v;
    p.xz *= h;
    r = length(p.xz);
    r2 = length(p);
    s = cube(p, ch, cv);
    s = min(s, max(length(p)-5.5, 5.4-length(p.xy)));
    p.xz = vec2(atan(p.x, p.z)/6.2832, r);
    p.x -= round(p.z)*t*sign(p.y);
    p.xz = abs(p.xz-round(p.xz));
    p.y = abs(p.y)-15.;
    s = min(s, max(abs(p.y) - min(8., 20./r), max(p.x, p.z) - .5/r));
    
    if (s < .001 || d > 1e3) break;
    d += s*.5;
    c += min(vec3(s), .003/s * (H(s + 5./r2 - .1)*.6+.1));
  }
  
  c *= c;
  c *= 1.0 + vec3(freqLow, freqMid, freqHigh) * fftIntensity;
  
  return vec4(c, 1);
}