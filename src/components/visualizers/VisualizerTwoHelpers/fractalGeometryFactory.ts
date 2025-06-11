// src/components/visualizers/VisualizerTwoHelpers/fractalGeometryFactory.ts
import * as THREE from "three";
import {
    createApollonianGasketGeometry,
    createBuddhabrotSpheresGeometry,
    createCantorDustSpheresGeometry,
    createJuliaSetSpheresGeometry,
    createKochSnowflakeSpheresGeometry,
    createMandelSpheresGeometry,
    createMengerSpongeGeometry,
    createNFlakeSpheresGeometry,
    createPythagorasTree3DCubesGeometry,
    createSierpinskiCarpetCubesGeometry,
    createSierpinskiTetrahedronSpheresGeometry,
} from "./fractalHelpers";
import { FractalType } from "./types";

// Normalized scale factors to make all fractals roughly the same size
const SCALE_FACTORS: Record<FractalType, number> = {
  mandelbulb: 1.0,
  mandelbox: 1.0,
  mengerSponge: 0.5,
  cantorDust: 0.8,
  sierpinskiCarpet: 0.7,
  juliaSet: 2.0,
  pythagorasTree: 0.6,
  kochSnowflake: 0.8,
  nFlake: 0.8,
  sierpinskiTetrahedron: 0.7,
  buddhabrot: 1.5,
  pythagorasTree3D: 0.6,
  apollonianGasket: 0.8,
};

export function createFractalGeometry(fractalType: FractalType): THREE.BufferGeometry {
  let geometry: THREE.BufferGeometry;
  
  switch (fractalType) {
    case "mandelbulb":
    case "mandelbox":
      geometry = createMandelSpheresGeometry({
        type: fractalType,
        nPower: 8,
        maxIterations: 80,
        dim: 48, // Reduced for performance
        sphereRadius: 0.015,
      });
      break;
    case "mengerSponge":
      geometry = createMengerSpongeGeometry(3, 30);
      break;
    case "cantorDust":
      geometry = createCantorDustSpheresGeometry(4, 3);
      break;
    case "sierpinskiCarpet":
      geometry = createSierpinskiCarpetCubesGeometry(3, 15);
      break;
    case "juliaSet":
      geometry = createJuliaSetSpheresGeometry(
        1.5,
        3,
        new THREE.Vector2(-0.8, 0.1565),
        0.15,
      );
      break;
    case "pythagorasTree":
      geometry = createPythagorasTree3DCubesGeometry(15, 4, 0.15);
      break;
    case "kochSnowflake":
      geometry = createKochSnowflakeSpheresGeometry(3, 8, 0.15);
      break;
    case "nFlake":
      geometry = createNFlakeSpheresGeometry(3, 8, "icosahedron", 0.3);
      break;
    case "sierpinskiTetrahedron":
      geometry = createSierpinskiTetrahedronSpheresGeometry(4, 8, 0.3);
      break;
    case "buddhabrot":
      geometry = createBuddhabrotSpheresGeometry({
        maxIterations: 10000,
        sampleCount: 30000,
        sphereRadius: 0.008,
      });
      break;
    case "pythagorasTree3D":
      geometry = createPythagorasTree3DCubesGeometry(15, 4, 0.15);
      break;
    case "apollonianGasket":
      geometry = createApollonianGasketGeometry(4);
      break;
    default:
      geometry = new THREE.BufferGeometry();
  }
  
  // Apply scale factor to normalize size
  const scale = SCALE_FACTORS[fractalType];
  geometry.scale(scale, scale, scale);
  
  return geometry;
}