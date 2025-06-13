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

/* ------------------------------------------------------------------ */
/*  SCALE SO ALL FRACTALS FIT THE SAME BOX                            */
/* ------------------------------------------------------------------ */
const SCALE: Record<FractalType, number> = {
  mandelbulb: 12,
  mandelbox: 12,
  mengerSponge: 5,
  cantorDust: 8,
  sierpinskiCarpet: 7,
  juliaSet: 15,
  pythagorasTree: 7,
  pythagorasTree3D: 3,
  kochSnowflake: 9,
  nFlake: 9,
  sierpinskiTetrahedron: 8,
  buddhabrot: 15,
  apollonianGasket: 8,
};

/* ------------------------------------------------------------------ */
/*  FRACTAL-SPECIFIC PARAMETERS                                       */
/* ------------------------------------------------------------------ */
const P = {
  mandelbulb: { nPower: 8, maxIterations: 128, dim: 64, sphereRadius: 0.02 },
  mandelbox: { maxIterations: 256, dim: 128, sphereRadius: 0.02 },
  mengerSponge: { level: 3, size: 30 },
  cantorDust: { level: 4, size: 3.5 },
  sierpinskiCarpet: { level: 3, size: 15 },
  juliaSet: {
    level: 2,
    size: 3.5,
    c: new THREE.Vector2(-0.8, 0.156),
    sphereRadius: 0.03,
  },
  pythagorasTree3D: { level: 5, size: 4, thickness: 0.15 },
  kochSnowflake: { level: 4, size: 8, sphereRadius: 0.04 },
  nFlake: { level: 2, size: 6, type: "icosahedron" as const, sphereRadius: 0.05 },
  sierpinskiTetrahedron: { level: 6, size: 8, sphereRadius: 0.08 },
  buddhabrot: { maxIterations: 10000, sampleCount: 30000, sphereRadius: 0.01 },
  apollonianGasket: { iterations: 5, minRadius: 0.03 },
};

/* ------------------------------------------------------------------ */
/*  SINGLE MUTABLE GEOMETRY POINTER FOR CLEANUP                       */
/* ------------------------------------------------------------------ */
let lastGeometry: THREE.BufferGeometry | null = null;

export function disposeFractalGeometry() {
  if (lastGeometry) {
    lastGeometry.dispose();
    lastGeometry = null;
  }
}

/* ------------------------------------------------------------------ */
/*  FACTORY                                                           */
/* ------------------------------------------------------------------ */
export function createFractalGeometry(type: FractalType): THREE.BufferGeometry {
  disposeFractalGeometry();

  const g: THREE.BufferGeometry = (() => {
    switch (type) {
      case "mandelbulb":
        return createMandelSpheresGeometry({ type, ...P.mandelbulb });
      case "mandelbox":
        return createMandelSpheresGeometry({ type, ...P.mandelbox });
      case "mengerSponge":
        return createMengerSpongeGeometry(P.mengerSponge.level, P.mengerSponge.size);
      case "cantorDust":
        return createCantorDustSpheresGeometry(P.cantorDust.level, P.cantorDust.size);
      case "sierpinskiCarpet":
        return createSierpinskiCarpetCubesGeometry(
          P.sierpinskiCarpet.level,
          P.sierpinskiCarpet.size
        );
      case "juliaSet":
        return createJuliaSetSpheresGeometry(
          P.juliaSet.level,
          P.juliaSet.size,
          P.juliaSet.c,
          P.juliaSet.sphereRadius
        );
      case "pythagorasTree":
      case "pythagorasTree3D":
        return createPythagorasTree3DCubesGeometry(
          P.pythagorasTree3D.level,
          P.pythagorasTree3D.size,
          P.pythagorasTree3D.thickness
        );
      case "kochSnowflake":
        return createKochSnowflakeSpheresGeometry(
          P.kochSnowflake.level,
          P.kochSnowflake.size,
          P.kochSnowflake.sphereRadius
        );
      case "nFlake":
        return createNFlakeSpheresGeometry(
          P.nFlake.level,
          P.nFlake.size,
          P.nFlake.type,
          P.nFlake.sphereRadius
        );
      case "sierpinskiTetrahedron":
        return createSierpinskiTetrahedronSpheresGeometry(
          P.sierpinskiTetrahedron.level,
          P.sierpinskiTetrahedron.size,
          P.sierpinskiTetrahedron.sphereRadius
        );
      case "buddhabrot":
        return createBuddhabrotSpheresGeometry(P.buddhabrot);
      case "apollonianGasket":
        return createApollonianGasketGeometry(
          P.apollonianGasket.iterations,
          P.apollonianGasket.minRadius
        );
      default:
        return new THREE.SphereGeometry(1, 32, 32);
    }
  })();

  /* ---- scale & centre ------------------------------------------- */
  const s = SCALE[type] || 1;
  g.scale(s, s, s);
  g.computeBoundingBox();
  if (g.boundingBox) {
    const c = g.boundingBox.getCenter(new THREE.Vector3());
    g.translate(-c.x, -c.y, -c.z);
  }
  g.computeVertexNormals();
  g.computeBoundingSphere();

  lastGeometry = g;
  return g;
}
