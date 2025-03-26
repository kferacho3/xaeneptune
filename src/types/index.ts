// src/types/index.ts
export type SupershapeConfig = {
  type: "supershape" | "supershape_mesh" | "parametric_code9" | "make_mesh";
  params: SupershapeParams | SupershapeMeshParams | ParametricCode9Params | MakeMeshParams;
};

export interface SupershapeParams {
  params1: {
      m: number;
      n1: number;
      n2: number;
      n3: number;
      a?: number;
      b?: number;
  };
  params2: {
      m: number;
      n1: number;
      n2: number;
      n3: number;
      a?: number;
      b?: number;
  };
  resol: number;
}

export interface SupershapeMeshParams {
  M1: number;
  A1: number;
  B1: number;
  N11: number;
  N12: number;
  N13: number;
  M2: number;
  A2: number;
  B2: number;
  N21: number;
  N22: number;
  N23: number;
  ResTh: number;
  ResPh: number;
}

export interface ParametricCode9Params {
  n1_1: number;
  n2_1: number;
  n3_1: number;
  m_1: number;
  n1_2: number;
  n2_2: number;
  n3_2: number;
  m_2: number;
}

export interface MakeMeshParams {
  a1: number;
  b1: number;
  a2: number;
  b2: number;
  m1: number;
  n11: number;
  n12: number;
  n13: number;
  m2: number;
  n21: number;
  n22: number;
  n23: number;
  inc: number;
}