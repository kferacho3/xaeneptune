#define RT(a) mat2(cos(m.a*1.571+vec4(0,-1.571,1.571,0)))

vec4 renderGoldenHell(vec2 fragCoord) {
  float t = iTime/15.+.001;
  float aa = 2.;
  float d, s;
  
  vec2 R = iResolution.xy;
  vec2 m = (iMouse.xy/R*4.-2.);
  
  if (iMouse.z < 1.) m = vec2(-cos(t)*.4+.4)+vec2(0,.1);
  
  float freqLow = getFFT(0.1);
  float freqMid = getFFT(0.5);
  float freqHigh = getFFT(0.9);
  
  vec3 bg = vec3(0);
  vec4 renderGoldenHell(vec2 fragCoord) {
  float t = iTime/15.+.001;
  float aa = 2.;
  float d, s;
  
  vec2 R = iResolution.xy;
  vec2 m = (iMouse.xy/R*4.-2.);
  
  if (iMouse.z < 1.) m = vec2(-cos(t)*.4+.4)+vec2(0,.1);
  
  float freqLow = getFFT(0.1);
  float freqMid = getFFT(0.5);
  float freqHigh = getFFT(0.9);
  
  vec3 bg = vec3(0);
  vec3 ro = vec3(.5, 0, t);
  vec3 rd, l, c;
  vec2 o;
  
  mat2 pitch = RT(y);
  mat2 yaw = RT(x);
  
  for (int k = 0; k < int(aa*aa); k++) {
    o = vec2(float(k%int(aa)), float(k/int(aa)))/aa;
    rd = normalize(vec3((fragCoord-.5*R+o)/R.y, 1));
    rd.yz *= pitch;
    rd.xz *= yaw;
    d = 0.;
    
    for (int i = 0; i < 100; i++) {
      vec3 p = ro+rd*d;
      p.z += sqrt(round(p.y)*t*t*2.);
      s = smoothstep(.23, .27, length(p-round(p)));
      if (s < 0.001) break;
      d += s;
    }
    
    l = 1.-vec3(length(rd.yz), length(rd.xz), length(rd.xy));
    c = vec3(d*.013);
    c += vec3(.9, .5, .2)-min(1.-l.x, 1.-l.z);
    c.b += l.x*.5 + l.y*1.5;
    c = max(c, .5-H(d));
    c *= 1.0 + vec3(freqLow, freqMid, freqHigh) * fftIntensity;
    bg += c;
  }
  
  bg /= aa*aa;
  bg *= sqrt(bg)*.8;
  
  return vec4(bg, 1.);
}