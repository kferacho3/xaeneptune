// src/components/visualizers/geometryHelpers.ts
import { MakeMeshParams, SupershapeMeshParams, SupershapeParams } from "@/types";
import * as THREE from "three";

/**
 * Minimal implementation of ParametricGeometry.
 * (Since the module 'three/examples/jsm/geometries/ParametricGeometry' is not found,
 * we define our own simple version.)
 */
export class ParametricGeometry extends THREE.BufferGeometry {
    constructor(
        func: (u: number, v: number, target: THREE.Vector3) => void,
        slices: number,
        stacks: number
    ) {
        super();
        const positions: number[] = [];
        const indices: number[] = [];
        const vertices: THREE.Vector3[] = [];
        // Create vertices.
        for (let i = 0; i <= slices; i++) {
            for (let j = 0; j <= stacks; j++) {
                const u = i / slices;
                const v = j / stacks;
                const vertex = new THREE.Vector3();
                func(u, v, vertex);
                vertices.push(vertex);
                positions.push(vertex.x, vertex.y, vertex.z);
            }
        }
        // Create indices for a grid.
        for (let i = 0; i < slices; i++) {
            for (let j = 0; j < stacks; j++) {
                const a = i * (stacks + 1) + j;
                const b = (i + 1) * (stacks + 1) + j;
                indices.push(a, b, a + 1);
                indices.push(b, b + 1, a + 1);
            }
        }
        this.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        this.setIndex(indices);
        this.computeVertexNormals();
    }
}

/**
 * An adapted supershape function based on the POV-Ray macro.
 */
export function povraySupershape(
    phi: number,
    m: number,
    n1: number,
    n2: number,
    n3: number,
    a = 1,
    b = 1
): number {
    const term1 = Math.pow(Math.abs(Math.cos((m * phi) / 4) / a), n2);
    const term2 = Math.pow(Math.abs(Math.sin((m * phi) / 4) / b), n3);
    const r = Math.pow(term1 + term2, 1 / n1);
    return r === 0 ? 0 : 1 / r;
}

/**
 * Create a grid-based supershape geometry using two sets of parameters.
 */
export function createSupershapeGeometry(
    segments: number,
    params: SupershapeParams,
    radius: number,
    precomputedParams: { u: number; v: number }[]  // now an array
): THREE.BufferGeometry {
    const vertices: number[] = [];
    const { params1, params2 } = params;
    for (const { u, v } of precomputedParams) {
        const r1 = povraySupershape(u, params1.m, params1.n1, params1.n2, params1.n3, params1.a, params1.b);
        const r2 = povraySupershape(v, params2.m, params2.n1, params2.n2, params2.n3, params2.a, params2.b);
        const x = radius * r1 * Math.cos(u) * r2 * Math.cos(v);
        const y = radius * r1 * Math.sin(u) * r2 * Math.cos(v);
        const z = radius * r2 * Math.sin(v);
        vertices.push(x, y, z);
    }
    const indices: number[] = [];
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = (i + 1) * (segments + 1) + j;
            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

/**
 * Helper for the SuperShapeMesh type.
 */
function superFunction(
    M: number,
    A: number,
    B: number,
    N1: number,
    N2: number,
    N3: number
): (T: number) => number {
    const Nil = 1E-12;
    const MM = M / 4;
    const NN = -1 / N1;
    return (T: number) =>
        Math.pow(
            Nil +
            Math.pow(Math.abs(Math.cos(T * MM) / A), N2) +
            Math.pow(Math.abs(Math.sin(T * MM) / B), N3),
            NN
        );
}

/**
 * Create a supershape mesh geometry (using our ParametricGeometry) based on SuperShapeMesh.
 */
export function createSupershapeMeshGeometry(
    params: SupershapeMeshParams
): ParametricGeometry {
    const { M1, A1, B1, N11, N12, N13, M2, A2, B2, N21, N22, N23, ResTh, ResPh } = params;
    const superFn1 = superFunction(M1, A1, B1, N11, N12, N13);
    const superFn2 = superFunction(M2, A2, B2, N21, N22, N23);
    const geometry = new ParametricGeometry(
        (u: number, v: number, target: THREE.Vector3) => {
            const th = THREE.MathUtils.lerp(-Math.PI, Math.PI, u);
            const ph = THREE.MathUtils.lerp(-Math.PI / 2, Math.PI / 2, v);
            const r1 = superFn1(th);
            const r2 = superFn2(ph);
            const x = r1 * Math.cos(th) * r2 * Math.cos(ph);
            const y = r2 * Math.sin(ph);
            const z = r1 * Math.sin(th) * r2 * Math.cos(ph);
            target.set(x, y, z);
        },
        ResTh,
        ResPh
    );
    geometry.computeVertexNormals();
    return geometry;
}

/**
 * Create a “MakeMesh” geometry (a simplified version of the MakeMesh macro).
 */
export function createMakeMeshGeometry(
    params: MakeMeshParams,
    resolution: number = 100
): THREE.BufferGeometry {
    const vertices: number[] = [];
    const indices: number[] = [];
    const thetaMin = -Math.PI;
    const thetaMax = Math.PI;
    const phiMin = -Math.PI / 2;
    const phiMax = Math.PI / 2;
    const thetaSteps = resolution;
    const phiSteps = Math.floor(resolution / 2);

    function r(a: number, b: number, m: number, n1: number, n2: number, n3: number, theta: number): number {
        return Math.pow(
            Math.pow(Math.abs(Math.cos((m * theta) / 4) / a), n2) +
            Math.pow(Math.abs(Math.sin((m * theta) / 4) / b), n3),
            -1 / n1
        );
    }

    for (let i = 0; i <= thetaSteps; i++) {
        const theta = thetaMin + ((thetaMax - thetaMin) * i) / thetaSteps;
        for (let j = 0; j <= phiSteps; j++) {
            const phi = phiMin + ((phiMax - phiMin) * j) / phiSteps;
            const r1 = r(params.a1, params.b1, params.m1, params.n11, params.n12, params.n13, theta);
            const r2 = r(params.a2, params.b2, params.m2, params.n21, params.n22, params.n23, phi);
            const x = r1 * Math.cos(theta) * r2 * Math.cos(phi);
            const y = r1 * Math.sin(theta) * r2 * Math.cos(phi);
            const z = r2 * Math.sin(phi);
            vertices.push(x, y, z);
        }
    }

    for (let i = 0; i < thetaSteps; i++) {
        for (let j = 0; j < phiSteps; j++) {
            const a = i * (phiSteps + 1) + j;
            const b = (i + 1) * (phiSteps + 1) + j;
            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
}

/**
 * Precompute a grid of (u,v) parameters for grid-based supershapes.
 */
export function computeParams(segments: number): { u: number; v: number }[] {
    const params: { u: number; v: number }[] = [];
    for (let i = 0; i <= segments; i++) {
        const u = THREE.MathUtils.lerp(-Math.PI, Math.PI, i / segments);
        for (let j = 0; j <= segments; j++) {
            const v = THREE.MathUtils.lerp(-Math.PI / 2, Math.PI / 2, j / segments);
            params.push({ u, v });
        }
    }
    return params;
}
