"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import {
  FaCompactDisc,
  FaEnvelope,
  FaHeadphones,
  FaMusic,
  FaUser,
} from "react-icons/fa";
import { GiPlanetCore } from "react-icons/gi";
import * as THREE from "three";

export type Route =
  | "music"
  | "artist"
  | "beats"
  | "albums"
  | "connect"
  | "xaeneptunesworld";

interface NavigationMenuProps {
  onSelectRoute: (route: Route) => void;
  // The occluder ref is now our simplified occluder mesh.
  occluder: React.RefObject<THREE.Object3D | null>;
}

interface MarkerProps {
  children: React.ReactNode;
  position?: [number, number, number];
  onClick: () => void;
  rotation?: [number, number, number];
  occluder: React.RefObject<THREE.Object3D | null>;
}

function Marker({
  children,
  position = [0, 0, 0],
  onClick,
  rotation = [0, 0, 0],
  occluder,
}: MarkerProps) {
  const ref = useRef<THREE.Group>(null);
  // Local occlusion state
  const [isOccluded, setOccluded] = useState(false);
  // Check if the marker is within a desired range
  const [isInRange, setInRange] = useState(false);
  const isVisible = isInRange && !isOccluded;
  // Cache the vector so we don't create a new one on every frame.
  const vec = useMemo(() => new THREE.Vector3(), []);
  // For hover and click effects.
  const [hovered, setHovered] = useState(false);
  const [selected, setSelected] = useState(false);

  // Base sizes in pixels for the marker. Adjust these values as needed.
  const baseSize = 70;
  const hoveredSize = 80;
  const selectedSize = 85;
  const markerSize = selected ? selectedSize : hovered ? hoveredSize : baseSize;

  useFrame((state) => {
    if (ref.current) {
      ref.current.lookAt(state.camera.position);
      const worldPos = ref.current.getWorldPosition(vec);
      const range = state.camera.position.distanceTo(worldPos) <= 1000;
      if (range !== isInRange) setInRange(range);
    }
  });

  const handleClick = () => {
    setSelected(true);
    onClick();
    setTimeout(() => setSelected(false), 300);
  };

  const occluderArray: React.RefObject<THREE.Object3D>[] = occluder.current
    ? ([occluder] as React.RefObject<THREE.Object3D>[])
    : [];

  return (
    <group ref={ref} position={position} rotation={rotation}>
      <Html
        occlude={occluderArray}
        onOcclude={setOccluded}
        style={{
          pointerEvents: "auto",
          transition: "opacity 0.3s ease-out",
          opacity: isVisible ? 1 : 0,
        }}
      >
        <div
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="rounded-full bg-[#ECEFF1] border flex flex-col items-center justify-center text-black font-futuristic shadow transition-all duration-300 cursor-pointer"
          style={{
            width: `${markerSize}px`,
            height: `${markerSize}px`,
            // Adjust the border width based on hover state
            border: hovered ? "3px solid lightblue" : "1px solid white",
            boxShadow: "0 0 15px rgba(173,216,230,0.8)",
          }}
        >
          {children}
        </div>
      </Html>
    </group>
  );
}

Marker.displayName = "Marker";

export default function NavigationMenu({
  onSelectRoute,
  occluder,
}: NavigationMenuProps) {
  interface IconComponentProps {
    className?: string;
  }

  const routes: {
    name: string;
    route: Route;
    icon: React.ComponentType<IconComponentProps>;
    position: [number, number, number];
    rotation?: [number, number, number];
  }[] = [
    { name: "MUSIC", route: "music", icon: FaMusic, position: [15, 0, 0] },
    { name: "ARTIST", route: "artist", icon: FaUser, position: [-15, 0, 0] },
    {
      name: "BEATS",
      route: "beats",
      icon: FaHeadphones,
      position: [0, 15, 0],
    },
    {
      name: "ALBUMS",
      route: "albums",
      icon: FaCompactDisc,
      position: [0, -15, 0],
    },
    {
      name: "CONNECT",
      route: "connect",
      icon: FaEnvelope,
      position: [0, 0, 15],
    },
    {
      name: "XAE NEPTUNE",
      route: "xaeneptunesworld",
      icon: GiPlanetCore,
      position: [0, 0, -15],
    },
  ];

  return (
    <>
      {routes.map((item) => {
        const IconComponent = item.icon;
        return (
          <Marker
            key={item.route}
            position={item.position}
            rotation={item.rotation || [0, 0, 0]}
            onClick={() => onSelectRoute(item.route)}
            occluder={occluder}
          >
            <IconComponent className="text-xl" />
            <span className="text-[8px] mt-0 text-center">
              {item.name.split(" ").map((word, i) => (
                <span key={i}>
                  {word}
                  {i < item.name.split(" ").length - 1 && <br />}
                </span>
              ))}
            </span>
          </Marker>
        );
      })}
    </>
  );
}
