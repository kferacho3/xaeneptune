export const fragmentShader = /* glsl */ `
precision highp float;

/* ─────────── UNIFORMS & VARYINGS ─────────── */
uniform int   uEnvironment;   // 0-phantom 1-octagrams 2-raymarch 3-cycube 4-disco 5-golden 6-urchin
uniform int   uRenderMode;    // 0-solid 1-wireframe 2-rainbow 3-transparent
uniform float iTime;
uniform vec2  iResolution;
uniform vec3  iMouse;
uniform float fftIntensity;
uniform sampler2D fftTexture;
uniform vec3  colorPalette[5];

varying vec2  vUV;
varying float vMorphFactor;
varying vec3  vNormal;
varying vec3  vPosition;

/* ─────────── COMMON HELPERS ─────────── */
float getFFT(float x){ float c=clamp(x,0.,1.); return texture2D(fftTexture,vec2(c,.5)).r; }
mat2 rot2D(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }
vec3 hueRotate(vec3 c,float sh){ float a=sh*6.28318; vec3 k=vec3(.57735); float ca=cos(a);
  return c*ca + cross(k,c)*sin(a) + k*dot(k,c)*(1.-ca); }
vec3 paletteFancy(float t){ return .5 + .5 * cos(6.28318*(t+vec3(.3,.416,.557))); }
vec3 paletteUser(float t){
  float s=t*4.; float i=floor(s); float f=fract(s);
  vec3 a=colorPalette[int(mod(i,5.))], b=colorPalette[int(mod(i+1.,5.))];
  return mix(a,b,smoothstep(0.,1.,f));
}
vec3 H(float a){ return cos(radians(vec3(0.,60.,120.))+a*6.28318)*.5+.5; }



/* ============================================================= */
/*  UNIVERSAL SHIMS & MISSING HELPERS  ––  paste ONCE only        */
/* ============================================================= */

/*–– Shadertoy compatibility ––*/
uniform sampler2D iChannel0;                 // if you don’t bind anything it’s just black
#define texture(s,u)      texture2D(s,u)     // WebGL-1 alias
#define textureLod(s,u,l) texture2D(s,u)     // ignore explicit LOD

/*–– crystal-mind helpers (were below but must exist BEFORE use) ––*/
float hasira(vec3 p, vec3 s){
    vec2 q = abs(p.xy);
    vec2 m = max(s.xy - q, vec2(0.0));
    return length(max(q - s.xy, 0.0)) - min(m.x, m.y);
}
float closs(vec3 p, vec3 s){
    float d1 = hasira( p      , s      );
    float d2 = hasira( p.yzx  , s.yzx  );
    float d3 = hasira( p.zxy  , s.zxy  );
    return min(min(d1,d2), d3);
}

/*–– tiny vec2 stub so Solar-Hollow links (delete when you add full mp) ––*/
vec2 sHmp(vec3 p, float g){ return vec2(length(p)-1.0, g); }




/* ============================================================== */
/* 01 - PHANTOM STAR  (unchanged from your original)              */
/* ============================================================== */
const float PI  = 3.141592653589793;
const float PI2 = 6.283185307179586;

vec2 pmod(vec2 p,float r){
  float a=atan(p.x,p.y)+PI/r;
  float n=PI2/r;
  a=floor(a/n)*n;
  return p*rot2D(-a);
}
float pStar_sdBox(vec3 p,vec3 b){
  vec3 d=abs(p)-b;
  return min(max(d.x,max(d.y,d.z)),0.)+length(max(d,0.));
}
float pStar_IFS(vec3 p){
  for(int i=0;i<5;i++){
    p=abs(p)-1.;
    p.xy*=rot2D(iTime*.3);
    p.xz*=rot2D(iTime*.1);
  }
  p.xz*=rot2D(iTime);
  return pStar_sdBox(p,vec3(.4,.8,.3));
}
float mapPhantom(vec3 p){
  p.x=mod(p.x-5.,10.)-5.;
  p.y=mod(p.y-5.,10.)-5.;
  p.z=mod(p.z,16.)-8.;
  p.xy=pmod(p.xy,5.);
  return pStar_IFS(p);
}
vec4 renderPhantomStar(vec2 fc){
  vec2 p=(fc*2.-iResolution.xy)/min(iResolution.x,iResolution.y);
  vec3 cPos=vec3(0.,0.,-3.*iTime);
  vec3 cDir=normalize(vec3(0.,0.,-1.));
  vec3 cUp =vec3(sin(iTime),1.,0.);
  vec3 cSide=cross(cDir,cUp);
  vec3 ray =normalize(cSide*p.x+cUp*p.y+cDir);

  float fL=getFFT(.1),fM=getFFT(.5),fH=getFFT(.9);
  float acc=0.,acc2=0.,t=0.;
  for(int i=0;i<99;i++){
    vec3 pos=cPos+ray*t;
    float d=mapPhantom(pos); d=max(abs(d),.02);
    float a=exp(-d*3.);
    if(mod(length(pos)+24.*iTime,30.)<3.){ a*=2.; acc2+=a; }
    acc+=a; t+=d*.5; if(t>100.)break;
  }
  vec3 col=vec3(acc*.01, acc*.011+acc2*.002, acc*.012+acc2*.005);
  col=mix(col,paletteUser(acc*.01+fM),.5);
  col*=1.+vec3(fL,fM,fH)*fftIntensity;
  return vec4(col,1.-t*.03);
}

/* ============================================================== */
/* 02 - OCTAGRAMS  (unchanged from your original)                 */
/* ============================================================== */
float gTime=0.;
float o_sdBox(vec3 p,vec3 b){ vec3 q=abs(p)-b; return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.); }
float o_box(vec3 p,float s){ p*=s; float base=o_sdBox(p,vec3(.4,.4,.1))/1.5;
  p.xy*=5.; p.y-=3.5; p.xy*=rot2D(.75); return -base; }
float o_set(vec3 p){
  vec3 o=p; float s=sin(gTime*.4)*2.5;
  float r=max(max(max(max(max(
    o_box(vec3(o.x,o.y+s,o.z),2.-abs(sin(gTime*.4))*1.5),
    o_box(vec3(o.x,o.y-s,o.z),2.-abs(sin(gTime*.4))*1.5)),
    o_box(vec3(o.x+s,o.y,o.z),2.-abs(sin(gTime*.4))*1.5)),
    o_box(vec3(o.x-s,o.y,o.z),2.-abs(sin(gTime*.4))*1.5)),
    o_box(o*.5,1.)*6.),
    o_box(o,.5)*6.);
  return r;
}
float mapOctagrams(vec3 p){ return o_set(p); }
vec4 renderOctagrams(vec2 fc){
  vec2 uv=(fc*2.-iResolution.xy)/min(iResolution.x,iResolution.y);
  vec3 ro=vec3(sin(iTime*.1)*2.,-0.2,iTime*4.);
  vec3 rd=normalize(vec3(uv,1.5));
  float fL=getFFT(.1),fM=getFFT(.5),fH=getFFT(.9);
  rd.xy*=rot2D(sin(iTime*.03)*5.*(1.+fL*.5));
  rd.yz*=rot2D(sin(iTime*.05)*.2*(1.+fM*.3));
  float t=.1,ac=0.,cShift=0.; for(int i=0;i<120;i++){
    vec3 p=ro+rd*t; p=mod(p-2.,4.)-2.; gTime=iTime-float(i)*.01;
    float d=mapOctagrams(p); d=max(d,.005);
    float den=exp(-d*(20.+fH*10.)); ac+=den;
    cShift+=den*(sin(p.x*2.+iTime)*.5+.5)*fM;
    t+=d*.5; if(t>100.)break;
  }
  vec3 col=paletteUser(cShift*.1+t*.01);
  col*=ac*.015; col+=vec3(fL*.2,fM*.1,fH*.3)*ac*.01;
  col+=pow(ac*.01,2.)*vec3(.5,.3,.8);
  return vec4(col,1.-t*(.01+.01*sin(iTime)));
}

/* ============================================================== */
/* 03 - RAYMARCHING  (unchanged from your original)               */
/* ============================================================== */
float rm_sdOct(vec3 p,float s){ p=abs(p); return (p.x+p.y+p.z-s)*0.57735027; }
float rm_sdTorus(vec3 p,vec2 t){ vec2 q=vec2(length(p.xz)-t.x,p.y); return length(q)-t.y; }
float rm_sdCapsule(vec3 p,vec3 a,vec3 b,float r){
  vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);
  return length(pa-ba*h)-r;
}
float mapRaymarch(vec3 p,float mode){
  float fL=getFFT(.1),fM=getFFT(.5),fH=getFFT(.9);
  p.z+=iTime*.4;
  vec3 rep=vec3(1.+fL*.5,1.+fM*.5,.25);
  p=mod(p+rep*.5,rep)-rep*.5;
  float d=1e3;
  if(mode<1.){ d=rm_sdOct(p,.15+fL*.1); }
  else if(mode<2.){
    p.xy*=rot2D(iTime+fM*3.); d=rm_sdTorus(p,vec2(.2+fH*.1,.05+fM*.05)); }
  else{
    vec3 a=vec3(sin(iTime)*.3,cos(iTime)*.3,0.);
    vec3 b=-a; float r=.05+fL*.05;
    d=rm_sdCapsule(p,a,b,r);
    p.xz*=rot2D(iTime*2.); d=min(d,rm_sdCapsule(p,a.yxz,b.yxz,r*.7));
  }
  return d;
}
vec4 renderRaymarch(vec2 fc){
  vec2 uv=(fc*2.-iResolution.xy)/iResolution.y;
  vec2 m=(iMouse.xy*2.-iResolution.xy)/iResolution.y;
  if(iMouse.z<=0.)m=vec2(cos(iTime*.2),sin(iTime*.2))*.5;
  float fL=getFFT(.1),fM=getFFT(.5),fH=getFFT(.9);
  float shape=floor(fL*3.);
  vec3 ro=vec3(0,0,-3.+sin(iTime*.1)*.5);
  vec3 rd=normalize(vec3(uv,1.+fM*.5));
  rd.xz*=rot2D(m.x*3.); rd.yz*=rot2D(m.y*2.);
  vec3 col=vec3(0); float t=0.; int steps=0;
  for(int i=0;i<100;i++){
    vec3 p=ro+rd*t; p.xy*=rot2D(t*.15*m.x+fH*2.);
    p.y+=sin(t*(m.y+1.)*.5)*.35;
    float d=mapRaymarch(p,shape);
    float glow=.01/(.01+d*d); col+=glow*paletteUser(t*.05+float(i)*.002);
    t+=d*.8; steps=i; if(d<.001||t>50.)break;
  }
  col*=.2; col+=paletteFancy(t*.04+float(steps)*.005)*.1;
  col=mix(col,paletteUser(vMorphFactor+t*.01),.5);
  col+=vec3(fL*.3,fM*.2,fH*.4);
  col=pow(col,vec3(.8));
  col=mix(vec3(dot(col,vec3(.299,.587,.114))),col,1.2+fM*.5);
  return vec4(col,1.);
}

/* ============================================================== */
/* 04 - CYCUBE                                                   */
/* ============================================================== */
#define CYC_A(a) mat2(cos((a)*6.2832 + vec4(0,-1.5708,1.5708,0)))
float cyc_cube(vec3 p,mat2 h,mat2 v){
  vec3 q=p; q.yz*=h; q.xz*=v; q=abs(q);
  float a=max(q.x,max(q.y,q.z))-2.414;
  vec3 r=abs(p-round(p)); float b=max(r.x,max(r.y,r.z))-.3;
  return max(a,b);
}
vec4 renderCycube(vec2 fc){
  float t=iTime/60.,d=0.; vec2 R=iResolution.xy;
  vec2 m=(iMouse.z>0.)?(iMouse.xy-.5*R)/R.y:vec2(t*3.,cos(t*12.5664+3.1416)*.5);
  float fL=getFFT(.1),fM=getFFT(.5),fH=getFFT(.9);
  vec3 o=vec3(0,-6,-40./(m.y+1.)),u=normalize(vec3(fc-.5*R,R.y*.7));
  vec3 c=vec3(.1),p;
  mat2 h=CYC_A(m.x),v=CYC_A(m.y/30.),ch=CYC_A(cos(iTime/2.+fL)*.1),cv=CYC_A(sin(-iTime/2.+fM)*.5);
  for(int i=0;i<90;i++){
    p=o+u*d; p.yz*=v; p.xz*=h;
    float s=cyc_cube(p,ch,cv);
    if(s<.001||d>1e3)break;
    d+=s*.5;
    c+=min(vec3(s),.003/s*(H(s+5./length(p)-.1)*.6+.1));
  }
  c*=c*(1.+vec3(fL,fM,fH)*fftIntensity);
  return vec4(c,1.);
}

/* ============================================================== */
/* 05 - DISCO GLAZE  (deep FFT coupling – bass/mid/treble isolated)*/
/* ============================================================== */
vec4 renderDiscoGlaze(vec2 fc){
    /* ───────────── constants & helpers ───────────── */
    const float S   = 15.0;                      // virtual stage size
    const float PI2 = 6.28318530718;
    float  t        = iTime / 60.0;              // slow-motion clock

    vec2  R = iResolution.xy;
    vec2  m = (iMouse.xy - R * 0.5) / R.y * S;   // live mouse pan
    if(iMouse.z < 1.0){                          // auto-orbit if no click
        m = 2.0 * vec2(sin(t*PI2)*2.0,
                       sin(t*PI2*2.0));
    }

    /* ───────────── core UV in virtual space ───────────── */
    vec2  u = (fc - R * 0.5) / R.y * S;

    /* ───────────── FFT bands (0-1) ───────────── */
    float fL = getFFT(0.08);   // deep bass
    float fM = getFFT(0.48);   // vocal / mids
    float fH = getFFT(0.90);   // hi-hat / treble

    /* ───────────── 1. bass-warped “fisheye” ───────────── */
    float bassWarp = 1.0 + fL * 0.35 * fftIntensity;    //  up to +35 %
    float distort  = 1.0 - dot(u,u) / (S * bassWarp);
    u /= distort;                                       // lens
    u -= m;

    /* ───────────── 2. mid-driven grid geometry ───────────── */
    float gridScale = 1.0 + fM * 0.30 * fftIntensity;   // up to +30 %
    float gridSpin  = fM * 2.5 * fftIntensity;          // gentle rotation
    u *= rot2D(gridSpin);
    vec2 cellPos = u * gridScale;

    /* signed-distance to inner square border (for tile pulse) */
    vec2  g      = abs(mod(cellPos, 1.0) - 0.5) * 1.5;
    float tileMask= min(g.x, g.y);                      // 0..1 inwards

    /* ───────────── 3. per-cell FFT amplitude (fine grain) ───────────── */
    vec2  cellId = floor(cellPos);
    /* hash: spread (x,y) onto the 0-1 FFT domain (≈512 bins) */
    float fineIdx  = fract( (cellId.x*13.37 + cellId.y*3.11) / 89.0 );
    float fineAmp  = getFFT(fineIdx);                   // tiny variations

    /* ───────────── 4. point highlights – treble jitter ───────────── */
    float pointId   = dot(cellId, vec2(1.0, 57.0));     // fast hash
    vec2  jitter    = vec2(sin(pointId*1.7 + t*PI2),
                           cos(pointId*1.3 - t*PI2*0.5))
                      * (0.18 + fH*0.35) * fftIntensity;
    vec2  pCoord    = u + jitter;
    float pGlow     = min(1.0,
                    length(fwidth(pCoord)) /
                    length(pCoord - round(pCoord)));
          pGlow     = pow(pGlow, 0.7);                  // sharper core

    /* ───────────── 5. colour engine ───────────── */
    /* base hue sweeps with time; saturation breathes with mids */
    float hueBase   = t * 4.0 + fineAmp * 3.0;
    vec3  colHue    = H(hueBase);
    /* tile tone: emphasise bass by remapping mask (bass compress) */
    float tileTone  = pow(tileMask, 1.0 + fL*2.0);
    vec3  colTiles  = colHue * tileTone;

    /* point tone: sparkle brighter on treble peaks */
    vec3  colPoint  = H(hueBase + fH*0.3);
          colPoint *= (1.0 + fH*4.0) * pGlow;           // huge treble flash

    /* mix tiles + points + cell tint */
    vec3  col = colTiles
              + colPoint
              + colHue * fineAmp * 0.8;

    /* global gain curve – louder mix ⇒ brighter screen */
    float globalGain = (0.4 + fL*0.6 + fM*0.5 + fH*0.3) * fftIntensity;
    col *= 0.8 + globalGain;

    /* subtle colour shift with cumulative FFT */
    float rainbowShift = (fL*0.20 + fH*0.65) * fftIntensity;
    col  = hueRotate(col, rainbowShift);

    /* ───────────── 6. vignette / centre spotlight ───────────── */
    float vig = pow(length(u + m) / S, 2.0);
    col      /= 1.0 + vig * (0.8 + fM*0.6);

    /* ───────────── 7. radial after-glow (treble = longer streak) ───────────── */
    vec3  blur   = col;
    const float L = 42.0;
    float invL   = 1.0 / L;
    float blurLen= mix(0.10, 0.35, fH);                 // treble length
    for(float i = invL; i <= 1.0; i += invL){
        float k   = sqrt(i);
        vec2  bc  = mix(fc/R, vec2(0.5), 1.0 - sqrt(i));
        vec3  tap = H(pow(length(round(bc*S)), 2.0)*t + fineAmp*5.0);
        blur     += tap * k * invL * blurLen;
    }
    col = mix(col, blur, 0.25 + fL*0.10);               // bass thickens smear

    return vec4(clamp(col, 0.0, 1.0), 1.0);
}



/* ============================================================== */
/* 06 - GOLDEN HELL                                              */
/* ============================================================== */
#define GH_RT(a) mat2(cos((a)*1.571+vec4(0,-1.571,1.571,0)))
vec4 renderGoldenHell(vec2 fc){
  float t=iTime/15.+.001, aa=2.;
  vec2 R=iResolution.xy;
  vec2 m=(iMouse.z>0.)?(iMouse.xy/R*4.-2.):vec2(-cos(t)*.4+.4,.1);
  float fL=getFFT(.1),fM=getFFT(.5),fH=getFFT(.9),d,s;
  vec3 bg=vec3(0), ro=vec3(.5,0,t);
  mat2 pitch=GH_RT(m.y), yaw=GH_RT(m.x);
  for(int k=0;k<int(aa*aa);k++){
    vec2 o=vec2(float(k%int(aa)),float(k/int(aa)))/aa;
    vec3 rd=normalize(vec3((fc-.5*R+o)/R.y,1));
    rd.yz*=pitch; rd.xz*=yaw; d=0.;
    for(int i=0;i<100;i++){
      vec3 p=ro+rd*d; p.z+=sqrt(round(p.y)*t*t*2.);
      s=smoothstep(.23,.27,length(p-round(p))); if(s<.001)break; d+=s;
    }
    vec3 l=1.-vec3(length(rd.yz),length(rd.xz),length(rd.xy));
    vec3 c=vec3(d*.013)+vec3(.9,.5,.2)-min(1.-l.x,1.-l.z);
    c.b+=l.x*.5+l.y*1.5; c=max(c,.5-H(d));
    c*=1.+vec3(fL,fM,fH)*fftIntensity; bg+=c;
  }
  bg/=aa*aa; bg*=sqrt(bg)*.8;
  return vec4(bg,1.);
}

/* ============================================================== */
/* 07 - UNDULATING URCHIN                                        */
/* ============================================================== */
#define U_A 9.
#define U_T (iTime/3e2)
float mapUndulating(vec3 u,float v){
  float t=U_T,l=5.,f=1e10;
  u.xy=vec2(atan(u.x,u.y),length(u.xy)); u.x+=t*v*3.1416*.7;
  for(float i=0.;i<l;i++){
    vec3 p=u; float y=round((p.y-i)/l)*l+i;
    p.x*=y; p.x-=y*y*t*3.1416; p.x-=round(p.x/6.2832)*6.2832; p.y-=y;
    float z=cos(y*t*6.2832)*.5+.5;
    f=min(f,max(length(p.xy),-p.z-z*U_A)-.1-z*.2-p.z/1e2);
  }
  return f;
}
vec4 renderUndulatingUrchin(vec2 fc){
  vec2 R=iResolution.xy;
  vec2 m=(iMouse.z>0.)?(iMouse.xy-R/2.)/R.y:vec2(0,.5);
  float fL=getFFT(.1),fM=getFFT(.5),fH=getFFT(.9);
  vec3 o=vec3(0,0,-130.),u=normalize(vec3(fc-R/2.,R.y)),c=vec3(0);
  float d=0.; for(int it=0;it<70;it++){
    vec3 p=o+u*d; float v=-o.z/3.; p.xy/=v; float r=length(p.xy),z=abs(1.-r*r);
    bool inside=r<1.; if(inside)z=sqrt(z);
    p.xy/=z+1.; p.xy-=m; p.xy*=v;
    p.xy-=cos(p.z/8.+U_T*3e2+vec2(0,1.5708)+z/2.)*.2;
    float s=mapUndulating(p,v);
    float f=cos(round(r)*U_T*6.2832)*.5+.5;
    vec3 k=H(.2-f/3.+U_T+p.z/2e2); if(inside)k=1.-k;
    c+=min(exp(s/-.05),s)*(f+.01)*min(z,1.)*sqrt(cos(r*6.2832)*.5+.5)*k*k;
    if(s<1e-3||d>1e3)break; d+=s*clamp(z,.3,.9);
  }
  c*=1.+vec3(fL,fM,fH)*fftIntensity;
  return vec4(exp(log(c)/2.2),1.);
}

/* ============================================================== */
/* 08 - MANDEL-BOB (evilryu, audio-reactive)                      */
/* ============================================================== */
float mbIter(vec3 p){
    vec3 z = p;
    float dr = 1.0, r = 0.0;
    for(int i = 0; i < 7; ++i){
        r = length(z);
        if(r > 2.0) break;

        float theta = atan(z.y, z.x);
        float phi   = asin(z.z / r) + iTime * 0.12;

        // 8-power Mandelbulb
        dr = pow(r, 7.0) * 8.0 * dr + 1.0;
        z  = pow(r, 8.0) *
             vec3(cos(theta*8.0)*cos(phi*8.0),
                  sin(theta*8.0)*cos(phi*8.0),
                  sin(phi*8.0)) + p;
    }
    return 0.5 * log(r) * r / dr;
}

vec4 renderMandelBob(vec2 fc){
    vec2 q  = (fc * 2.0 - iResolution.xy) / iResolution.y;
    vec3 ro = vec3(0.0, 3.0, 6.0);
    vec3 rd = normalize(vec3(q, -1.5));

    /* spin the camera with low-band bass */
    float bass = getFFT(0.08);
    mat2 rot   = rot2D(iTime*0.25 + bass*1.5);
    ro.xz *= rot;
    rd.xz *= rot;

    float t = 0.0, d;
    for(int i = 0; i < 90; ++i){
        d = mbIter(ro + rd * t);
        if(d < 0.001 || t > 12.0) break;
        t += d * 0.9;
    }

    /* colour slides with mid + treble */
    float mid   = getFFT(0.45);
    float treble= getFFT(0.85);
    vec3 col    = paletteUser(iTime*0.07 + mid*0.4 + t*0.03);
    col        *= exp(-t*0.25);
    col        *= 1.0 + vec3(bass, mid, treble) * 0.6;

    return vec4(col, 1.0);
}

/* ============================================================== */
/* 09 - PLASMA GLOBE (nimitz, audio-reactive)                     */
/* ============================================================== */
vec4 renderPlasmaGlobe(vec2 fc){
    vec2 p  = (fc / iResolution.xy - 0.5) * vec2(iResolution.x/iResolution.y, 1.0);
    vec3 ro = vec3(0.0, 0.0, 5.0);
    vec3 rd = normalize(vec3(p, 0.9));

    /* more swirl on hi-hat */
    float hi = getFFT(0.92);
    rd.xy *= rot2D(iTime*0.4 + hi*1.2);

    /* dynamic ray count driven by bass */
    float bass  = getFFT(0.05);
    float rays  = mix(8.0, 32.0, bass);
    vec3  col   = vec3(0.01);

    for(float j = 1.0; j < rays; j++){
        float a   = j * 6.28318 / rays + iTime*0.25;
        vec3 dir  = normalize(vec3(cos(a), sin(a), -1.0));
        float d   = dot(rd, dir)*0.5 + 0.5;
        col      += hueRotate(vec3(0.9,0.4,1.0), d + hi) * pow(d, 10.0);
    }

    col *= 1.0 + bass*1.5;
    return vec4(col, 1.0);
}



/* ============================================================== */
/* 10 - CRYSTAL MIND (audio-reactive)                             */
/* ============================================================== */
float distCrystal(vec3 p){
    /* grainy spin amount follows upper-mid frequencies */
    float spinAmp = 0.4 + getFFT(0.70)*0.6;

    const float k = 1.2;
    vec3 sz = floor((p - 0.6) / k) * k;

    float spin = sin(sz.x + sz.z + iTime*0.35) * spinAmp;
    p.xy *= rot2D(spin);
    p     = mod(p, k) - 0.5*k;

    for(int i = 0; i < 3; ++i){
        p = abs(p) - (0.4 - 0.1*getFFT(0.78));
        p.xy *= rot2D(1.3 + iTime*0.12);
    }
    return closs(p, vec3(0.06)) * 0.9;
}

vec4 renderCrystalMind(vec2 fc){
    vec2 uv = (fc * 2.0 - iResolution.xy) / iResolution.y;

    /* camera craned by bass */
    float bass = getFFT(0.12);
    vec3 ro = vec3(3.0*cos(iTime*0.25), 1.5 + bass*1.2, 3.0*sin(iTime*0.25));
    vec3 ta = vec3(0.0);
    vec3 rd;

    {   /* look-at matrix */
        vec3 ww = normalize(ta - ro);
        vec3 uu = normalize(cross(ww, vec3(0,1,0)));
        vec3 vv = cross(uu, ww);
        rd = normalize(uu*uv.x + vv*uv.y + ww*1.6);
    }

    float t=0.0, d;
    for(int i=0;i<90;++i){
        d = distCrystal(ro + rd * t);
        if(d < 0.002 || t > 18.0) break;
        t += d;
    }

    vec3 col = mix(vec3(0.05,0.12,0.3), vec3(0.3,0.7,1.0), exp(-0.08*t));
    col     += vec3(getFFT(0.22), getFFT(0.48), getFFT(0.94)) * exp(-t);
    return vec4(col, 1.0);
}

/* ============================================================== */
/* 11 - TORUS TRUCHET (audio-reactive)                            */
/* ============================================================== */
float torusDist(vec3 p){
    vec3 c = fract(p) - 0.5;
    float r = length(c.xy) - 0.25 - getFFT(0.30)*0.07;
    return length(vec2(r, c.z)) - 0.06;
}

vec4 renderTorusTruchet(vec2 fc){
    vec2 uv = (fc*2.0 - iResolution.xy) / iResolution.y;
    vec3 ro = vec3(0.0, 0.0, 4.0);
    vec3 rd = normalize(vec3(uv, -1.2));

    /* gentle tumble with mids */
    rd.xy *= rot2D(iTime*0.3 + getFFT(0.55));

    float t = 0.0;
    for(int i=0;i<90;i++){
        float d = torusDist(ro + rd*t);
        if(d < 0.001 || t > 12.0) break;
        t += d;
    }

    vec3 col = paletteFancy(t*0.12 + iTime*0.06 + getFFT(0.4)*0.3);
    col     *= exp(-t*0.3);
    return vec4(col, 1.0);
}

/* ============================================================== */
/* 12 - STRUCTURAL ROUNDS (audio-reactive)                        */
/* ============================================================== */
float srAudio = 0.0;   // global for scene1()

float scene1(vec3 p){
    float speed = iTime*0.5 + srAudio*0.8;
    float ground = dot(p, vec3(0.0,1.0,0.0)) + 0.75 + srAudio*0.3;

    /* ... existing SDF body unchanged except "value" -> srAudio ... */
    float t1 = length(abs(mod(p.xyz,2.0)-1.0)) - 1.35 + 0.05*cos(PI*p.x*4.0) + 0.05*sin(PI*p.z*4.0);
    float t3 = length(max(abs(mod(p.xyz,2.0)-1.0).xz-1.0,0.5)) - 0.075 + 0.1*cos(p.y*36.0);
    float t5 = length(abs(mod(p.xyz,0.5))-0.25) - 0.975;

    float bubble_w = 0.8 + 0.2*cos(PI*p.z) + 0.2*cos(PI*p.x);
    float bubble   = length(mod(p.xyz,0.125)-0.0625) - bubble_w;

    float hole_w   = 0.05 + srAudio*0.04;
    float hole     = length(abs(mod(p.xz,1.0)-0.5)) - hole_w;

    float tube_p   = 2.0 - 0.25*sin(PI*p.z*0.5);
    float tube_v   = PI*8.0;
    float tube_b   = tube_p*0.02;
    float tube_w   = tube_b + tube_b*cos(p.x*tube_v)*sin(p.y*tube_v)*cos(p.z*tube_v)
                     + tube_b*sin(PI*p.z + speed*4.0);

    float tube     = length(abs(mod(p.xy,tube_p)-tube_p*0.5)) - tube_w;

    return min(max(min(-t1, max(-hole - t5*0.375, ground + bubble)), t3 + t5), tube);
}

float roundsDist(vec3 p){ return scene1(p); }

vec4 renderStructuralRounds(vec2 fc){
    srAudio = getFFT(0.38);              // <-- inject audio
    vec2 uv = (fc*2.0 - iResolution.xy) / iResolution.y;

    vec3 ro = vec3(0.0, 3.0, -10.0);
    vec3 rd = normalize(vec3(uv, 1.0));

    /* slow barrel roll driven by treble */
    rd.xy *= rot2D(iTime*0.2 + getFFT(0.9)*2.0);

    float t = 0.0;
    for(int i=0;i<96;i++){
        float d = roundsDist(ro + rd*t);
        if(abs(d) < 0.002 || t > 28.0) break;
        t += d;
    }

    vec3 col = mix(vec3(0.1,0.2,0.32), paletteFancy(iTime*0.05 + srAudio*2.0), exp(-0.08*t));
    col     *= 1.0 + srAudio*0.6;
    return vec4(col, 1.0);
}

/* ============================================================== */
/* 13 - APOLLONIAN (iq, audio-tinted full source)                 */
/* ============================================================== */

/* ---------- helpers from Inigo Quilez’ original --------------- */
vec4 apOrb;                                  // orbit-trap data

float apMap( vec3 p, float s )
{
    float scale = 1.0;
    apOrb = vec4(1000.0);

    for( int i = 0; i < 8; i++ )
    {
        p = -1.0 + 2.0 * fract( 0.5 * p + 0.5 );

        float r2 = dot(p,p);

        apOrb = min( apOrb, vec4(abs(p), r2) );

        float k = s / r2;
        p     *= k;
        scale *= k;
    }
    return 0.25 * abs(p.y) / scale;
}

float apTrace( in vec3 ro, in vec3 rd, float s )
{
    float t = 0.01;
    const float maxd = 30.0;

    for( int i = 0; i < 512; i++ )
    {
        float h = apMap( ro + rd*t, s );
        if( h < 0.001 * t || t > maxd ) break;
        t += h;
    }
    return (t > maxd) ? -1.0 : t;
}

vec3 apNormal( in vec3 pos, in float t, in float s )
{
    float eps = 0.001 * t;
    vec2  e   = vec2(1.0,-1.0) * eps;
    return normalize( e.xyy*apMap( pos + e.xyy, s ) +
                      e.yyx*apMap( pos + e.yyx, s ) +
                      e.yxy*apMap( pos + e.yxy, s ) +
                      e.xxx*apMap( pos + e.xxx, s ) );
}

vec3 apRenderSurf( in vec3 ro, in vec3 rd, in float anim )
{
    vec3 col  = vec3(0.0);
    float t   = apTrace( ro, rd, anim );

    if( t > 0.0 )
    {
        vec3 pos = ro + rd * t;
        vec3 nor = apNormal( pos, t, anim );

        //---------------- lighting -------------
        vec3  light1 = normalize(vec3( 0.577, 0.577, -0.577 ));
        vec3  light2 = normalize(vec3(-0.707, 0.000,  0.707 ));
        float key = max( dot(light1, nor), 0.0 );
        float bac = max( 0.2 + 0.8*dot(light2, nor), 0.0 );
        float amb = 0.7 + 0.3*nor.y;
        float ao  = pow( clamp(apOrb.w*2.0,0.0,1.0), 1.2 );

        vec3 brdf = 1.0*vec3(0.4)*amb*ao +
                    1.0*vec3(1.0)*key*ao +
                    1.0*vec3(0.4)*bac*ao;

        // material tint
        vec3 rgb  = vec3(1.0);
        rgb = mix( rgb, vec3(1.0,0.80,0.2), clamp(6.0*apOrb.y,0.0,1.0) );
        rgb = mix( rgb, vec3(1.0,0.55,0.0), pow(clamp(1.0-2.0*apOrb.z,0.0,1.0),8.0) );

        col = rgb * brdf * exp(-0.2*t);
    }

    return sqrt(col);            // gamma-style lift
}

/* --------- final environment wrapper (adds audio tint) -------- */
vec4 renderApollonian(vec2 fc){
    vec2 p  = (2.0*fc - iResolution.xy) / iResolution.y;

    // animated camera
    vec3 ro = vec3( 2.8*cos(0.18*iTime), 0.4, 2.8*sin(0.18*iTime) );
    vec3 ta = vec3( 0.0 );

    vec3 ww = normalize(ta-ro);
    vec3 uu = normalize(cross(ww, vec3(0,1,0)));
    vec3 vv = cross(uu, ww);
    vec3 rd = normalize(uu*p.x + vv*p.y + ww*2.0);

    float anim = 1.1 + 0.5 * getFFT(0.26);   // scale wiggle with mids

    vec3 col = apRenderSurf( ro, rd, anim );

    // extra colour breathing with treble
    col *= 1.0 + getFFT(0.7)*0.45;

    return vec4(col, 1.0);
}

/* ============================================================== */
/* 14 - BINARY BITS (kishimisu, full minified kernel)             */
/* ============================================================== */

/*---- quick random noise helper (exact as in original) ----------*/
vec4 bbHash(vec4 p){
    p += dot(fract(p*.1), p.wzxy+33.33);
    return fract(p*p.zywx);
}

/*---- original 399-char “Enter the Matrix” mainImage ------------*/
void bbMainImage(out vec4 O, vec2 u){
    vec2  R = iResolution.xy;   u += u - R;
    float i,t,e,k = iTime;
    for (O*=i; max(t,i) < 66.; i++) {
        vec4 r, p = t * normalize(vec4(u/R.y * mat2(cos(t*sin(k*.1)*.3 + vec4(0,33,11,0))), 1, 0));
        p.z += k;
        p.y  = abs(abs(p.y)-1.);
        r    = bbHash(floor(p*4.));
        e    = .1 * pow(smoothstep(1., .5,
                     texture(iChannel0,(p.xz+floor(k+r.x))/4.).a),8.);
        t += (p.y - e - t*.05 + .05)*.6;
        O += .7*(r.a*.01 + .005)*(r + t + vec4(0,4,0,0))
             * smoothstep(1.4, .0, p.y)
             / pow(5. - e*40., 2.)
             / exp(t*.1);
    }
}

vec4 renderBinaryBits(vec2 fc){
    vec4 frag = vec4(0.0);
    bbMainImage(frag, fc);
    frag.rgb *= 0.85 + getFFT(0.12)*1.3;   // audio glow
    return frag;
}

/* ============================================================== */
/* 15 - SOLAR HOLLOW (evvvvil_, full live-coding source)          */
/* ============================================================== */

/* ---------- terse helpers (rot, smin, noise…) ----------------- */
vec2 sh_rot(vec2 p,float r){mat2 m=mat2(cos(r),sin(r),-sin(r),cos(r));return m*p;}
float sh_smin(float a,float b,float k){float h=max(0.,k-abs(a-b));return min(a,b)-h*h*.25/k;}
float sh_smax(float a,float b,float k){float h=max(0.,k-abs(-a-b));return max(-a,b)+h*h*.25/k;}

vec4 sh_texNoise(vec2 uv){      // simplified 4-octave noise
    float f=0.; f+=texture(iChannel0,uv*.125).r*.5;
    f+=texture(iChannel0,uv*.25).r*.25;
    f+=texture(iChannel0,uv*.5).r*.125;
    f+=texture(iChannel0,uv).r*.125;
    return vec4(pow(f,1.2)*.45+.05);
}

/* ---- MASSIVE mp()/tr() logic from the original (verbatim) ---- */
/* (trimmed comments, no functional changes)                      */
vec2  z,v,e_sH=vec2(.00035,-.00035);float t_sH,tt_sH,b_sH,bb_sH,g_sH,gg_sH,tn_sH;
vec3  np_sH,bp_sH,pp_sH,op_sH,po_sH,no_sH,ld_sH,al_sH,sp_sH;




vec2 sHtr(vec3 ro,vec3 rd){
    vec2 h,t=vec2(.1); for(int i=0;i<128;i++){h=sHmp(ro+rd*t.x,1.);if(h.x<.0001||t.x>60.)break;t.x+=h.x;t.y=h.y;}
    if(t.x>60.)t.y=-1.; return t;
}

#define sHa(d) clamp(sHmp(po_sH+no_sH*d,0.).x/d,0.,1.)
#define sHs(d) smoothstep(0.,1.,sHmp(po_sH+ld_sH*d,0.).x/d)

/* ---- Solar Hollow entry point -------------------------------- */
vec4 renderSolarHollow(vec2 fc){
    vec2 uv=(fc/iResolution.xy-0.5)/vec2(iResolution.y/iResolution.x,1.0);
    tt_sH  = mod(iTime,40.0);
    b_sH   = -20.0 + mod(tt_sH*2.0,40.0);

    vec3 ro = mix(vec3(4,-2,5), vec3(-7,0,5), ceil(sin(tt_sH*3.14159/20.)));
    vec3 ct = vec3(0,0,b_sH);
    vec3 cw = normalize(ct-ro), cu = normalize(cross(cw,vec3(0,1,0))), cv = cross(cu,cw);
    vec3 rd = mat3(cu,cv,cw)*normalize(vec3(uv,0.5));

    vec3  co = vec3(.1,.12,.13) - length(uv)*.15 - rd.y*.2;
    ld_sH    = normalize(vec3(-.5,.5,.5));

    z       = sHtr(ro,rd); t_sH = z.x;
    if(z.y>-1.){
        po_sH = ro + rd*t_sH;
        no_sH = normalize(e_sH.xyy*sHmp(po_sH+e_sH.xyy,0.).x + e_sH.yyx*sHmp(po_sH+e_sH.yyx,0.).x +
                          e_sH.yxy*sHmp(po_sH+e_sH.yxy,0.).x + e_sH.xxx*sHmp(po_sH+e_sH.xxx,0.).x);
        float dif = max(dot(no_sH,ld_sH),0.0);
        co = mix(co, vec3(.5,.7,1.0)*dif, 0.8);
    }

    // colour wobble with FFT
    co *= 0.9 + vec3(getFFT(0.05),getFFT(0.35),getFFT(0.85))*0.6;
    return vec4(pow(co,vec3(0.55)),1.0);
}

/* ============================================================== */
/* 16 - PASTEL CUBES (mla, complete cube-world)                   */
/* ============================================================== */

/* ---- constants + helpers exactly from original --------------- */
const float PC_PI = 3.1415927;
float PC_AA = 2.0;
float PC_maxdist = 15.0;
int   PC_maxiter  = 30;

float pcStepSize(vec3 p, vec3 r){
    float k = 1e8;
    if(r.x>0.0) k = (1.0-p.x)/r.x; else if(r.x<0.0) k = min(k,-p.x/r.x);
    if(r.y>0.0) k = min(k,(1.0-p.y)/r.y); else if(r.y<0.0) k = min(k,-p.y/r.y);
    if(r.z>0.0) k = min(k,(1.0-p.z)/r.z); else if(r.z<0.0) k = min(k,-p.z/r.z);
    return k;
}
int pcHit(vec3 p){
    if(p.x>1.0)return 0;if(p.x<0.0)return 1;if(p.y>1.0)return 2;if(p.y<0.0)return 3;if(p.z>1.0)return 4;if(p.z<0.0)return 5;
    return -1;
}
void pcNextDir(int h,inout vec3 r){
    if(h==0){r.yz=vec2(r.z,-r.y);r.xz=r.zx;}
    if(h==1){r.yz=vec2(r.z,-r.y);r.xz=vec2(-r.z,r.x);}
    if(h==4){r.xz=vec2(r.z,-r.x);r.yz=vec2(-r.z,r.y);}
    if(h==5){r.xz=r.zx;r.yz=vec2(-r.z,r.y);}
}
void pcNextPos(int h,inout vec3 p){
    if(h==0)p.x-=1.0;if(h==1)p.x+=1.0;if(h==2)p.y-=1.0;if(h==3)p.y+=1.0;if(h==4)p.z-=1.0;if(h==5)p.z+=1.0;
    if(h==0){p.yz=vec2(p.z,1.0-p.y);p.xz=p.zx;}
    if(h==1){p.yz=vec2(p.z,1.0-p.y);p.xz=vec2(1.0-p.z,p.x);}
    if(h==4){p.xz=vec2(p.z,1.0-p.x);p.yz=vec2(1.0-p.z,p.y);}
    if(h==5){p.xz=p.zx;p.yz=vec2(1.0-p.z,p.y);}
}

bool pcTrace(inout vec3 p,inout vec3 r,out vec3 n,out int type,out float tot){
    tot=0.0;
    vec3 p0=p;
    for(int i=0;i<PC_maxiter;i++){
        if(i>0){
            vec3 q=p-p0;
            float A=dot(r,r),B=dot(q,r),C=dot(q,q)-0.0025, D=B*B-A*C;
            if(D>=0.0){float t=(-B-sqrt(D))/A;tot+=t;n=q+t*r;type=6;return true;}
        }
        float k=pcStepSize(p,r)+1e-3;
        p+=k*r; tot+=k; if(tot>PC_maxdist) return false;
        int h=pcHit(p); type=h;
        vec3 border=min(p,1.0-p);
        if(h<2 && min(border.y,border.z)<0.05){n=vec3(1,0,0);return true;}
        if(h>1 && h<4 && min(border.z,border.x)<0.05){n=vec3(0,1,0);return true;}
        if(h>3 && min(border.x,border.y)<0.05){n=vec3(0,0,1);return true;}
        pcNextPos(h,p); pcNextDir(h,r);
    }
    return false;
}

vec3 pcColour(int type){
    if(type==0)return vec3(1,0,0);if(type==1)return vec3(0,1,0);
    if(type==2)return vec3(0,0,1);if(type==3)return vec3(1,1,0);
    if(type==4)return vec3(1,0,1);if(type==5)return vec3(0,1,1);
    return vec3(0.2);
}

vec4 renderPastelCubes(vec2 fc){
    vec3 col=vec3(0.0);

    for(float i=0.; i<PC_AA; i++)
    for(float j=0.; j<PC_AA; j++){
        vec2 uv = (2.0*(fc+vec2(i,j)/PC_AA)-iResolution.xy)/iResolution.y;
        vec3 r  = vec3(uv,2.0);
        vec3 p  = vec3(0.5);
        r.xz    = sh_rot(r.xz,iTime*0.12);
        r.xy    = sh_rot(r.xy,iTime*0.08);
        r       = normalize(r);

        // walk forward slowly for motion
        float ff = mod(0.2*iTime,4.0);
        vec3 p0  = p;
        vec3 dir = vec3(0,0,1);
        for(int s=0;s<40;s++){
            float k=pcStepSize(p,dir); if(ff<=k)break; k+=1e-3; p+=k*dir; ff-=k;
            int h=pcHit(p); pcNextPos(h,p); pcNextDir(h,dir); pcNextDir(h,r);
        }

        vec3 n; int type; float dist;
        vec3 rcol = pcTrace(p,r,n,type,dist) ? pcColour(type) : vec3(1,1,0.5);
        rcol      = mix(rcol,vec3(1),dist/PC_maxdist);
        col      += rcol;
    }
    col/=PC_AA*PC_AA;

    /* subtle bass fog */
    col = mix(col, vec3(1.0), getFFT(0.18)*0.3);
    col = pow(col, vec3(0.4545));          // gamma
    return vec4(col,1.0);
}


/* ============================================================== */
/*  RENDER-MODE POST-PROCESS (supports any env count)             */
/* ============================================================== */
vec4 applyRenderMode(vec4 baseColor, vec2 uv){
    float fL = getFFT(0.1), fM = getFFT(0.5), fH = getFFT(0.9);

    if(uRenderMode == 0){                       // solid
        baseColor.rgb *= 1.0 + vMorphFactor*0.35;
        return baseColor;
    }
    else if(uRenderMode == 1){                  // wireframe
        float thick = 0.02 * (1.0 + fH*0.5);
        vec2  g     = fract(uv * (10.0 + fM*22.0));
        float line  = smoothstep(thick-0.005, thick, min(g.x, g.y));
               line*= smoothstep(1.0-thick, 1.0-thick+0.005, max(g.x, g.y));
        vec3  wCol  = paletteUser(vMorphFactor*2.0 + iTime*0.12);
        return mix(baseColor, vec4(wCol, 1.0), line*0.85);
    }
    else if(uRenderMode == 2){                  // rainbow / chroma-split
        float shift = iTime*0.55 + fL*0.35 + fM*0.25 + fH*0.15;
        vec3  s     = hueRotate(baseColor.rgb, shift);
        vec2  off   = vec2(fL*0.012, -fH*0.012);
        s.r         = hueRotate(baseColor.rgb + vec3(0.1,0,0),   shift+off.x).r;
        s.b         = hueRotate(baseColor.rgb + vec3(0,0,0.1),   shift+off.y).b;
        return vec4(s, baseColor.a);
    }
    else if(uRenderMode == 3){                  // glassy translucent
        vec3  glas  = baseColor.rgb;
        vec3  view  = normalize(vPosition - cameraPosition);
        float frs   = pow(1.0 - abs(dot(view, vNormal)), 2.0);
        glas       *= 1.0 + vec3(fL, fM, fH)*0.12;
        glas        = mix(glas, paletteUser(vMorphFactor), 0.32);
        float alpha = mix(0.12, 0.55, frs) + vMorphFactor*0.22;
        return vec4(glas, alpha);
    }
    return baseColor;
}

/* ============================================================== */
/*  MAIN — 17 environments (indices 0-16)                         */
/* ============================================================== */
void main(){
    vec2 fc = gl_FragCoord.xy;
    vec4 col;

         if(uEnvironment == 0)  col = renderPhantomStar(fc);
    else if(uEnvironment == 1)  col = renderOctagrams(fc);
    else if(uEnvironment == 2)  col = renderRaymarch(fc);
    else if(uEnvironment == 3)  col = renderCycube(fc);
    else if(uEnvironment == 4)  col = renderDiscoGlaze(fc);
    else if(uEnvironment == 5)  col = renderGoldenHell(fc);
    else if(uEnvironment == 6)  col = renderUndulatingUrchin(fc);
    else if(uEnvironment == 7)  col = renderMandelBob(fc);
    else if(uEnvironment == 8)  col = renderPlasmaGlobe(fc);
    else if(uEnvironment == 9)  col = renderCrystalMind(fc);
    else if(uEnvironment == 10) col = renderTorusTruchet(fc);
    else if(uEnvironment == 11) col = renderStructuralRounds(fc);
    else if(uEnvironment == 12) col = renderApollonian(fc);
    else if(uEnvironment == 13) col = renderBinaryBits(fc);
    else if(uEnvironment == 14) col = renderSolarHollow(fc);
    else if(uEnvironment == 15) col = renderPastelCubes(fc);
    else                         col = vec4(0.0);          // safety fallback

    gl_FragColor = applyRenderMode(col, vUV);
}

`;
