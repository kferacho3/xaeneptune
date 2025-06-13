export const vertexShader = /* glsl */ `
  varying vec2 vUV;
  varying float vMorphFactor;
  varying vec3 vNormal;
  varying vec3 vPosition;

  uniform float iTime;
  uniform float fftIntensity;
  uniform sampler2D fftTexture;

  mat2 symRot(float a){
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
  }

  float getFFT(float x){
    float clamped = clamp(x, 0.0, 1.0);
    return texture2D(fftTexture, vec2(clamped, 0.5)).r;
  }

  void main() {
    vUV = uv;
    vNormal = normalize(normalMatrix * normal);

    vec3 pos = position;

    // Enhanced FFT sampling for better frequency response
    float fftLow = getFFT(0.0) + getFFT(0.05) + getFFT(0.1);
    float fftMid = getFFT(0.3) + getFFT(0.4) + getFFT(0.5);
    float fftHigh = getFFT(0.7) + getFFT(0.8) + getFFT(0.9);
    
    float bassResponse = fftLow / 3.0;
    float midResponse = fftMid / 3.0;
    float trebleResponse = fftHigh / 3.0;
    
    float combined = (bassResponse * 0.5 + midResponse * 0.3 + trebleResponse * 0.2);

    // Complex morphing based on frequency bands
    float morphSpeed = iTime * (0.2 + bassResponse * 0.3);
    float swirlAmount = combined * fftIntensity * (3.0 + midResponse * 2.0);
    
    mat2 R = symRot(morphSpeed + swirlAmount * (pos.x + pos.y));
    pos.xy = R * pos.xy;

    // Wave distortion with frequency response
    float waveFreq = 4.0 + trebleResponse * 8.0;
    float waveAmp = 0.3 * combined * fftIntensity;
    pos.z += sin((pos.x + pos.y) * waveFreq + iTime * 0.5) * waveAmp;
    
    // Radial expansion with bass
    float radialPulse = 1.0 + bassResponse * 0.5 * fftIntensity;
    pos *= radialPulse;

    // Store morph factor for fragment shader
    vMorphFactor = combined;
    vPosition = pos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;