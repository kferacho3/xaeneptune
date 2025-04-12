 
"use client";

import { Circle, Plane } from "@react-three/drei";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

export interface FluidTransitionEffectProps {
  isActive: boolean;                 // play animation?
  direction: "forward" | "reverse";  // forward = wash‑away, reverse = fill‑in
  onComplete: () => void;            // callback when direction finishes
}

const FluidTransitionEffect = ({
  isActive,
  direction,
  onComplete,
}: FluidTransitionEffectProps) => {
  const { size, scene, gl, camera } = useThree();

  /* -------------------------------------------------- */
  /* constants                                          */
  const resolution = 0.6;
  const dt = 0.014;
  const mouseForce = 40;
  const cursorSize = 120;
  const cellScale = [
    1 / (size.width * resolution),
    1 / (size.height * resolution),
  ] as const;

  /* -------------------------------------------------- */
  /* helper – render into FBO                           */
  const renderToFBO = (
    fbo: THREE.WebGLRenderTarget | null,
    s: THREE.Scene,
    c: THREE.Camera
  ) => {
    if (!fbo) return;
    gl.setRenderTarget(fbo);
    gl.render(s, c);
    gl.setRenderTarget(null);
  };

  /* -------------------------------------------------- */
  /* FBOs & scenes                                      */
  const fboSettings = useMemo(
    () =>
      ({
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        type: THREE.FloatType,
        depthBuffer: false,
        stencilBuffer: false,
      }) as THREE.RenderTargetOptions,
    []
  );

  const [fbo0] = useState(
    () =>
      new THREE.WebGLRenderTarget(
        size.width * resolution,
        size.height * resolution,
        fboSettings
      )
  );
  const [fbo1] = useState(
    () =>
      new THREE.WebGLRenderTarget(
        size.width * resolution,
        size.height * resolution,
        fboSettings
      )
  );

  const [advScene] = useState(() => new THREE.Scene());
  const [forceScene] = useState(() => new THREE.Scene());

  /* -------------------------------------------------- */
  /* advection pass                                     */
  const Advect = ({ src, dst }: { src: THREE.WebGLRenderTarget; dst: THREE.WebGLRenderTarget }) => {
    const mat = useRef<THREE.ShaderMaterial>(null);

    const vert = /* glsl */`
      uniform vec2 px; varying vec2 vUv;
      void main(){
        vec3 p = position; p.xy *= (1. - px * 2.); vUv = 0.5 + p.xy * 0.5;
        gl_Position = vec4(p,1.);
      }`;

    const frag = /* glsl */`
      precision highp float;
      uniform sampler2D velocity; uniform vec2 fboSize; uniform float dt;
      varying vec2 vUv;
      void main(){
        vec2 r = max(fboSize.x,fboSize.y)/fboSize;
        vec2 vel = texture2D(velocity,vUv).xy;
        vec2 uvOld = vUv - vel*dt*r;
        gl_FragColor = vec4(texture2D(velocity,uvOld).xy,0.,0.);
      }`;

    useFrame(() => {
      if (!mat.current) return;
      mat.current.uniforms.velocity.value = src.texture;
      renderToFBO(dst, advScene, camera);
    });

    return createPortal(
      <Plane args={[2,2]}>
        <shaderMaterial
          ref={mat}
          vertexShader={vert}
          fragmentShader={frag}
          uniforms={{
            px:{value:new THREE.Vector2(...cellScale)},
            fboSize:{value:new THREE.Vector2(size.width*resolution,size.height*resolution)},
            velocity:{value:src.texture},
            dt:{value:dt},
          }}
          depthWrite={false}
        />
      </Plane>, advScene);
  };

  /* -------------------------------------------------- */
  /* cursor force                                       */
  const Force = ({ dst }: { dst: THREE.WebGLRenderTarget }) => {
    const mat = useRef<THREE.ShaderMaterial>(null);
    const cur = useRef(new THREE.Vector2());
    const prev = useRef(new THREE.Vector2());
    const diff = useRef(new THREE.Vector2());

    const v = /* glsl */`
      uniform vec2 center,scale,px; varying vec2 vUv;
      void main(){
        vec2 p = position.xy * scale * 2. * px + center;
        vUv = uv; gl_Position = vec4(p,0.,1.);
      }`;
    const f = /* glsl */`
      precision highp float; uniform vec2 force; varying vec2 vUv;
      void main(){
        vec2 c = (vUv-0.5)*2.; float d = 1.-min(length(c),1.); d*=d;
        gl_FragColor = vec4(force*d,0.,1.);
      }`;

    useEffect(()=>{
      const set=(x:number,y:number)=>cur.current.set((x/size.width)*2-1, -(y/size.height)*2+1);
      const m=(e:MouseEvent)=>set(e.clientX,e.clientY);
      const t=(e:TouchEvent)=>e.touches.length&&set(e.touches[0].clientX,e.touches[0].clientY);
      window.addEventListener("mousemove",m);
      window.addEventListener("touchmove",t);
      window.addEventListener("touchstart",t);
      return()=>{window.removeEventListener("mousemove",m);window.removeEventListener("touchmove",t);window.removeEventListener("touchstart",t);};
    },[]);

    useFrame(()=>{
      diff.current.subVectors(cur.current,prev.current);
      prev.current.copy(cur.current);
      const fVec = diff.current.clone().multiplyScalar(mouseForce);
      if(mat.current){
        const pxSize = cursorSize*cellScale[0];
        mat.current.uniforms.center.value.set(
          THREE.MathUtils.clamp(cur.current.x,-1+pxSize,1-pxSize),
          THREE.MathUtils.clamp(cur.current.y,-1+pxSize,1-pxSize)
        );
        mat.current.uniforms.force.value.set(fVec.x,fVec.y);
        mat.current.uniforms.scale.value.set(cursorSize,cursorSize);
      }
      renderToFBO(dst,forceScene,camera);
    });

    return createPortal(
      <Circle args={[0.25,32]}>
        <shaderMaterial
          ref={mat}
          vertexShader={v}
          fragmentShader={f}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          uniforms={{
            center:{value:new THREE.Vector2()},
            scale:{value:new THREE.Vector2()},
            px:{value:new THREE.Vector2(...cellScale)},
            force:{value:new THREE.Vector2()},
          }}
        />
      </Circle>, forceScene);
  };

  /* -------------------------------------------------- */
  /* dissolve uniforms                                  */
  const dissolve = useMemo(()=>({
    uTime:{value:0},
    uProgress:{value:direction==="reverse"?1:0},
  }),[direction]);

  /* progress update */
  useFrame((_,dt)=>{
    if(!isActive) return;
    dissolve.uTime.value += dt;
    const speed = 0.7;
    if(direction==="forward"){                     // reveal
      dissolve.uProgress.value = Math.min(dissolve.uProgress.value + dt*speed,1);
      if(dissolve.uProgress.value>=1) onComplete();
    }else{                                         // cover
      dissolve.uProgress.value = Math.max(dissolve.uProgress.value - dt*speed,0);
      if(dissolve.uProgress.value<=0) onComplete();
    }
  });

  /* -------------------------------------------------- */
  /* shader                                             */
  const vert = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.);} `;
  const frag = /* glsl */`
    precision highp float;
    varying vec2 vUv;
    uniform float uTime, uProgress;

    float rand(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    float noise(vec2 p){
      vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
      return mix(mix(rand(i),rand(i+vec2(1,0)),u.x),
                 mix(rand(i+vec2(0,1)),rand(i+1.),u.x),u.y);
    }

    void main(){
      float n = noise(vUv*50. + uTime*0.01)*0.05;
      float radial = step(uProgress+n, distance(vUv, vec2(0.5)));

      float alpha = clamp(radial * 6.0, 0.0, 1.0);

      vec3 indigo = vec3(0.10,0.05,0.25);
      vec3 dRed   = vec3(0.30,0.00,0.10);
      vec3 col    = mix(indigo, dRed, vUv.y);

      gl_FragColor = vec4(col, alpha);
    }`;

  /* -------------------------------------------------- */
  return createPortal(
    <>


<mesh renderOrder={9999}>
       <Suspense fallback={null}>
         <Advect src={fbo0} dst={fbo1}/>
         <Force dst={fbo1}/>
       </Suspense>
       <planeGeometry args={[2,2]}/>
       <shaderMaterial
         vertexShader={vert}
         fragmentShader={frag}
         uniforms={dissolve}
         transparent
         depthWrite={false}
         depthTest={false}
         polygonOffset
        polygonOffsetFactor={-1000}
         polygonOffsetUnits={1000}
       />
     </mesh>

    </>, scene);
};

export default FluidTransitionEffect;
