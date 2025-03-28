// src/config/supershapeConfigs.ts
import { SupershapeConfig } from "@/types";

export const allSupershapeConfigs: SupershapeConfig[] = [
  // Code 1 & 2 (Identical)
  {
    type: "supershape",
    params: {
      params1: { m: 1, n1: 77, n2: 0.81, n3: 71.7, a: 1, b: 1 },
      params2: { m: 8, n1: 0.63, n2: 2.92, n3: 0.24, a: 1, b: 1 },
      resol: 200,
    },
  },
  // Coordinates example 1
  {
    type: "supershape",
    params: {
      params1: { m: 9, n1: 92, n2: 0.3, n3: -45, a: 1, b: 1 },
      params2: { m: 4, n1: -0.8, n2: 88, n3: -0.35, a: 1, b: 1 },
      resol: 202,
    },
  },
  // Coordinates example 2
  {
    type: "supershape",
    params: {
      params1: { m: 9, n1: -70, n2: -0.14, n3: 77, a: 1, b: 1 },
      params2: { m: 2, n1: 0.38, n2: 4.12, n3: -0.7, a: 1, b: 1 },
      resol: 200,
    },
  },
  // Coordinates example 3
  {
    type: "supershape",
    params: {
      params1: { m: 7, n1: 20.45, n2: -0.33, n3: -3.54, a: 1, b: 1 },
      params2: { m: 6, n1: -0.96, n2: 4.46, n3: 0.52, a: 1, b: 1 },
      resol: 200,
    },
  },
  // Code 5 - Example 1
  {
    type: "supershape",
    params: {
      params1: { m: 1, n1: 77, n2: 0.81, n3: 71.7, a: 1, b: 1 },
      params2: { m: 8, n1: 0.63, n2: 2.92, n3: 0.24, a: 1, b: 1 },
      resol: 100,
    },
  },
  // Code 5 - Example 2
  {
    type: "supershape",
    params: {
      params1: { m: 9, n1: 92, n2: 0.3, n3: -45, a: 1, b: 1 },
      params2: { m: 4, n1: -0.8, n2: 88, n3: -0.35, a: 1, b: 1 },
      resol: 39,
    },
  },
  // Code 5 - Example 3
  {
    type: "supershape",
    params: {
      params1: { m: 4, n1: 1, n2: 1, n3: 1, a: 1, b: 1 },
      params2: { m: 0, n1: 1, n2: 1, n3: 1, a: 1, b: 1 },
      resol: 50,
    },
  },
  // Code 6 (Same as Code 1 & 2)
  {
    type: "supershape",
    params: {
      params1: { m: 1, n1: 77, n2: 0.81, n3: 71.7, a: 1, b: 1 },
      params2: { m: 8, n1: 0.63, n2: 2.92, n3: 0.24, a: 1, b: 1 },
      resol: 200,
    },
  },
  // Code 9 (Parametric)
  {
    type: "parametric_code9",
    params: {
      n1_1: -1 / 0.5,
      n2_1: 2.5,
      n3_1: 2.5,
      m_1: 12,
      n1_2: -1 / 0.5,
      n2_2: 2.5,
      n3_2: 2.5,
      m_2: 36,
    },
  },
  // Code 10
  {
    type: "supershape",
    params: {
      params1: { m: 8, n1: 20, n2: -1, n3: -1, a: 1, b: 2 },
      params2: { m: 8, n1: 20, n2: -1, n3: -1, a: 1, b: 2 },
      resol: 120,
    },
  },
  // Code 11 (MakeMesh - Vase example)
  {
    type: "make_mesh",
    params: {
      a1: 1,
      b1: 1,
      a2: 1,
      b2: 1,
      m1: 4,
      n11: -12,
      n12: 1,
      n13: 1,
      m2: 8.5,
      n21: 1,
      n22: -1,
      n23: -2,
      inc: 180,
    },
  },
  // Code 12
  {
    type: "supershape",
    params: {
      params1: { m: 18, n1: 1, n2: 4, n3: 1, a: 1, b: 1 },
      params2: { m: 6, n1: 1, n2: 4, n3: -1, a: 1, b: 1 },
      resol: 800,
    },
  },
  // Code 13
  {
    type: "supershape",
    params: {
      params1: { m: 24, n1: 400, n2: 38, n3: -34, a: 0.6, b: 0.2 },
      params2: { m: 12, n1: -600, n2: 100, n3: 12, a: 1.8, b: 0.1 },
      resol: 800,
    },
  },
  // Code 14
  {
    type: "supershape",
    params: {
      params1: {
        m: 8,
        n1: 100,
        n2: 38.1786553544725,
        n3: -34,
        a: 0.536393322550127,
        b: 0.287026581621754,
      },
      params2: {
        m: 9,
        n1: 100,
        n2: 300,
        n3: 12,
        a: 1.42240668965728,
        b: 1.12839136936552,
      },
      resol: 300,
    },
  },
  // Code 15
  {
    type: "supershape",
    params: {
      params1: {
        m: 14,
        n1: 250,
        n2: 38.1786553544725,
        n3: -34,
        a: 0.536393322550127,
        b: 0.287026581621754,
      },
      params2: {
        m: 9,
        n1: 600,
        n2: 600,
        n3: 12,
        a: 1.42240668965728,
        b: 1.12839136936552,
      },
      resol: 800,
    },
  },
  // Code 16 - Cactus (SuperShapeMesh)
  {
    type: "supershape_mesh",
    params: {
      M1: 26,
      A1: 100,
      B1: 8,
      N11: 55,
      N12: 5,
      N13: 5,
      M2: 50,
      A2: 50,
      B2: 10,
      N21: 7.5,
      N22: 10,
      N23: 100,
      ResTh: 120,
      ResPh: 120,
    },
  },
  // Code 16 - Flower (SuperShapeMesh)
  {
    type: "supershape_mesh",
    params: {
      M1: 52,
      A1: 10.0,
      B1: 16.0,
      N11: 15,
      N12: 50,
      N13: 5,
      M2: 50,
      A2: 50,
      B2: 10,
      N21: 7.5,
      N22: 10,
      N23: 10.0,
      ResTh: 150,
      ResPh: 150,
    },
  },
];
