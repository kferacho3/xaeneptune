"use client";

import { useRouteStore } from "@/store/useRouteStore";
import { Environment, Lightformer } from "@react-three/drei";
import React from "react";

const EnvironmentLights: React.FC = () => {
  const nightMode = useRouteStore((state) => state.nightMode);

  return (
    <Environment preset="apartment" environmentIntensity={nightMode ? 0.1 : 1.3}>
      <Lightformer
        type="ring"
        scale={15}
        position={[-0.4, 1, 0]}
        color={nightMode ? "#0d4e7b" : "#e8d8b4"}
        intensity={1.2}
        onUpdate={(self) => self.lookAt(0, 0, 0)}
      />
      <Lightformer
        type="rect"
        scale={5}
        position={[0, 0.5, -11]}
        color={nightMode ? "#0d4e7b" : "#e8d8b4"}
        intensity={1.5}
      />
    </Environment>
  );
};

export default EnvironmentLights;
