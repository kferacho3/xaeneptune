"use client";

import { useSpring } from "@react-spring/three";
import { useAnimations, useGLTF } from "@react-three/drei";
import { extend, ThreeElements, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

// Extend so we can reference Group in JSX
extend({ Group: THREE.Group });

// The routes we might hover over
export type Route =
  | "music"
  | "artist"
  | "beats"
  | "albums"
  | "connect"
  | "xaeneptune";
type GLTFResult = GLTF & {
  nodes: {
    earth_Material001_0: THREE.Mesh
    rings_Material006_0: THREE.Mesh
    Object_6005: THREE.Mesh
    Object_8: THREE.Mesh
    Object_4006: THREE.Mesh
    ['Brazo-Der_palette001_0']: THREE.Mesh
    ['Brazo-Izq_palette001_0']: THREE.Mesh
    Cube_Cristal_0: THREE.Mesh
    Cabeza_Material001_0: THREE.Mesh
    Cabeza_palette002_0: THREE.Mesh
    ['Mano-Der_palette001_0']: THREE.Mesh
    ['Mano-Izq_palette001_0']: THREE.Mesh
    DiscL_Disc_0: THREE.Mesh
    Atmosfera_Atmosfera_0: THREE.Mesh
    Planeta_Planeta_0: THREE.Mesh
    Object_4010: THREE.Mesh
    Object_5001: THREE.Mesh
    Object_7001: THREE.Mesh
    Object_11001: THREE.Mesh
    Object_13001: THREE.Mesh
    Object_15001: THREE.Mesh
    Object_17001: THREE.Mesh
    Object_19001: THREE.Mesh
    Object_21001: THREE.Mesh
    Object_23001: THREE.Mesh
    Object_25001: THREE.Mesh
    Object_27001: THREE.Mesh
    Object_29001: THREE.Mesh
    Object_9001: THREE.Mesh
    Object_33001: THREE.Mesh
    Object_35001: THREE.Mesh
    Object_37001: THREE.Mesh
    Object_39001: THREE.Mesh
    Object_41001: THREE.Mesh
    Object_43001: THREE.Mesh
    Object_45001: THREE.Mesh
    Object_47001: THREE.Mesh
    Object_49001: THREE.Mesh
    Object_51001: THREE.Mesh
    Object_31001: THREE.Mesh
    Object_55001: THREE.Mesh
    Object_57001: THREE.Mesh
    Object_59001: THREE.Mesh
    Object_53001: THREE.Mesh
    Object_61001: THREE.Mesh
    Object_63001: THREE.Mesh
    Object_65001: THREE.Mesh
    Object_67001: THREE.Mesh
    Object_69001: THREE.Mesh
    Object_71001: THREE.Mesh
    Object_73001: THREE.Mesh
    Object_74001: THREE.Mesh
    Object_24001: THREE.Mesh
    Object_28001: THREE.Mesh
    Object_34001: THREE.Mesh
    Object_38001: THREE.Mesh
    Object_12001: THREE.Mesh
    Object_6007: THREE.Mesh
    Object_18001: THREE.Mesh
    Floor_Center: THREE.Mesh
    Floor_Lights: THREE.Mesh
    ['Pie-Der_palette001_0']: THREE.Mesh
    ['Teclado-Piano_Material002_0']: THREE.Mesh
    ['Teclado-Piano_palette003_0']: THREE.Mesh
    LowerCaseL_LowerCase_0: THREE.Mesh
    NeedleL_Needle_0: THREE.Mesh
    UpperCaseL_Glass_0: THREE.Mesh
    UpperCaseL_UpperCase_0: THREE.Mesh
    Object_0020: THREE.Mesh
    Object_0020_1: THREE.Mesh
    Object_0020_2: THREE.Mesh
    Object_0020_3: THREE.Mesh
    Object_0020_4: THREE.Mesh
    Object_12007: THREE.Mesh
    Object_12007_1: THREE.Mesh
    Object_12007_2: THREE.Mesh
    Object_26001: THREE.Mesh
    Object_40001: THREE.Mesh
    Object_4031: THREE.Mesh
    Object_4060: THREE.Mesh
    Object_4089: THREE.Mesh
    Object_4150: THREE.Mesh
    Main_Floor_Poles: THREE.Mesh
    holo_room_metal2_01228: THREE.Mesh
    holo_room_metal2_01228_1: THREE.Mesh
    holo_room_metal2_01228_2: THREE.Mesh
    holo_room_metal2_01228_3: THREE.Mesh
    ANTIHERO_1: THREE.Mesh
    ANTIHERO_2: THREE.Mesh
  }
  materials: {
    ['Material.001']: THREE.MeshStandardMaterial
    ['Material.006']: THREE.MeshStandardMaterial
    cell_phone: THREE.MeshStandardMaterial
    ['palette.001']: THREE.MeshStandardMaterial
    Cristal: THREE.MeshStandardMaterial
    ['Material.060']: THREE.MeshStandardMaterial
    ['palette.002']: THREE.MeshStandardMaterial
    Disc: THREE.MeshStandardMaterial
    Atmosfera: THREE.MeshStandardMaterial
    Planeta: THREE.MeshStandardMaterial
    ['cell_phone.001']: THREE.MeshStandardMaterial
    ['glassBase.001']: THREE.MeshStandardMaterial
    ['glass.001']: THREE.MeshStandardMaterial
    ['equalizer.001']: THREE.MeshStandardMaterial
    ['Material.058']: THREE.MeshStandardMaterial
    ['Material.057']: THREE.MeshStandardMaterial
    ['Material.059']: THREE.MeshStandardMaterial
    Blue_Emission: THREE.MeshStandardMaterial
    Yellow_Emission: THREE.MeshStandardMaterial
    ['Material.061']: THREE.MeshStandardMaterial
    ['palette.003']: THREE.MeshStandardMaterial
    LowerCase: THREE.MeshStandardMaterial
    Needle: THREE.MeshStandardMaterial
    Glass: THREE.MeshPhysicalMaterial
    UpperCase: THREE.MeshStandardMaterial
    I_AM_MUSIC_COVER: THREE.MeshStandardMaterial
    ['Material.062']: THREE.MeshStandardMaterial
    I_AM_MUSIC_DISK: THREE.MeshStandardMaterial
    ['I_AM_MUSIC_DISK.001']: THREE.MeshStandardMaterial
    ['Material.063']: THREE.MeshStandardMaterial
    ['Material.044']: THREE.MeshStandardMaterial
    ['Material.040']: THREE.MeshStandardMaterial
    ['Material.039']: THREE.MeshStandardMaterial
    ['outline.001']: THREE.MeshStandardMaterial
    ['speaker_body.001']: THREE.MeshStandardMaterial
    ['Material.053']: THREE.MeshStandardMaterial
    ['Material.050']: THREE.MeshStandardMaterial
    ['Material.047']: THREE.MeshStandardMaterial
    ['Material.041']: THREE.MeshStandardMaterial
    metal3: THREE.MeshStandardMaterial
    metal: THREE.MeshStandardMaterial
    metal2: THREE.MeshStandardMaterial
    Orange_Emission: THREE.MeshStandardMaterial
    Purple_Emission: THREE.MeshStandardMaterial
    PaletteMaterial001: THREE.MeshStandardMaterial
  }
}



// Props for our main Scene component
export type AntiheroSceneProps = ThreeElements["group"] & {
  hoveredRoute?: Route | null;
  showVisualizer?: boolean;
};

const routeToGroupName: Record<Route, string> = {
  music: "Music",
  artist: "Artist",
  beats: "Beats",
  albums: "Albums",
  connect: "Contact",
  xaeneptune: "Xaeneptune",
};

export default function AntiheroScene({
  hoveredRoute = null,
  showVisualizer = false,
  ...props
}: AntiheroSceneProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const floatingMonitorsRef = useRef<THREE.Group>(null);

  // We'll track the "active" group (which route is displayed). Default is "AntiheroLogo".
  const [activeGroup, setActiveGroup] = useState<string>("AntiheroLogo");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load the model & animations
  const { nodes, materials, animations } = useGLTF(
    "https://xaeneptune.s3.us-east-2.amazonaws.com/glb/AntiHeroScene.glb"
  ) as unknown as GLTFResult;
  const { actions } = useAnimations(animations, groupRef);

  // Play all animations if they exist
  useEffect(() => {
    Object.values(actions).forEach((action) => action?.play());
  }, [actions]);

  // Manage switching to/from the default model after hover changes
  useEffect(() => {
    // If there's a new hoveredRoute, show that group's model immediately.
    if (hoveredRoute) {
      // Clear any pending default timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setActiveGroup(routeToGroupName[hoveredRoute]);
    } else {
      // If user hovers away (hoveredRoute = null),
      // wait 1 second, then revert to default (unless we get a new hover in that time).
      timeoutRef.current = setTimeout(() => {
        setActiveGroup("AntiheroLogo");
        timeoutRef.current = null;
      }, 1000);
    }

    // Cleanup any timer if the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hoveredRoute]);

  // We define React Springs for each group so we can scale them 0 -> 1 or 1 -> 0
  const springConfig = { tension: 180, friction: 20 };

  // AntiheroLogo (default)
  const [antiheroLogoSpring, apiAntiheroLogo] = useSpring(
    () => ({ scale: 1, config: springConfig }),
    []
  );
  // Xaeneptune
  const [xaeneptuneSpring, apiXaeneptune] = useSpring(
    () => ({ scale: 0, config: springConfig }),
    []
  );
  // Contact
  const [contactSpring, apiContact] = useSpring(
    () => ({ scale: 0, config: springConfig }),
    []
  );
  // Artist
  const [artistSpring, apiArtist] = useSpring(
    () => ({ scale: 0, config: springConfig }),
    []
  );
  // Music
  const [musicSpring, apiMusic] = useSpring(
    () => ({ scale: 0, config: springConfig }),
    []
  );
  // Beats
  const [beatsSpring, apiBeats] = useSpring(
    () => ({ scale: 0, config: springConfig }),
    []
  );
  // Albums
  const [albumsSpring, apiAlbums] = useSpring(
    () => ({ scale: 0, config: springConfig }),
    []
  );

  // Every time activeGroup changes, set the scale springs accordingly
  useEffect(() => {
    // For each group, if it's the active one => scale 1, else 0
    apiAntiheroLogo.start({
      scale: activeGroup === "AntiheroLogo" ? 0.6 : 0,
    });
    apiXaeneptune.start({
      scale: activeGroup === "Xaeneptune" ? 0.6 : 0,
    });
    apiContact.start({
      scale: activeGroup === "Contact" ? 1 : 0,
    });
    apiArtist.start({
      scale: activeGroup === "Artist" ? 0.6 : 0,
    });
    apiMusic.start({
      scale: activeGroup === "Music" ? 0.75 : 0,
    });
    apiBeats.start({
      scale: activeGroup === "Beats" ? 0.75 : 0,
    });
    apiAlbums.start({
      scale: activeGroup === "Albums" ? 1 : 0,
    });
  }, [
    activeGroup,
    apiAntiheroLogo,
    apiXaeneptune,
    apiContact,
    apiArtist,
    apiMusic,
    apiBeats,
    apiAlbums,
  ]);

  // Slowly rotate the FloatingMonitors around the Y-axis
  useFrame((_, delta) => {
    if (floatingMonitorsRef.current) {
      floatingMonitorsRef.current.rotation.y += delta * 0.05;
    }
  });

  // Domino effect shrink when showVisualizer = true
  useEffect(() => {
    if (showVisualizer && floatingMonitorsRef.current) {
      const children = floatingMonitorsRef.current.children;
      let delay = 0;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        setTimeout(() => {
          child.scale.set(0, 0, 0);
        }, delay);
        delay += 200; // each subsequent mesh shrinks 200ms later
      }
    } else if (!showVisualizer && floatingMonitorsRef.current) {
      // If we want them to come back when showVisualizer is turned off:
      const children = floatingMonitorsRef.current.children;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        // Just restore scale to 1
        child.scale.set(1, 1, 1);
      }
    }
  }, [showVisualizer]);

  return (
    <group ref={groupRef} {...props} dispose={null}>
      <group name="Scene">



        {/*
          ================
          GROUP A - Xaeneptune
          ================
        */}
        <group
          name="Xaeneptune"
          scale={[xaeneptuneSpring.scale.get(), xaeneptuneSpring.scale.get(), xaeneptuneSpring.scale.get()]}
        >

<group name="XaeNeptuneWorld" position={[0.474, 2.712, 0]} scale={0.35}>
          <group name="Atmosfera" rotation={[-Math.PI / 2, 0, 0]} scale={1.005}>
            <mesh name="Atmosfera_Atmosfera_0" geometry={nodes.Atmosfera_Atmosfera_0.geometry} material={materials.Atmosfera} />
          </group>
          <group name="Planeta" rotation={[-Math.PI / 2, 0, 0]}>
            <mesh name="Planeta_Planeta_0" geometry={nodes.Planeta_Planeta_0.geometry} material={materials.Planeta} />
          </group>
        </group>

        
        <group name="RootNode" position={[0.474, 1, 0]} scale={0.01}>
          <group name="boards" rotation={[-Math.PI / 2, 0, 0]} scale={50} />
          <group name="earth" position={[0, 88.768, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <mesh name="earth_Material001_0" geometry={nodes.earth_Material001_0.geometry} material={materials['Material.001']} />
          </group>


          <group name="rings" position={[0, 88.768, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={150.427}>
            <mesh name="rings_Material006_0" geometry={nodes.rings_Material006_0.geometry} material={materials['Material.006']} position={[-0.371, 0.279, -0.61]} scale={[5.928, 5.278, 1]} />
          </group>
        </group>

        </group>



     {/*
          ================
          GROUP B - Contact
          ================
        */}
        <group
          name="Contact"
          scale={[contactSpring.scale.get(), contactSpring.scale.get(), contactSpring.scale.get()]}
          position={[-0.5,0,0]}
        >
        <group name="GLTF_SceneRootNode010" position={[0.474, 1.496, 0]} rotation={[1.28, 0, 0]} scale={1.223}>
          <group name="1_1" position={[-1.568, -0.034, 0.194]} scale={1.007}>
            <mesh name="Object_6005" geometry={nodes.Object_6005.geometry} material={materials.cell_phone} />
          </group>
          <group name="2_2" position={[1.262, 0.09, -0.256]} scale={1.007}>
            <mesh name="Object_8" geometry={nodes.Object_8.geometry} material={materials.cell_phone} position={[0.302, -0.124, 0.447]} scale={1.242} />
          </group>
          <group name="phone_0" rotation={[0, -0.045, 0]}>
            <mesh name="Object_4006" geometry={nodes.Object_4006.geometry} material={materials.cell_phone} position={[0.022, -0.147, 0.511]} scale={1.242} />
          </group>
        </group>
        <group name="GLTF_SceneRootNode011" position={[0.51, 1.428, -0.249]} rotation={[1.28, 0, 0]} scale={1.223}>
          <group name="phone_0001" rotation={[0, -0.045, 0]}>
            <mesh name="Object_4010" geometry={nodes.Object_4010.geometry} material={materials['cell_phone.001']} position={[0.029, -0.198, 0.51]} scale={1.242} />
          </group>
        </group>
        </group>



     {/*
          ================
          GROUP C - Artist
          ================
        */}
        <group
          name="Artist"
          position={[-0.35, -1, -0.75]} 
          scale={[artistSpring.scale.get(), artistSpring.scale.get(), artistSpring.scale.get()]}
        >

        <group name="RootNode001" position={[0.474, 0, 0]} scale={0.004}>
          <group name="Brazo-Der" position={[-296.24, 1142.852, 179.537]} rotation={[0.001, 1.569, 0.931]}>
            <mesh name="Brazo-Der_palette001_0" geometry={nodes['Brazo-Der_palette001_0'].geometry} material={materials['palette.001']} />
          </group>
          <group name="Brazo-Izq" position={[293.624, 1147.427, 187.908]} rotation={[0.749, -1.567, -0.15]}>
            <mesh name="Brazo-Izq_palette001_0" geometry={nodes['Brazo-Izq_palette001_0'].geometry} material={materials['palette.001']} />
          </group>
          <group name="Cabeza" position={[-0.285, 1494.723, 157.885]} rotation={[1.878, 0, 0]}>
            <group name="Cube" position={[0.285, 160.174, 10.131]} rotation={[-1.555, 0, 0]}>
              <mesh name="Cube_Cristal_0" geometry={nodes.Cube_Cristal_0.geometry} material={materials.Cristal} />
            </group>
            <mesh name="Cabeza_Material001_0" geometry={nodes.Cabeza_Material001_0.geometry} material={materials['Material.060']} />
            <mesh name="Cabeza_palette002_0" geometry={nodes.Cabeza_palette002_0.geometry} material={materials['palette.002']} />
          </group>
          <group name="Mano-Der" position={[-289.8, 926.873, 380.071]} rotation={[2.106, 0, -1.571]} scale={[1, 0.951, 1]}>
            <mesh name="Mano-Der_palette001_0" geometry={nodes['Mano-Der_palette001_0'].geometry} material={materials['palette.001']} />
          </group>
          <group name="Mano-Izq" position={[286.891, 933.672, 401.748]} rotation={[2.111, 0.001, 1.57]} scale={[1, 0.951, 1]}>
            <mesh name="Mano-Izq_palette001_0" geometry={nodes['Mano-Izq_palette001_0'].geometry} material={materials['palette.001']} />
          </group>
        </group>

        <mesh name="Pie-Der_palette001_0" geometry={nodes['Pie-Der_palette001_0'].geometry} material={materials['palette.001']} position={[-0.115, 0.792, 0.304]} rotation={[1.653, 0, 0]} scale={0.004} />
        <mesh name="Teclado-Piano_Material002_0" geometry={nodes['Teclado-Piano_Material002_0'].geometry} material={materials['Material.061']} position={[0.474, 0, 2.755]} rotation={[Math.PI / 2, 0, 0]} scale={0.008} />
        <mesh name="Teclado-Piano_palette003_0" geometry={nodes['Teclado-Piano_palette003_0'].geometry} material={materials['palette.003']} position={[0.474, 0, 2.755]} rotation={[Math.PI / 2, 0, 0]} scale={0.008} />
        </group>







    {/*
          ================
          GROUP D - Music
          ================
        */}
        <group
          name="Music"
          scale={[musicSpring.scale.get(), musicSpring.scale.get(), musicSpring.scale.get()]}
          position={[0, -0.7, 0]}
        >
        <group name="RootNode002" position={[1.45, 3.249, 0.151]} rotation={[1.396, 0, 0]} scale={0.012}>
          <group name="DiscL" position={[-166.111, -16.389, 1.203]} rotation={[-Math.PI / 2, 0, 0]} scale={100}>
            <mesh name="DiscL_Disc_0" geometry={nodes.DiscL_Disc_0.geometry} material={materials.Disc} />
          </group>
        </group>
        <group name="GLTF_SceneRootNode016" position={[0.474, 2.142, 0]} rotation={[1.261, 0, 0]}>
          <group name="DISK_1" position={[-0.026, -0.024, 0]} scale={[2.308, 1.121, 2.308]} />
        </group>
   

        <mesh name="LowerCaseL_LowerCase_0" geometry={nodes.LowerCaseL_LowerCase_0.geometry} material={materials.LowerCase} position={[0.992, 3.155, -0.592]} rotation={[-0.174, 0, 0]} scale={1.229} />
        <mesh name="NeedleL_Needle_0" geometry={nodes.NeedleL_Needle_0.geometry} material={materials.Needle} position={[3.804, 2.721, 0.539]} rotation={[-0.174, 0, 0.001]} scale={1.229} />
        <mesh name="UpperCaseL_Glass_0" geometry={nodes.UpperCaseL_Glass_0.geometry} material={materials.Glass} position={[1.496, 3.357, 0.549]} rotation={[-0.174, 0, 0]} scale={1.229} />
        <mesh name="UpperCaseL_UpperCase_0" geometry={nodes.UpperCaseL_UpperCase_0.geometry} material={materials.UpperCase} position={[1.496, 3.357, 0.549]} rotation={[-0.174, 0, 0]} scale={1.229} />
       
        </group>





      
    




        {/*
          ================
          GROUP E - Beats
          ================
        */}
        <group
          name="Beats"
          scale={[beatsSpring.scale.get(), beatsSpring.scale.get(), beatsSpring.scale.get()]}
          position={[0, -0.5,0]}
          rotation={[0, -Math.PI / 2, 0]}
        
        >
        <group name="GLTF_SceneRootNode014" position={[-2.092, -0.727, 0.129]} scale={[1.838, 1.52, 1.838]}>
          <group name="equalizer_35001">
            <group name="baseCover_0001" position={[0, 1.797, 0]} rotation={[-Math.PI, -0.017, 0]} scale={[1.023, 1.804, 1.022]}>
              <mesh name="Object_5001" geometry={nodes.Object_5001.geometry} material={materials['glassBase.001']} />
            </group>
            <group name="glass_1001" position={[0, 1.8, 0]} rotation={[-Math.PI, 0, 0]} scale={[1.024, 1.8, 1.024]}>
              <mesh name="Object_7001" geometry={nodes.Object_7001.geometry} material={materials['glass.001']} />
            </group>
            <group name="indicator10_3001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.321, 1]}>
              <mesh name="Object_11001" geometry={nodes.Object_11001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator11_4001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.542, 1]}>
              <mesh name="Object_13001" geometry={nodes.Object_13001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator12_5001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.125, 1]}>
              <mesh name="Object_15001" geometry={nodes.Object_15001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator13_6001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.791, 1]}>
              <mesh name="Object_17001" geometry={nodes.Object_17001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator14_7001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.436, 1]}>
              <mesh name="Object_19001" geometry={nodes.Object_19001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator15_8001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.197, 1]}>
              <mesh name="Object_21001" geometry={nodes.Object_21001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator16_9001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.412, 1]}>
              <mesh name="Object_23001" geometry={nodes.Object_23001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator17_10001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.351, 1]}>
              <mesh name="Object_25001" geometry={nodes.Object_25001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator18_11001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.619, 1]}>
              <mesh name="Object_27001" geometry={nodes.Object_27001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator19_12001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.953, 1]}>
              <mesh name="Object_29001" geometry={nodes.Object_29001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator1_2001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.291, 1]}>
              <mesh name="Object_9001" geometry={nodes.Object_9001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator20_14001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.551, 1]}>
              <mesh name="Object_33001" geometry={nodes.Object_33001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator21_15001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.544, 1]}>
              <mesh name="Object_35001" geometry={nodes.Object_35001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator22_16001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.713, 1]}>
              <mesh name="Object_37001" geometry={nodes.Object_37001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator23_17001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.856, 1]}>
              <mesh name="Object_39001" geometry={nodes.Object_39001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator24_18001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.202, 1]}>
              <mesh name="Object_41001" geometry={nodes.Object_41001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator25_19001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.129, 1]}>
              <mesh name="Object_43001" geometry={nodes.Object_43001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator26_20001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.826, 1]}>
              <mesh name="Object_45001" geometry={nodes.Object_45001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator27_21001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.374, 1]}>
              <mesh name="Object_47001" geometry={nodes.Object_47001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator28_22001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.847, 1]}>
              <mesh name="Object_49001" geometry={nodes.Object_49001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator29_23001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.037, 1]}>
              <mesh name="Object_51001" geometry={nodes.Object_51001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator2_13001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.453, 1]}>
              <mesh name="Object_31001" geometry={nodes.Object_31001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator30_25001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.362, 1]}>
              <mesh name="Object_55001" geometry={nodes.Object_55001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator31_26001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.041, 1]}>
              <mesh name="Object_57001" geometry={nodes.Object_57001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator32_27001" position={[0, 0.01, 0]} rotation={[-Math.PI, 0, 0]} scale={[1, 0.925, 1]}>
              <mesh name="Object_59001" geometry={nodes.Object_59001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator3_24001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.797, 1]}>
              <mesh name="Object_53001" geometry={nodes.Object_53001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator4_28001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.715, 1]}>
              <mesh name="Object_61001" geometry={nodes.Object_61001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator5_29001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.567, 1]}>
              <mesh name="Object_63001" geometry={nodes.Object_63001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator6_30001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.031, 1]}>
              <mesh name="Object_65001" geometry={nodes.Object_65001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator7_31001" rotation={[-Math.PI, 0, 0]} scale={[1, 1.771, 1]}>
              <mesh name="Object_67001" geometry={nodes.Object_67001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator8_32001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.591, 1]}>
              <mesh name="Object_69001" geometry={nodes.Object_69001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="indicator9_33001" rotation={[-Math.PI, 0, 0]} scale={[1, 0.524, 1]}>
              <mesh name="Object_71001" geometry={nodes.Object_71001.geometry} material={materials['equalizer.001']} />
            </group>
            <group name="linees_34001" rotation={[-Math.PI, 0, 0]} scale={[0.99, 1.8, 0.99]}>
              <mesh name="Object_73001" geometry={nodes.Object_73001.geometry} material={materials['Material.058']} />
              <mesh name="Object_74001" geometry={nodes.Object_74001.geometry} material={materials['Material.057']} />
            </group>
          </group>
        </group>


        <group name="GLTF_SceneRootNode015" position={[0.474, -0.727, 2.33]}>
          <group name="Circle001_11001" position={[0.991, 1.999, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh name="Object_24001" geometry={nodes.Object_24001.geometry} material={materials['Material.059']} />
          </group>
          <group name="Circle003_13001" position={[0.991, 0.599, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh name="Object_28001" geometry={nodes.Object_28001.geometry} material={materials['Material.059']} />
          </group>
          <group name="Circle005_16001" position={[0.991, 1.999, -4.4]} rotation={[0, 0, Math.PI / 2]}>
            <mesh name="Object_34001" geometry={nodes.Object_34001.geometry} material={materials['Material.059']} />
          </group>
          <group name="Circle007_18001" position={[0.991, 0.599, -4.4]} rotation={[0, 0, Math.PI / 2]}>
            <mesh name="Object_38001" geometry={nodes.Object_38001.geometry} material={materials['Material.059']} />
          </group>
          <group name="Circle009_4001" position={[0.891, 0.304, -2.9]} rotation={[0, 0, Math.PI / 2]} scale={0.822}>
            <mesh name="Object_12001" geometry={nodes.Object_12001.geometry} material={materials['Material.059']} />
          </group>
          <group name="Circle011_1001" position={[0.891, 0.304, -1.5]} rotation={[0, 0, Math.PI / 2]} scale={0.822}>
            <mesh name="Object_6007" geometry={nodes.Object_6007.geometry} material={materials['Material.059']} />
          </group>
          <group name="Circle013_7001" position={[0.891, 1.36, -2.2]} rotation={[0, 0, Math.PI / 2]} scale={0.822}>
            <mesh name="Object_18001" geometry={nodes.Object_18001.geometry} material={materials['Material.059']} />
          </group>

        </group>



        <mesh name="Object_26001" geometry={nodes.Object_26001.geometry} material={materials['outline.001']} position={[1.465, -0.128, 2.33]} rotation={[0, 0, Math.PI / 2]} />
          <mesh name="Object_40001" geometry={nodes.Object_40001.geometry} material={materials['speaker_body.001']} position={[0.474, 0.873, -2.07]} scale={[1, 1.6, 0.737]} />
        </group>










        <mesh name="Floor_Center" geometry={nodes.Floor_Center.geometry} material={materials.Blue_Emission} position={[0, -1.433, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.848, 3.848, 0.264]} />
        <mesh name="Floor_Lights" geometry={nodes.Floor_Lights.geometry} material={materials.Yellow_Emission} position={[0.032, -1.038, -0.327]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.623, 3.623, 0.264]} />
 
    
       
            {/*
          ================
          GROUP I - Albums
          ================
        */}
        <group
          name="Albums"
          scale={[albumsSpring.scale.get(), albumsSpring.scale.get(), albumsSpring.scale.get()]}
        >
        <group name="Object_4013" position={[0.4, 2.386, 0.123]} rotation={[1.261, 0, 0]} scale={[1.294, 2.514, 1.265]}>
          <mesh name="Object_0020" geometry={nodes.Object_0020.geometry} material={materials.I_AM_MUSIC_COVER} />
          <mesh name="Object_0020_1" geometry={nodes.Object_0020_1.geometry} material={materials['Material.062']} />
          <mesh name="Object_0020_2" geometry={nodes.Object_0020_2.geometry} material={materials.I_AM_MUSIC_DISK} />
          <mesh name="Object_0020_3" geometry={nodes.Object_0020_3.geometry} material={materials['I_AM_MUSIC_DISK.001']} />
          <mesh name="Object_0020_4" geometry={nodes.Object_0020_4.geometry} material={materials['Material.063']} />
        </group>
        </group>

 
   
       
       
        <mesh name="Main_Floor_Poles" geometry={nodes.Main_Floor_Poles.geometry} material={materials.metal3} position={[-0.415, -0.441, -0.215]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.765, 1.765, 0.264]} />
       
       
       
        <group name="Main_Floor" position={[0.059, -0.441, -0.215]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.765, 1.765, 0.264]}>
          <mesh name="holo_room_metal2_01228" geometry={nodes.holo_room_metal2_01228.geometry} material={materials.metal} />
          <mesh name="holo_room_metal2_01228_1" geometry={nodes.holo_room_metal2_01228_1.geometry} material={materials.metal2} />
          <mesh name="holo_room_metal2_01228_2" geometry={nodes.holo_room_metal2_01228_2.geometry} material={materials.Orange_Emission} />
          <mesh name="holo_room_metal2_01228_3" geometry={nodes.holo_room_metal2_01228_3.geometry} material={materials.Purple_Emission} />
        </group>


        <group
          name="AntiheroLogo"
          scale={[antiheroLogoSpring.scale.get(), antiheroLogoSpring.scale.get(), antiheroLogoSpring.scale.get()]}
        >
        <group name="ANTIHERO" position={[-0.5, 3.076, -0.289]} rotation={[1.457, 0, 0]} scale={[25.024, 5.166, 25.024]}>
          <mesh name="ANTIHERO_1" geometry={nodes.ANTIHERO_1.geometry} material={materials.PaletteMaterial001} />
          <mesh name="ANTIHERO_2" geometry={nodes.ANTIHERO_2.geometry} material={nodes.ANTIHERO_2.material} />
        </group>
        </group>
     {/*
          ================
          COMBINED FLOATING MONITORS 
          ================
        */}
       <group name="FloatingMonitors" position={[0, -2, 0]} scale={1.25} ref={floatingMonitorsRef} >
<group>
        <group name="MonitorScreen001" position={[-39.096, -15.383, -17.016]} rotation={[-Math.PI / 2, 0, 1.406]} scale={-11.465}>
          <mesh name="Object_12007" geometry={nodes.Object_12007.geometry} material={materials['Material.044']} />
          <mesh name="Object_12007_1" geometry={nodes.Object_12007_1.geometry} material={materials['Material.040']} />
          <mesh name="Object_12007_2" geometry={nodes.Object_12007_2.geometry} material={materials['Material.039']} />
        </group>
    


        <mesh name="Object_4031" geometry={nodes.Object_4031.geometry} material={materials['Material.053']} position={[-6.884, -15.383, -55.284]} rotation={[-Math.PI / 2, 0, 0.169]} scale={-11.465} />
        <mesh name="Object_4060" geometry={nodes.Object_4060.geometry} material={materials['Material.050']} position={[-9.984, -15.383, -62.627]} rotation={[-Math.PI / 2, 0, 0.326]} scale={-11.465} />
        <mesh name="Object_4089" geometry={nodes.Object_4089.geometry} material={materials['Material.047']} position={[3.682, -15.383, -65.716]} rotation={[-Math.PI / 2, 0, 0.331]} scale={-11.465} />
        <mesh name="Object_4150" geometry={nodes.Object_4150.geometry} material={materials['Material.041']} position={[7.443, -15.383, -42.128]} rotation={[-Math.PI / 2, 0, 0.104]} scale={-11.465} />
        </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('https://xaeneptune.s3.us-east-2.amazonaws.com/glb/AntiHeroScene.glb')
