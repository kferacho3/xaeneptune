vec4 renderDiscoGlaze(vec2 fragCoord) {
  float s = 15.;
  float t = iTime/60.;
  float pi2 = 6.2832;
  float p;
  
  vec2 R = iResolution.xy;
  vec2 m = (iMouse.xy-R/2.)/R.y*s;
  vec2 u = (fragCoord-R/2.)/R.y*s;
  vec2 g;
  
  if (iMouse.z < 1.) m = 2.*vec2(sin(t*pi2)*2., sin(t*pi2*2.));
  
  float freqLow = getFFT(0.1);
  float freqMid = getFFT(0.5);
  float freqHigh = getFFT(0.9);
  
  u /= 1.-dot(u, u)/s;
  u -= m;
  
  g = abs(mod(u, 1.)-.5)*1.5;
  p = .7*min(1., length(fwidth(u))/length(u-round(u)));
  
  vec3 c = H(pow(length(round(u)), 2.)*t);
  c *= min(g.x, g.y);
  c += (p*p + p*c);
  c /= max(1., pow(length(u+m), 2.)/30.);
  c *= 1.0 + vec3(freqLow, freqMid, freqHigh) * fftIntensity;
  
  // Radial blur effect
  vec3 blur = c;
  float l = 50.;
  float j = 1./l;
  float aa = length((fragCoord+fragCoord-R)/R.y*2.);
  float i = j, b = j, k;
  
  for (; i<=1.; i+=j) {
    k = sqrt(i);
    vec2 blurCoord = mix(fragCoord/R, vec2(.5), 1.-sqrt(i));
    vec3 sample = H(pow(length(round(blurCoord*s)), 2.)*t);
    blur += sample*k*b;
  }
  
  c = mix(c, blur*0.1, 0.3);
  
  return vec4(clamp(c, 0., 1.), 1);
}