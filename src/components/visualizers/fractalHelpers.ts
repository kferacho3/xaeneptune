// lib/fractalHelpers.ts
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Creates a 3D Menger Sponge geometry using cubes.
 */
export function createMengerSpongeGeometry(level: number, size: number): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

  function createCube(x: number, y: number, z: number, s: number): THREE.BufferGeometry {
    const mesh = new THREE.Mesh(cubeGeometry);
    mesh.scale.set(s, s, s);
    mesh.position.set(x, y, z);
    mesh.updateMatrix();
    return mesh.geometry.clone().applyMatrix4(mesh.matrix);
  }

  function mengerSponge(lvl: number, s: number, center: THREE.Vector3) {
    if (lvl === 0) {
      geometries.push(createCube(center.x, center.y, center.z, s));
      return;
    }
    const newSize = s / 3;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          const sum = Math.abs(i) + Math.abs(j) + Math.abs(k);
          if (sum > 1) {
            const newCenter = new THREE.Vector3(
              center.x + i * newSize,
              center.y + j * newSize,
              center.z + k * newSize
            );
            mengerSponge(lvl - 1, newSize, newCenter);
          }
        }
      }
    }
  }
  mengerSponge(level, size, new THREE.Vector3(0, 0, 0));
  return mergeGeometries(geometries, false) || new THREE.BufferGeometry();
}

/**
 * Creates a Mandelbulb/Mandelbox fractal geometry using spheres.
 * For each grid point, the SDF is iterated and if the point “remains” (i.e. does not escape) it is rendered as a small sphere.
 */
/**
 * Creates a Mandelbulb/Mandelbox fractal geometry using spheres.
 * For each grid point, the SDF is iterated and if the point “remains” (i.e. does not escape) it is rendered as a small sphere.
 */
export function createMandelSpheresGeometry(params: {
    type: "mandelbulb" | "mandelbox";
    nPower?: number;
    maxIterations: number;
    dim: number;
    sphereRadius: number;
  }): THREE.BufferGeometry {
    const { type, nPower = 8, maxIterations, dim, sphereRadius } = params;
    const points: THREE.Vector3[] = [];
    // Loop over a 3D grid
    for (let x = 0; x < dim; x++) {
      for (let y = 0; y < dim; y++) {
        for (let z = 0; z < dim; z++) {
          const u = THREE.MathUtils.mapLinear(x, 0, dim - 1, -2, 2);
          const v = THREE.MathUtils.mapLinear(y, 0, dim - 1, -2, 2);
          const w = THREE.MathUtils.mapLinear(z, 0, dim - 1, -2, 2);
          const pos = new THREE.Vector3(u, v, w);
          let iterations = 0;
          const zVec = pos.clone();
          while (zVec.length() < 2 && iterations < maxIterations) {
            const r = zVec.length();
            if (r === 0) break;
            const theta = Math.acos(zVec.z / r);
            const phi = Math.atan2(zVec.y, zVec.x);
            const r_n = Math.pow(r, nPower);
            const theta_n = theta * nPower;
            const phi_n = phi * nPower;
            let newX = r_n * Math.sin(theta_n) * Math.cos(phi_n);
            let newY = r_n * Math.sin(theta_n) * Math.sin(phi_n);
            let newZ = r_n * Math.cos(theta_n);
            if (type === "mandelbox") {
              // For Mandelbox, use a box-folding variant:
              newX = zVec.x > 1 ? 2 - zVec.x : zVec.x < -1 ? -2 - zVec.x : zVec.x;
              newY = zVec.y > 1 ? 2 - zVec.y : zVec.y < -1 ? -2 - zVec.y : zVec.y;
              newZ = zVec.z > 1 ? 2 - zVec.z : zVec.z < -1 ? -2 - zVec.z : zVec.z;
              const scale = 20;
              newX *= scale;
              newY *= scale;
              newZ *= scale;
            }
            zVec.set(newX, newY, newZ).add(pos);
            iterations++;
          }
          if (iterations === maxIterations) {
            points.push(new THREE.Vector3(u, v, w));
          }
        }
      }
    }
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
    const geometries: THREE.BufferGeometry[] = [];
    for (const pt of points) {
      const mesh = new THREE.Mesh(sphereGeometry);
      mesh.position.copy(pt);
      mesh.updateMatrix();
      geometries.push(sphereGeometry.clone().applyMatrix4(mesh.matrix));
    }
    // Only merge if we have at least one geometry.
    return geometries.length > 0
      ? mergeGeometries(geometries, false)
      : new THREE.BufferGeometry();
  }

/**
 * Creates the Buddhabrot fractal geometry using spheres.
 */
export function createBuddhabrotSpheresGeometry(params: {
  maxIterations: number;
  sampleCount: number;
  sphereRadius: number;
}): THREE.BufferGeometry {
  const { maxIterations, sampleCount, sphereRadius } = params;
  const points: THREE.Vector3[] = [];
  const bounds = { minX: -2, maxX: 1, minY: -1.5, maxY: 1.5 };
  for (let i = 0; i < sampleCount; i++) {
    const c = new THREE.Vector2(
      THREE.MathUtils.lerp(bounds.minX, bounds.maxX, Math.random()),
      THREE.MathUtils.lerp(bounds.minY, bounds.maxY, Math.random())
    );
    const z = new THREE.Vector2(0, 0);
    const trajectory: THREE.Vector3[] = [];
    let escaped = false;
    for (let j = 0; j < maxIterations; j++) {
      const x = z.x * z.x - z.y * z.y + c.x;
      const y = 2 * z.x * z.y + c.y;
      z.set(x, y);
      trajectory.push(new THREE.Vector3(z.x, z.y, j * 0.0005));
      if (z.lengthSq() > 4) {
        escaped = true;
        break;
      }
    }
    if (escaped) {
      points.push(...trajectory);
    }
  }
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 8, 8);
  const geometries: THREE.BufferGeometry[] = [];
  for (const pt of points) {
    const mesh = new THREE.Mesh(sphereGeometry);
    mesh.position.copy(pt);
    mesh.updateMatrix();
    geometries.push(sphereGeometry.clone().applyMatrix4(mesh.matrix));
  }
  return mergeGeometries(geometries, false) || new THREE.BufferGeometry();
}

/**
 * Creates an Apollonian Gasket geometry using spheres.
 * (A simplified 2D algorithm is extruded to 3D.)
 */
export function createApollonianGasketGeometry(iterations: number, minRadius: number = 0.1): THREE.BufferGeometry {
  const circles: { center: THREE.Vector3; radius: number }[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);

  function addCircle(center: THREE.Vector3, radius: number) {
    if (radius > minRadius) {
      circles.push({ center, radius });
    }
  }
  // Initial three mutually tangent circles (in the xy-plane)
  addCircle(new THREE.Vector3(0, 0, 0), 1);
  addCircle(new THREE.Vector3(2, 0, 0), 1);
  addCircle(new THREE.Vector3(1, Math.sqrt(3), 0), 1);

  // For a number of iterations, search for three mutually tangent circles and add a new one.
  for (let i = 0; i < iterations && i < circles.length; i++) {
    const { center: c1, radius: r1 } = circles[i];
    for (let j = i + 1; j < circles.length; j++) {
      const { center: c2, radius: r2 } = circles[j];
      for (let k = j + 1; k < circles.length; k++) {
        const { center: c3, radius: r3 } = circles[k];
        const d12 = c1.distanceTo(c2);
        const d23 = c2.distanceTo(c3);
        const d31 = c3.distanceTo(c1);
        if (
          Math.abs(d12 - (r1 + r2)) < 1e-3 &&
          Math.abs(d23 - (r2 + r3)) < 1e-3 &&
          Math.abs(d31 - (r3 + r1)) < 1e-3
        ) {
          // New circle (simplified placement)
          const newRadius = Math.min(r1, r2, r3) * 0.3;
          const newCenter = new THREE.Vector3(
            (c1.x + c2.x + c3.x) / 3,
            (c1.y + c2.y + c3.y) / 3,
            (c1.z + c2.z + c3.z) / 3
          );
          addCircle(newCenter, newRadius);
        }
      }
    }
  }
  // Create a sphere for each circle, scaling by the circle’s radius.
  for (const { center, radius } of circles) {
    const mesh = new THREE.Mesh(sphereGeometry);
    mesh.scale.set(radius, radius, radius);
    mesh.position.copy(center);
    mesh.updateMatrix();
    geometries.push(sphereGeometry.clone().applyMatrix4(mesh.matrix));
  }
  return mergeGeometries(geometries, false) || new THREE.BufferGeometry();
}

/**
 * Creates a 3D Pythagoras Tree geometry using cubes.
 */
export function createPythagorasTree3DCubesGeometry(
  level: number,
  size: number = 1,
  thickness: number = 0.1
): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

  function createBox(pos: THREE.Vector3, s: number, rot: THREE.Euler): THREE.BufferGeometry {
    const mesh = new THREE.Mesh(cubeGeometry);
    mesh.scale.set(s, s, thickness);
    mesh.position.copy(pos);
    mesh.rotation.copy(rot);
    mesh.updateMatrix();
    return cubeGeometry.clone().applyMatrix4(mesh.matrix);
  }

  function generateTree(lvl: number, pos: THREE.Vector3, s: number, rot: THREE.Euler) {
    if (lvl === 0) return;
    geometries.push(createBox(pos, s, rot));
    if (lvl > 1) {
      const nextScale = s * Math.SQRT1_2; // ~0.707
      const angle = Math.PI / 4;
      // Right branch
      const rightPosOffset = new THREE.Vector3(s / 2, s / 2, 0).applyEuler(rot);
      const rightRot = new THREE.Euler().copy(rot);
      rightRot.z += angle;
      const rightPos = pos.clone().add(rightPosOffset);
      generateTree(lvl - 1, rightPos, nextScale, rightRot);
      // Left branch
      const leftPosOffset = new THREE.Vector3(-s / 2, s / 2, 0).applyEuler(rot);
      const leftRot = new THREE.Euler().copy(rot);
      leftRot.z -= angle;
      const leftPos = pos.clone().add(leftPosOffset);
      generateTree(lvl - 1, leftPos, nextScale, leftRot);
    }
  }
  generateTree(level, new THREE.Vector3(0, 0, 0), size, new THREE.Euler());
  return mergeGeometries(geometries, false) || new THREE.BufferGeometry();
}

/**
 * Creates an N-Flake geometry using spheres.
 */
export function createNFlakeSpheresGeometry(
  level: number,
  size: number = 1,
  type: string = "icosahedron",
  sphereRadius: number = 0.1
): THREE.BufferGeometry {
  const finalPositions: THREE.Vector3[] = [];
  const MIN_SCALE = 1e-4;
  let baseGeometry: THREE.BufferGeometry;
  let numChildren = 0;
  let childScaleFactor = 0;
  let childOffsetFactor = 0;

  switch (type) {
    case "icosahedron":
      baseGeometry = new THREE.IcosahedronGeometry(1);
      numChildren = 12;
      childScaleFactor = (1 / (1 + Math.sqrt(5))) * 2; // ~0.618
      childOffsetFactor = 1.5;
      break;
    case "dodecahedron":
      baseGeometry = new THREE.DodecahedronGeometry(1);
      numChildren = 20;
      childScaleFactor = 1 / (2 + Math.sqrt(5)); // ~0.276
      childOffsetFactor = 1.618 * 1.5;
      break;
    case "octahedron":
      baseGeometry = new THREE.OctahedronGeometry(1);
      numChildren = 6;
      childScaleFactor = 0.5;
      childOffsetFactor = 1.5;
      break;
    case "tetrahedron":
      baseGeometry = new THREE.TetrahedronGeometry(1);
      numChildren = 4;
      childScaleFactor = 0.5;
      childOffsetFactor = 1.732 * 0.5 * 1.5;
      break;
    default:
      console.warn(`Unknown n-flake type: ${type}. Using icosahedron.`);
      baseGeometry = new THREE.IcosahedronGeometry(1);
      numChildren = 12;
      childScaleFactor = (1 / (1 + Math.sqrt(5))) * 2;
      childOffsetFactor = 1.5;
  }

  function generateFlake(lvl: number, scale: number, offset: THREE.Vector3) {
    if (scale < MIN_SCALE) return;
    if (lvl === 0) {
      finalPositions.push(offset.clone().multiplyScalar(size));
      return;
    }
    const normalsAttr = baseGeometry.attributes.normal;
    for (let i = 0; i < Math.min(normalsAttr.count, numChildren); i++) {
      const normal = new THREE.Vector3(
        normalsAttr.getX(i),
        normalsAttr.getY(i),
        normalsAttr.getZ(i)
      ).normalize();
      const newOffset = offset.clone().add(normal.multiplyScalar(scale * childOffsetFactor));
      generateFlake(lvl - 1, scale * childScaleFactor, newOffset);
    }
  }
  generateFlake(level, 1, new THREE.Vector3());
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 16, 16);
  const geometries: THREE.BufferGeometry[] = [];
  for (const pos of finalPositions) {
    const mesh = new THREE.Mesh(sphereGeometry);
    mesh.position.copy(pos.clone().multiplyScalar(size));
    mesh.updateMatrix();
    geometries.push(sphereGeometry.clone().applyMatrix4(mesh.matrix));
  }
  return mergeGeometries(geometries, false) || new THREE.BufferGeometry();
}

/**
 * Creates a Sierpinski Tetrahedron geometry using spheres.
 */
export function createSierpinskiTetrahedronSpheresGeometry(
  level: number,
  size: number = 1,
  sphereRadius: number = 0.1
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];

  function tetrahedron(p1: THREE.Vector3, p2: THREE.Vector3, p3: THREE.Vector3, p4: THREE.Vector3, n: number) {
    if (n === 0) {
      points.push(p1.clone(), p2.clone(), p3.clone(), p4.clone());
    } else {
      const m12 = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const m13 = new THREE.Vector3().addVectors(p1, p3).multiplyScalar(0.5);
      const m14 = new THREE.Vector3().addVectors(p1, p4).multiplyScalar(0.5);
      const m23 = new THREE.Vector3().addVectors(p2, p3).multiplyScalar(0.5);
      const m24 = new THREE.Vector3().addVectors(p2, p4).multiplyScalar(0.5);
      const m34 = new THREE.Vector3().addVectors(p3, p4).multiplyScalar(0.5);
      tetrahedron(p1, m12, m13, m14, n - 1);
      tetrahedron(p2, m12, m23, m24, n - 1);
      tetrahedron(p3, m13, m23, m34, n - 1);
      tetrahedron(p4, m14, m24, m34, n - 1);
    }
  }

  const a = new THREE.Vector3(0, size * Math.sqrt(6) / 3, 0);
  const b = new THREE.Vector3(-size / 2, -size * Math.sqrt(6) / 6, size * Math.sqrt(3) / 3);
  const c = new THREE.Vector3(size / 2, -size * Math.sqrt(6) / 6, size * Math.sqrt(3) / 3);
  const d = new THREE.Vector3(0, -size * Math.sqrt(6) / 6, -size * Math.sqrt(3) * 2 / 6);
  tetrahedron(a, b, c, d, level);
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 8, 8);
  const geometries: THREE.BufferGeometry[] = [];
  for (const pos of points) {
    const mesh = new THREE.Mesh(sphereGeometry);
    mesh.position.copy(pos);
    mesh.updateMatrix();
    geometries.push(sphereGeometry.clone().applyMatrix4(mesh.matrix));
  }
  return mergeGeometries(geometries, false) || new THREE.BufferGeometry();
}

/**
 * Creates a Koch Snowflake geometry using spheres.
 */
export function createKochSnowflakeSpheresGeometry(
  level: number,
  size: number = 1,
  sphereRadius: number = 0.1
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];

  function generate(p1: THREE.Vector3, p2: THREE.Vector3, lvl: number) {
    if (lvl === 0) {
      points.push(p1.clone(), p2.clone());
      return;
    }
    const v = new THREE.Vector3().subVectors(p2, p1).divideScalar(3);
    const pB = p1.clone().add(v);
    const pD = p2.clone().sub(v);
    const pC = pB.clone().add(v.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 3));
    generate(p1, pB, lvl - 1);
    generate(pB, pC, lvl - 1);
    generate(pC, pD, lvl - 1);
    generate(pD, p2, lvl - 1);
  }

  const triangle = [
    new THREE.Vector3(-size / 2, -Math.sqrt(3) * size / 6, 0),
    new THREE.Vector3(size / 2, -Math.sqrt(3) * size / 6, 0),
    new THREE.Vector3(0, Math.sqrt(3) * size / 3, 0)
  ];
  generate(triangle[0], triangle[1], level);
  generate(triangle[1], triangle[2], level);
  generate(triangle[2], triangle[0], level);
  const extrudedPoints: THREE.Vector3[] = [];
  for (const p of points) {
    extrudedPoints.push(new THREE.Vector3(p.x, p.y, sphereRadius));
    extrudedPoints.push(new THREE.Vector3(p.x, p.y, -sphereRadius));
  }
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 8, 8);
  const geometries: THREE.BufferGeometry[] = [];
  for (const pos of extrudedPoints) {
    const mesh = new THREE.Mesh(sphereGeometry);
    mesh.position.copy(pos);
    mesh.updateMatrix();
    geometries.push(sphereGeometry.clone().applyMatrix4(mesh.matrix));
  }
  return mergeGeometries(geometries, false) || new THREE.BufferGeometry();
}

/**
 * Creates a Sierpinski Carpet geometry using cubes.
 */
export function createSierpinskiCarpetCubesGeometry(level: number, size: number = 1): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

  function createCube(x: number, y: number, z: number, s: number): THREE.BufferGeometry {
    const mesh = new THREE.Mesh(cubeGeometry);
    mesh.scale.set(s, s, s);
    mesh.position.set(x, y, z);
    mesh.updateMatrix();
    return cubeGeometry.clone().applyMatrix4(mesh.matrix);
  }

  function carpet(lvl: number, s: number, center: THREE.Vector3) {
    if (lvl === 0) {
      geometries.push(createCube(center.x, center.y, center.z, s));
      return;
    }
    const newSize = s / 3;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          // Only include cubes on the outer border
          if (Math.abs(i) === 1 || Math.abs(j) === 1 || Math.abs(k) === 1) {
            const newCenter = new THREE.Vector3(
              center.x + i * newSize,
              center.y + j * newSize,
              center.z + k * newSize
            );
            carpet(lvl - 1, newSize, newCenter);
          }
        }
      }
    }
  }
  carpet(level, size, new THREE.Vector3(0, 0, 0));
  return mergeGeometries(geometries, false) || new THREE.BufferGeometry();
}

/**
 * (Optional) Creates a Cantor Dust geometry using spheres.
 */
export function createCantorDustSpheresGeometry(level: number, size: number = 1): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  function generate(lvl: number, cubeMin: THREE.Vector3, cubeMax: THREE.Vector3) {
    if (lvl === 0) {
      const mid = new THREE.Vector3().addVectors(cubeMin, cubeMax).multiplyScalar(0.5);
      points.push(mid);
      return;
    }
    const diff = new THREE.Vector3().subVectors(cubeMax, cubeMin).multiplyScalar(1 / 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          if (i === 1 && j === 1 && k === 1) continue;
          const newMin = new THREE.Vector3(
            cubeMin.x + i * diff.x,
            cubeMin.y + j * diff.y,
            cubeMin.z + k * diff.z
          );
          const newMax = new THREE.Vector3().addVectors(newMin, diff);
          generate(lvl - 1, newMin, newMax);
        }
      }
    }
  }
  const half = size / 2;
  const cubeMin = new THREE.Vector3(-half, -half, -half);
  const cubeMax = new THREE.Vector3(half, half, half);
  generate(level, cubeMin, cubeMax);
  const sphereGeometry = new THREE.SphereGeometry(0.02, 8, 8);
  const geometries: THREE.BufferGeometry[] = [];
  for (const pt of points) {
    const mesh = new THREE.Mesh(sphereGeometry);
    mesh.position.copy(pt);
    mesh.updateMatrix();
    geometries.push(sphereGeometry.clone().applyMatrix4(mesh.matrix));
  }
  return mergeGeometries(geometries, false) || new THREE.BufferGeometry();
}

/**
 * (Optional) Creates a Julia Set geometry using spheres.
 */
export function createJuliaSetSpheresGeometry(
  level: number,
  size: number = 3,
  c: THREE.Vector2 = new THREE.Vector2(-0.8, 0.1565),
  sphereRadius: number = 0.1
): THREE.BufferGeometry {
  const points: THREE.Vector3[] = [];
  const iterations = 100;
  const bailout = 2;
  const resolution = 200;
  for (let i = 0; i < resolution; i++) {
    for (let j = 0; j < resolution; j++) {
      const x = THREE.MathUtils.mapLinear(i, 0, resolution, -size / 2, size / 2);
      const y = THREE.MathUtils.mapLinear(j, 0, resolution, -size / 2, size / 2);
      const z = new THREE.Vector2(x, y);
      let iter = 0;
      while (z.lengthSq() < bailout * bailout && iter < iterations) {
        const zx = z.x * z.x - z.y * z.y + c.x;
        const zy = 2 * z.x * z.y + c.y;
        z.set(zx, zy);
        iter++;
      }
      if (iter === iterations) {
        points.push(new THREE.Vector3(x, y, 0));
      }
    }
  }
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 8, 8);
  const geometries: THREE.BufferGeometry[] = [];
  for (const pt of points) {
    const mesh = new THREE.Mesh(sphereGeometry);
    mesh.position.copy(pt);
    mesh.updateMatrix();
    geometries.push(sphereGeometry.clone().applyMatrix4(mesh.matrix));
  }
  return mergeGeometries(geometries, false) || new THREE.BufferGeometry();
}
