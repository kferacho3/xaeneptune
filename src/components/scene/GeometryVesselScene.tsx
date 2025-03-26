import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import React from "react";
import GeometryVessel from "../visualizers/GeometryVesselMode";

const GeometryVesselScene: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 0, 150], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[100, 100, 100]} intensity={1} />
      {/* Use your HDR file for environment lighting */}
      <Environment files="/aerodynamics_workshop_1k.hdr" background />
      <GeometryVessel
        renderingMode="rainbow"
        colorMode="frequencyBased"
        audioUrl="dummy-audio.mp3"
      />
      <OrbitControls />
    </Canvas>
  );
};

export default GeometryVesselScene;
