float gTime = 0.;

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float box(vec3 pos, float scale) {
  pos *= scale;
  float base = sdBox(pos, vec3(.4,.4,.1)) /1.5;
  pos.xy *= 5.;
  pos.y -= 3.5;
  pos.xy *= rot2D(.75);
  float result = -base;
  return result;
}

float box_set(vec3 pos) {
  vec3 pos_origin = pos;
  pos = pos_origin;
  pos.y += sin(gTime * 0.4) * 2.5;
  pos.xy *= rot2D(.8);
  float box1 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
  
  pos = pos_origin;
  pos.y -= sin(gTime * 0.4) * 2.5;
  pos.xy *= rot2D(.8);
  float box2 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
  
  pos = pos_origin;
  pos.x += sin(gTime * 0.4) * 2.5;
  pos.xy *= rot2D(.8);
  float box3 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
  
  pos = pos_origin;
  pos.x -= sin(gTime * 0.4) * 2.5;
  pos.xy *= rot2D(.8);
  float box4 = box(pos,2. - abs(sin(gTime * 0.4)) * 1.5);
  
  pos = pos_origin;
  pos.xy *= rot2D(.8);
  float box5 = box(pos,.5) * 6.;
  
  pos = pos_origin;
  float box6 = box(pos,.5) * 6.;
  
  float result = max(max(max(max(max(box1,box2),box3),box4),box5),box6);
  return result;
}

float mapOctagrams(vec3 pos) {
  return box_set(pos);
}

vec4 renderOctagrams(vec2 fragCoord) {
  vec2 p = (fragCoord.xy * 2. - iResolution.xy) / min(iResolution.x, iResolution.y);
  vec3 ro = vec3(0., -0.2 ,iTime * 4.);
  vec3 ray = normalize(vec3(p, 1.5));
  
  float freqLow = getFFT(0.1);
  float freqMid = getFFT(0.5);
  float freqHigh = getFFT(0.9);
  
  ray.xy = ray.xy * rot2D(sin(iTime * .03) * 5. * (1.0 + freqLow * 0.5));
  ray.yz = ray.yz * rot2D(sin(iTime * .05) * .2 * (1.0 + freqMid * 0.3));
  
  float t = 0.1;
  vec3 col = vec3(0.);
  float ac = 0.0;
  
  for (int i = 0; i < 99; i++){
    vec3 pos = ro + ray * t;
    pos = mod(pos-2., 4.) -2.;
    gTime = iTime -float(i) * 0.01;
    
    float d = mapOctagrams(pos);
    d = max(abs(d), 0.01);
    ac += exp(-d*23.);
    
    t += d* 0.55;
    if(t > 100.0) break;
  }
  
  col = vec3(ac * 0.02);
  col += vec3(0.,0.2 * abs(sin(iTime)),0.5 + sin(iTime) * 0.2);
  col = mix(col, paletteUser(ac * 0.01 + freqMid), 0.5);
  col *= 1.0 + vec3(freqLow, freqMid, freqHigh) * fftIntensity * 0.5;
  
  return vec4(col ,1.0 - t * (0.02 + 0.02 * sin (iTime)));
}