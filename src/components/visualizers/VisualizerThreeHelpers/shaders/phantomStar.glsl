const float pi = acos(-1.0);
const float pi2 = pi*2.0;

vec2 pmod(vec2 p, float r) {
  float a = atan(p.x, p.y) + pi/r;
  float n = pi2 / r;
  a = floor(a/n)*n;
  return p*rot2D(-a);
}

float box(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return min(max(d.x,max(d.y,d.z)),0.0) + length(max(d,0.0));
}

float ifsBox(vec3 p) {
  float scale = 1.0;
  for (int i=0; i<5; i++) {
    p = abs(p) - 1.0;
    p.xy *= rot2D(iTime*0.3);
    p.xz *= rot2D(iTime*0.1);
  }
  p.xz *= rot2D(iTime);
  return box(p, vec3(0.4,0.8,0.3));
}

float mapPhantom(vec3 p) {
  vec3 p1 = p;
  p1.x = mod(p1.x-5., 10.) - 5.;
  p1.y = mod(p1.y-5., 10.) - 5.;
  p1.z = mod(p1.z, 16.)-8.;
  p1.xy = pmod(p1.xy, 5.0);
  return ifsBox(p1);
}

vec4 renderPhantomStar(vec2 fragCoord) {
  vec2 p = (fragCoord * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
  
  vec3 cPos = vec3(0.0,0.0, -3.0 * iTime);
  vec3 cDir = normalize(vec3(0.0, 0.0, -1.0));
  vec3 cUp  = vec3(sin(iTime), 1.0, 0.0);
  vec3 cSide = cross(cDir, cUp);
  
  vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir);
  
  float freqLow = getFFT(0.1);
  float freqMid = getFFT(0.5);
  float freqHigh = getFFT(0.9);
  
  float acc = 0.0;
  float acc2 = 0.0;
  float t = 0.0;
  
  for (int i = 0; i < 99; i++) {
    vec3 pos = cPos + ray * t;
    float dist = mapPhantom(pos);
    dist = max(abs(dist), 0.02);
    float a = exp(-dist*3.0);
    
    if (mod(length(pos)+24.0*iTime, 30.0) < 3.0) {
      a *= 2.0;
      acc2 += a;
    }
    acc += a;
    t += dist * 0.5;
    if(t > 100.0) break;
  }
  
  vec3 col = vec3(acc * 0.01, acc * 0.011 + acc2*0.002, acc * 0.012+ acc2*0.005);
  col = mix(col, paletteUser(acc * 0.01 + freqMid), 0.5);
  col *= 1.0 + vec3(freqLow, freqMid, freqHigh) * fftIntensity;
  
  return vec4(col, 1.0 - t * 0.03);
}