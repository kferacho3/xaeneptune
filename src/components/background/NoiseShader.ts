// src/components/background/NoiseShader.tsx

const NoiseShader = {
    vertexShader: /* glsl */ `
      varying vec2 vUv;
  
      void main() {
        // Map from NDC to UV coordinates.
        vUv = position.xy * 0.5 + 0.5;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      varying vec2 vUv;
  
      uniform float uTime;
      uniform float uScrollProgress;
      uniform vec3 uColourPalette[4];
      uniform float uUvScale;
      uniform float uUvDistortionIterations;
      uniform float uUvDistortionIntensity;
  
      // Cosine gradient function
      vec3 cosineGradientColour(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
        return clamp(a + b * cos(6.28318 * (c * t + d)), 0.0, 1.0);
      }
  
      // Simplex noise functions (from Ashima Arts)
      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      vec4 permute(vec4 x) {
        return mod289(((x * 34.0) + 1.0) * x);
      }
      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }
      float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  
        // First corner
        vec3 i = floor(v + dot(v, vec3(C.y)));
        vec3 x0 = v - i + dot(i, vec3(C.x));
  
        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g, l.zxy);
        vec3 i2 = max(g, l.zxy);
  
        vec3 x1 = x0 - i1 + C.x;
        vec3 x2 = x0 - i2 + 2.0 * C.x;
        vec3 x3 = x0 - 1.0 + 3.0 * C.x;
  
        // Permutations
        i = mod289(i);
        vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  
        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        float n_ = 0.142857142857; // 1.0/7.0
        vec3 ns = n_ * D.wyz - D.xzx;
  
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.y;
        vec4 y = y_ * ns.x + ns.y;
        vec4 h = 1.0 - abs(x) - abs(y);
  
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
  
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
  
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
  
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
  
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
      }
  
      void main() {
        vec2 uv = vUv;
        uv.y -= uScrollProgress;
        uv *= uUvScale;
  
        // Apply noise-based uv distortion.
        for (float i = 0.0; i < uUvDistortionIterations; i++) {
          uv += snoise(vec3(uv - i * 0.2, uTime + i * 32.0)) * uUvDistortionIntensity;
        }
  
        float colourInput = snoise(vec3(uv, sin(uTime))) * 0.5 + 0.5;
        vec3 colour = cosineGradientColour(
          colourInput,
          uColourPalette[0],
          uColourPalette[1],
          uColourPalette[2],
          uColourPalette[3]
        );
  
        gl_FragColor = vec4(colour, 1.0);
      }
    `
  };
  
  export default NoiseShader;
  