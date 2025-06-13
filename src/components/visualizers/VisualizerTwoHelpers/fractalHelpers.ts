
// lib/fractalHelpers.ts
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Creates a 3D Menger Sponge geometry using cubes.
 */
export function createMengerSpongeGeometry(
  level: number,
  size: number,
): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

  function mengerSponge(lvl: number, s: number, center: THREE.Vector3) {
    if (lvl === 0) {
      const cloned = cubeGeometry.clone();
      const matrix = new THREE.Matrix4();
      matrix.makeScale(s, s, s);
      matrix.setPosition(center.x, center.y, center.z);
      cloned.applyMatrix4(matrix);
      geometries.push(cloned);
      return;
    }
    
    const newSize = s / 3;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          const sum = Math.abs(i) + Math.abs(j) + Math.abs(k);
          // Skip if it's a center cross (sum <= 1 means it's part of the cross to remove)
          if (sum > 1) {
            const newCenter = new THREE.Vector3(
              center.x + i * newSize,
              center.y + j * newSize,
              center.z + k * newSize,
            );
            mengerSponge(lvl - 1, newSize, newCenter);
          }
        }
      }
    }
  }
  
  mengerSponge(level, size, new THREE.Vector3(0, 0, 0));
  const merged = mergeGeometries(geometries, false);
  
  geometries.forEach(g => g.dispose());
  cubeGeometry.dispose();
  
  return merged || new THREE.BufferGeometry();
}

/**
 * Creates a Mandelbulb/Mandelbox fractal geometry using spheres.
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
  const bailout = 2.0;
  const scale = 2.0; // Mandelbox scale
  
  // Scan 3D space
  for (let x = 0; x < dim; x++) {
    for (let y = 0; y < dim; y++) {
      for (let z = 0; z < dim; z++) {
        const px = THREE.MathUtils.mapLinear(x, 0, dim - 1, -1.5, 1.5);
        const py = THREE.MathUtils.mapLinear(y, 0, dim - 1, -1.5, 1.5);
        const pz = THREE.MathUtils.mapLinear(z, 0, dim - 1, -1.5, 1.5);
        
        const c = new THREE.Vector3(px, py, pz);
        const v = new THREE.Vector3(0, 0, 0);
        let dr = 1.0;
        let r = 0.0;
        
        for (let i = 0; i < maxIterations; i++) {
          r = v.length();
          if (r > bailout) break;
          
          if (type === "mandelbulb") {
            // Mandelbulb formula
            const theta = Math.acos(v.z / (r + 1e-10));
            const phi = Math.atan2(v.y, v.x);
            dr = Math.pow(r, nPower - 1) * nPower * dr + 1.0;
            
            const zr = Math.pow(r, nPower);
            const theta_n = theta * nPower;
            const phi_n = phi * nPower;
            
            v.x = zr * Math.sin(theta_n) * Math.cos(phi_n);
            v.y = zr * Math.sin(theta_n) * Math.sin(phi_n);
            v.z = zr * Math.cos(theta_n);
            v.add(c);
          } else {
            // Mandelbox formula
            dr = dr * Math.abs(scale) + 1.0;
            
            // Box fold
            if (v.x > 1) v.x = 2 - v.x;
            else if (v.x < -1) v.x = -2 - v.x;
            if (v.y > 1) v.y = 2 - v.y;
            else if (v.y < -1) v.y = -2 - v.y;
            if (v.z > 1) v.z = 2 - v.z;
            else if (v.z < -1) v.z = -2 - v.z;
            
            // Sphere fold
            const r2 = v.lengthSq();
            if (r2 < 0.25) {
              v.multiplyScalar(4);
              dr *= 4;
            } else if (r2 < 1) {
              v.divideScalar(r2);
              dr /= r2;
            }
            
            v.multiplyScalar(scale).add(c);
          }
        }
        
        // Distance estimation
        const distance = 0.5 * Math.log(r) * r / dr;
        if (distance < 0.01) {
          points.push(c.clone());
        }
      }
    }
  }
  
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 8, 8);
  const geometries: THREE.BufferGeometry[] = [];
  
  // Sample points to avoid too many spheres
  const maxPoints = Math.min(points.length, 3000);
  const step = Math.max(1, Math.floor(points.length / maxPoints));
  
  for (let i = 0; i < points.length; i += step) {
    const cloned = sphereGeometry.clone();
    cloned.translate(points[i].x, points[i].y, points[i].z);
    geometries.push(cloned);
  }
  
  const merged = geometries.length > 0
    ? mergeGeometries(geometries, false)
    : new THREE.BufferGeometry();
    
  sphereGeometry.dispose();
  geometries.forEach(g => g.dispose());
  
  return merged || new THREE.BufferGeometry();
}
/**
 * Creates the Buddhabrot fractal geometry using spheres in 3D.
 */
export function createBuddhabrotSpheresGeometry(params: {
  maxIterations: number;
  sampleCount: number;
  sphereRadius: number;
}): THREE.BufferGeometry {
  const { maxIterations, sampleCount, sphereRadius } = params;
  const densityMap = new Map<string, number>();
  
  // Sample many starting points
  for (let i = 0; i < sampleCount; i++) {
    // Random point in complex plane
    const c_real = (Math.random() - 0.5) * 4;
    const c_imag = (Math.random() - 0.5) * 4;
    
    let z_real = 0;
    let z_imag = 0;
    const trajectory: Array<[number, number]> = [];
    let escaped = false;
    
    // Iterate Mandelbrot
    for (let iter = 0; iter < maxIterations; iter++) {
      const z_real_sq = z_real * z_real;
      const z_imag_sq = z_imag * z_imag;
      
      if (z_real_sq + z_imag_sq > 4) {
        escaped = true;
        break;
      }
      
      trajectory.push([z_real, z_imag]);
      
      const new_real = z_real_sq - z_imag_sq + c_real;
      const new_imag = 2 * z_real * z_imag + c_imag;
      
      z_real = new_real;
      z_imag = new_imag;
    }
    
    // If point escaped, add its trajectory to density map
    if (escaped) {
      for (const [x, y] of trajectory) {
        // Quantize to grid
        const qx = Math.round(x * 20) / 20;
        const qy = Math.round(y * 20) / 20;
        const key = `${qx},${qy}`;
        densityMap.set(key, (densityMap.get(key) || 0) + 1);
      }
    }
  }
  
  // Convert density map to 3D points
  const points: THREE.Vector3[] = [];
  const maxDensity = Math.max(...densityMap.values());
  
  for (const [key, density] of densityMap.entries()) {
    if (density > 2) { // Threshold
      const [x, y] = key.split(',').map(Number);
      const z = (density / maxDensity) * 0.5; // Height based on density
      points.push(new THREE.Vector3(x, y, z));
    }
  }
  
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 6, 6);
  const geometries: THREE.BufferGeometry[] = [];
  
  const maxPoints = Math.min(points.length, 2000);
  const step = Math.max(1, Math.floor(points.length / maxPoints));
  
  for (let i = 0; i < points.length; i += step) {
    const cloned = sphereGeometry.clone();
    cloned.translate(points[i].x, points[i].y, points[i].z);
    geometries.push(cloned);
  }
  
  const merged = geometries.length > 0
    ? mergeGeometries(geometries, false)
    : new THREE.BufferGeometry();
    
  sphereGeometry.dispose();
  geometries.forEach(g => g.dispose());
  
  return merged || new THREE.BufferGeometry();
}

/**
 * Creates an Apollonian Gasket geometry using spheres in 3D.
 */
export function createApollonianGasketGeometry(
  iterations: number,
  minRadius: number = 0.01,
): THREE.BufferGeometry {
  const spheres: { center: THREE.Vector3; radius: number }[] = [];
  const geometries: THREE.BufferGeometry[] = [];
  const baseSphereGeometry = new THREE.SphereGeometry(1, 16, 16);

  // Descartes Circle Theorem: k4 = k1 + k2 + k3 ± 2√(k1k2 + k2k3 + k3k1)
  // where k = 1/radius (curvature)
  
  // Initial configuration: outer sphere containing three mutually tangent spheres
  const outerRadius = 1.0;
  const innerRadius = outerRadius / (1 + 2 / Math.sqrt(3));
  
  // Add initial spheres
  const initialSpheres: { center: THREE.Vector3; radius: number }[] = [];
  
  // Three inner tangent spheres
  for (let i = 0; i < 3; i++) {
    const angle = (i * 2 * Math.PI) / 3;
    const dist = outerRadius - innerRadius;
    initialSpheres.push({
      center: new THREE.Vector3(
        Math.cos(angle) * dist * 0.5,
        Math.sin(angle) * dist * 0.5,
        0
      ),
      radius: innerRadius
    });
  }
  
  spheres.push(...initialSpheres);
  
  // Recursively add spheres in gaps
  function findTangentSphere(s1: typeof spheres[0], s2: typeof spheres[0], s3: typeof spheres[0]) {
    // Calculate the fourth sphere tangent to three given spheres
    const k1 = 1 / s1.radius;
    const k2 = 1 / s2.radius;
    const k3 = 1 / s3.radius;
    
    const k4 = k1 + k2 + k3 + 2 * Math.sqrt(k1 * k2 + k2 * k3 + k3 * k1);
    const r4 = 1 / k4;
    
    if (r4 < minRadius || r4 > outerRadius) return null;
    
    // Find center using barycentric coordinates
    const w1 = k1;
    const w2 = k2;
    const w3 = k3;
    const wSum = w1 + w2 + w3;
    
    const center = new THREE.Vector3()
      .addScaledVector(s1.center, w1 / wSum)
      .addScaledVector(s2.center, w2 / wSum)
      .addScaledVector(s3.center, w3 / wSum);
    
    // Adjust position to be tangent
    const v1 = center.clone().sub(s1.center).normalize();
    const targetDist = s1.radius + r4;
    center.copy(s1.center).addScaledVector(v1, targetDist);
    
    return { center, radius: r4 };
  }
  
  // Generate spheres iteratively
  for (let iter = 0; iter < iterations && spheres.length < 200; iter++) {
    const newSpheres: typeof spheres = [];
    
    // Try all combinations of three spheres
    for (let i = 0; i < spheres.length - 2; i++) {
      for (let j = i + 1; j < spheres.length - 1; j++) {
        for (let k = j + 1; k < spheres.length; k++) {
          const newSphere = findTangentSphere(spheres[i], spheres[j], spheres[k]);
          
          if (newSphere) {
            // Check overlap with existing spheres
            let valid = true;
            for (const existing of spheres) {
              const dist = newSphere.center.distanceTo(existing.center);
              if (dist < (newSphere.radius + existing.radius) * 0.95) {
                valid = false;
                break;
              }
            }
            
            if (valid) {
              newSpheres.push(newSphere);
            }
          }
        }
      }
    }
    
    if (newSpheres.length === 0) break;
    spheres.push(...newSpheres);
  }
  
  // Create sphere geometries
  for (const { center, radius } of spheres) {
    const cloned = baseSphereGeometry.clone();
    const matrix = new THREE.Matrix4();
    matrix.makeScale(radius, radius, radius);
    matrix.setPosition(center.x, center.y, center.z);
    cloned.applyMatrix4(matrix);
    geometries.push(cloned);
  }
  
  const merged = mergeGeometries(geometries, false);
  
  baseSphereGeometry.dispose();
  geometries.forEach(g => g.dispose());
  
  return merged || new THREE.BufferGeometry();
}

/**
 * Creates a 3D Pythagoras Tree geometry using cubes.
 */
export function createPythagorasTree3DCubesGeometry(
  level: number,
  size: number = 1,
  thickness: number = 0.1,
): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  
  function addBranch(
    position: THREE.Vector3,
    direction: THREE.Vector3,
    right: THREE.Vector3,
    length: number,
    width: number,
    depth: number,
    level: number
  ) {
    if (level <= 0 || length < 0.01) return;
    
    // Create current branch
    const branch = cubeGeometry.clone();
    const matrix = new THREE.Matrix4();
    
    // Set up orientation
    const up = direction.clone();
    const look = right.clone().cross(up).normalize();
    matrix.lookAt(
      new THREE.Vector3(0, 0, 0),
      look,
      up
    );
    
    // Scale and position
    matrix.scale(new THREE.Vector3(width, length, depth));
    const branchCenter = position.clone().add(direction.clone().multiplyScalar(length / 2));
    matrix.setPosition(branchCenter);
    
    branch.applyMatrix4(matrix);
    geometries.push(branch);
    
    if (level > 1) {
      // Calculate branch end position
      const endPos = position.clone().add(direction.clone().multiplyScalar(length));
      
      // Pythagorean theorem: branches at 45-degree angles
      const angle = Math.PI / 4;
      const newLength = length * Math.cos(angle);
      const newWidth = width * 0.7;
      const newDepth = depth * 0.9;
      
      // Right branch
      const rightDir = direction.clone()
        .applyAxisAngle(right, -angle)
        .normalize();
      addBranch(endPos, rightDir, right, newLength, newWidth, newDepth, level - 1);
      
      // Left branch
      const leftDir = direction.clone()
        .applyAxisAngle(right, angle)
        .normalize();
      addBranch(endPos, leftDir, right, newLength, newWidth, newDepth, level - 1);
      
      // 3D branches - forward and back
      if (level > 2) {
        const forward = right.clone();
        
        // Forward branch
        const forwardDir = direction.clone()
          .applyAxisAngle(forward, angle * 0.7)
          .normalize();
        addBranch(endPos, forwardDir, forward, newLength * 0.8, newWidth * 0.8, newDepth, level - 1);
        
        // Back branch
        const backDir = direction.clone()
          .applyAxisAngle(forward, -angle * 0.7)
          .normalize();
        addBranch(endPos, backDir, forward, newLength * 0.8, newWidth * 0.8, newDepth, level - 1);
      }
    }
  }
  
  // Start the tree
  const startPos = new THREE.Vector3(0, -size / 2, 0);
  const startDir = new THREE.Vector3(0, 1, 0);
  const startRight = new THREE.Vector3(1, 0, 0);
  
  addBranch(startPos, startDir, startRight, size, thickness * size, thickness * size, level);
  
  const merged = mergeGeometries(geometries, false);
  
  geometries.forEach(g => g.dispose());
  cubeGeometry.dispose();
  
  return merged || new THREE.BufferGeometry();
}
/**
 * Creates an N-Flake geometry using spheres.
 */

/**
 * Creates a recursive N-Flake made of tiny spheres.
 * @param level           Recursion depth
 * @param size            Radius of the parent polyhedron
 * @param type            Base polyhedron type
 * @param sphereRadius    Radius of each tiny sphere
 */
export function createNFlakeSpheresGeometry(
  level: number,
  size: number = 1,
  type: "icosahedron" | "dodecahedron" | "octahedron" | "tetrahedron" = "icosahedron",
  sphereRadius: number = 0.05
): THREE.BufferGeometry {
  let baseGeometry: THREE.BufferGeometry;
  let childScaleFactor = 0.4;

  switch (type) {
    case "dodecahedron":
      baseGeometry = new THREE.DodecahedronGeometry(1, 0);
      childScaleFactor = 0.381966; // Golden ratio based
      break;
    case "octahedron":
      baseGeometry = new THREE.OctahedronGeometry(1, 0);
      childScaleFactor = 0.5;
      break;
    case "tetrahedron":
      baseGeometry = new THREE.TetrahedronGeometry(1, 0);
      childScaleFactor = 0.5;
      break;
    default:
      baseGeometry = new THREE.IcosahedronGeometry(1, 0);
      childScaleFactor = 0.381966;
  }

  // Extract unique vertices
  const positionAttribute = baseGeometry.attributes.position;
  const vertexSet = new Set<string>();
  const vertices: THREE.Vector3[] = [];
  
  for (let i = 0; i < positionAttribute.count; i++) {
    const vertex = new THREE.Vector3(
      positionAttribute.getX(i),
      positionAttribute.getY(i),
      positionAttribute.getZ(i)
    ).normalize();
    
    const key = `${vertex.x.toFixed(6)},${vertex.y.toFixed(6)},${vertex.z.toFixed(6)}`;
    if (!vertexSet.has(key)) {
      vertexSet.add(key);
      vertices.push(vertex);
    }
  }

  const positions: THREE.Vector3[] = [];

  function addFlake(center: THREE.Vector3, scale: number, depth: number) {
    if (depth === 0 || scale < sphereRadius * 2) {
      positions.push(center);
      return;
    }
    
    for (const vertex of vertices) {
      const offset = vertex.clone().multiplyScalar(scale * (1 - childScaleFactor));
      const newCenter = center.clone().add(offset);
      addFlake(newCenter, scale * childScaleFactor, depth - 1);
    }
  }

  addFlake(new THREE.Vector3(0, 0, 0), size, level);

  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 8, 8);
  const geometries: THREE.BufferGeometry[] = [];
  
  // Limit spheres for performance
  const maxSpheres = Math.min(positions.length, 5000);
  const step = Math.max(1, Math.floor(positions.length / maxSpheres));
  
  for (let i = 0; i < positions.length; i += step) {
    const cloned = sphereGeometry.clone();
    cloned.translate(positions[i].x, positions[i].y, positions[i].z);
    geometries.push(cloned);
  }

  const merged = mergeGeometries(geometries, false) || new THREE.BufferGeometry();

  baseGeometry.dispose();
  sphereGeometry.dispose();
  geometries.forEach(g => g.dispose());

  return merged;
}

/**
 * Creates a Sierpinski Tetrahedron geometry using spheres.
 */
export function createSierpinskiTetrahedronSpheresGeometry(
  level: number,
  size: number = 1,
  sphereRadius: number = 0.05,
): THREE.BufferGeometry {
  const positions: THREE.Vector3[] = [];
  
  // Adjusted sphere radius based on level
  const adjustedRadius = Math.min(sphereRadius, size / Math.pow(2, level + 1));

  function sierpinski(
    v0: THREE.Vector3,
    v1: THREE.Vector3,
    v2: THREE.Vector3,
    v3: THREE.Vector3,
    depth: number
  ) {
    if (depth === 0) {
      // Add tetrahedron center
      const center = v0.clone()
        .add(v1)
        .add(v2)
        .add(v3)
        .multiplyScalar(0.25);
      positions.push(center);
      return;
    }
    
    // Calculate midpoints
    const m01 = v0.clone().lerp(v1, 0.5);
    const m02 = v0.clone().lerp(v2, 0.5);
    const m03 = v0.clone().lerp(v3, 0.5);
    const m12 = v1.clone().lerp(v2, 0.5);
    const m13 = v1.clone().lerp(v3, 0.5);
    const m23 = v2.clone().lerp(v3, 0.5);
    
    // Recursively create four smaller tetrahedra at corners
    sierpinski(v0, m01, m02, m03, depth - 1);
    sierpinski(v1, m01, m12, m13, depth - 1);
    sierpinski(v2, m02, m12, m23, depth - 1);
    sierpinski(v3, m03, m13, m23, depth - 1);
  }

  // Create initial tetrahedron vertices
  const h = size * Math.sqrt(2/3);
  const r = size * Math.sqrt(3)/3;
  
  const vertices = [
    new THREE.Vector3(0, h, 0),
    new THREE.Vector3(-size/2, -h/3, r/2),
    new THREE.Vector3(size/2, -h/3, r/2),
    new THREE.Vector3(0, -h/3, -r)
  ];
  
  sierpinski(vertices[0], vertices[1], vertices[2], vertices[3], level);
  
  const sphereGeometry = new THREE.SphereGeometry(adjustedRadius, 8, 8);
  const geometries: THREE.BufferGeometry[] = [];
  
  for (const pos of positions) {
    const cloned = sphereGeometry.clone();
    cloned.translate(pos.x, pos.y, pos.z);
    geometries.push(cloned);
  }
  
  const merged = mergeGeometries(geometries, false);
  
  sphereGeometry.dispose();
  geometries.forEach(g => g.dispose());
  
  return merged || new THREE.BufferGeometry();
}

/**
 * Creates a 3D Koch Snowflake geometry using spheres.
 */
export function createKochSnowflakeSpheresGeometry(
  level: number,
  size: number = 1,
  sphereRadius: number = 0.02,
): THREE.BufferGeometry {
  const positions: THREE.Vector3[] = [];
  
  // Adjust sphere radius based on recursion level
  const adjustedRadius = Math.min(sphereRadius, size / Math.pow(3, level) * 0.5);

  function kochLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    depth: number,
    normal: THREE.Vector3 = new THREE.Vector3(0, 0, 1)
  ): THREE.Vector3[] {
    if (depth === 0) {
      // Return points along the line
      const points: THREE.Vector3[] = [];
      const steps = 5;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        points.push(start.clone().lerp(end, t));
      }
      return points;
    }
    
    // Divide line into thirds
    const dir = end.clone().sub(start);
    const length = dir.length();
    dir.normalize();
    
    const p1 = start;
    const p2 = start.clone().add(dir.clone().multiplyScalar(length / 3));
    const p4 = start.clone().add(dir.clone().multiplyScalar(2 * length / 3));
    const p5 = end;
    
    // Calculate the peak point (60-degree angle)
    const perpDir = dir.clone().cross(normal).normalize();
    const height = length / 3 * Math.sqrt(3) / 2;
    const p3 = p2.clone()
      .add(p4)
      .multiplyScalar(0.5)
      .add(perpDir.multiplyScalar(height));
    
    // Recursively generate points
    const points: THREE.Vector3[] = [];
    points.push(...kochLine(p1, p2, depth - 1, normal));
    points.push(...kochLine(p2, p3, depth - 1, normal));
    points.push(...kochLine(p3, p4, depth - 1, normal));
    points.push(...kochLine(p4, p5, depth - 1, normal));
    
    return points;
  }

  // Create initial equilateral triangle
  const h = size * Math.sqrt(3) / 2;
  const vertices = [
    new THREE.Vector3(-size/2, -h/3, 0),
    new THREE.Vector3(size/2, -h/3, 0),
    new THREE.Vector3(0, 2*h/3, 0)
  ];
  
  // Generate Koch curve for each side
  for (let i = 0; i < 3; i++) {
    const start = vertices[i];
    const end = vertices[(i + 1) % 3];
    positions.push(...kochLine(start, end, level));
  }
  
  // Create 3D effect by adding layers
  const layers = Math.min(level + 1, 4);
  const layerHeight = size * 0.1;
  const originalPositions = [...positions];
  
  for (let layer = 1; layer < layers; layer++) {
    const scale = 1 - layer * 0.1; // Slightly smaller at each layer
    for (const pos of originalPositions) {
      const newPos = pos.clone();
      newPos.multiplyScalar(scale);
      newPos.z = layer * layerHeight;
      positions.push(newPos);
      
      // Mirror layer below
      const mirrorPos = newPos.clone();
      mirrorPos.z = -layer * layerHeight;
      positions.push(mirrorPos);
    }
  }
  
  const sphereGeometry = new THREE.SphereGeometry(adjustedRadius, 6, 6);
  const geometries: THREE.BufferGeometry[] = [];
  
  // Limit spheres for performance
  const maxSpheres = Math.min(positions.length, 3000);
  const step = Math.max(1, Math.floor(positions.length / maxSpheres));
  
  for (let i = 0; i < positions.length; i += step) {
    const cloned = sphereGeometry.clone();
    cloned.translate(positions[i].x, positions[i].y, positions[i].z);
    geometries.push(cloned);
  }
  
  const merged = mergeGeometries(geometries, false);
  
  sphereGeometry.dispose();
  geometries.forEach(g => g.dispose());
  
  return merged || new THREE.BufferGeometry();
}

/**
 * Creates a 3D Sierpinski Carpet geometry using cubes.
 */
export function createSierpinskiCarpetCubesGeometry(
  level: number,
  size: number = 1,
): THREE.BufferGeometry {
  const geometries: THREE.BufferGeometry[] = [];
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

  function addCarpetCube(center: THREE.Vector3, sideLength: number, depth: number) {
    if (depth === 0) {
      const cloned = cubeGeometry.clone();
      const matrix = new THREE.Matrix4();
      matrix.makeScale(sideLength, sideLength, sideLength);
      matrix.setPosition(center.x, center.y, center.z);
      cloned.applyMatrix4(matrix);
      geometries.push(cloned);
      return;
    }
    
    const newSize = sideLength / 3;
    
    // 3x3x3 grid, but skip cubes that have 2 or more center coordinates
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Count how many coordinates are 0 (center)
          const centerCount = (x === 0 ? 1 : 0) + (y === 0 ? 1 : 0) + (z === 0 ? 1 : 0);
          
          // Skip if 2 or more coordinates are center (creates the holes)
          if (centerCount >= 2) continue;
          
          const newCenter = new THREE.Vector3(
            center.x + x * newSize,
            center.y + y * newSize,
            center.z + z * newSize
          );
          
          addCarpetCube(newCenter, newSize, depth - 1);
        }
      }
    }
  }
  
  addCarpetCube(new THREE.Vector3(0, 0, 0), size, level);
  
  const merged = mergeGeometries(geometries, false);
  
  geometries.forEach(g => g.dispose());
  cubeGeometry.dispose();
  
  return merged || new THREE.BufferGeometry();
}
/**
 * Creates a 3D Cantor Dust geometry using spheres.
 */
export function createCantorDustSpheresGeometry(
  level: number,
  size: number = 1,
): THREE.BufferGeometry {
  const positions: THREE.Vector3[] = [];
  
  // Calculate appropriate sphere radius based on level
  const cubeSize = size / Math.pow(3, level);
  const sphereRadius = cubeSize * 0.4;
  
  function cantorDust(
    center: THREE.Vector3,
    sideLength: number,
    depth: number
  ) {
    if (depth === 0) {
      positions.push(center);
      return;
    }
    
    const newSize = sideLength / 3;
    
    // Generate 8 corner cubes (Cantor dust pattern)
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          const newCenter = new THREE.Vector3(
            center.x + x * newSize,
            center.y + y * newSize,
            center.z + z * newSize
          );
          cantorDust(newCenter, newSize, depth - 1);
        }
      }
    }
  }
  
  cantorDust(new THREE.Vector3(0, 0, 0), size, level);
  
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 8, 8);
  const geometries: THREE.BufferGeometry[] = [];
  
  for (const pos of positions) {
    const cloned = sphereGeometry.clone();
    cloned.translate(pos.x, pos.y, pos.z);
    geometries.push(cloned);
  }
  
  const merged = mergeGeometries(geometries, false);
  
  sphereGeometry.dispose();
  geometries.forEach(g => g.dispose());
  
  return merged || new THREE.BufferGeometry();
}

/**
 * Creates a 3D Julia Set geometry using spheres.
 */
export function createJuliaSetSpheresGeometry(
  level: number,
  size: number = 2,
  c: THREE.Vector2 = new THREE.Vector2(-0.8, 0.156),
  sphereRadius: number = 0.015,
): THREE.BufferGeometry {
  const positions: THREE.Vector3[] = [];
  const maxIterations = 128;
  const bailout = 2.0;
  const resolution = Math.min(80, 30 + level * 10); // Dynamic resolution
  
  // Create quaternion Julia set for true 3D
  const qc = { r: c.x, i: c.y, j: 0.0, k: 0.3 }; // Quaternion constant
  
  // Sample 3D space
  const bound = size / 2;
  const sampleStep = size / resolution;
  
  for (let x = -bound; x <= bound; x += sampleStep) {
    for (let y = -bound; y <= bound; y += sampleStep) {
      for (let z = -bound; z <= bound; z += sampleStep * 2) { // Fewer z samples for performance
        // Quaternion z
        let qz = { r: x, i: y, j: z * 0.5, k: 0 };
        let iter = 0;
        
        // Quaternion Julia iteration
        while (iter < maxIterations) {
          const r2 = qz.r * qz.r;
          const i2 = qz.i * qz.i;
          const j2 = qz.j * qz.j;
          const k2 = qz.k * qz.k;
          
          if (r2 + i2 + j2 + k2 > bailout * bailout) break;
          
          // Quaternion multiplication: qz = qz^2 + qc
          const newR = r2 - i2 - j2 - k2 + qc.r;
          const newI = 2 * qz.r * qz.i + qc.i;
          const newJ = 2 * qz.r * qz.j + qc.j;
          const newK = 2 * qz.r * qz.k + qc.k;
          
          qz = { r: newR, i: newI, j: newJ, k: newK };
          iter++;
        }
        
        // Points that don't escape form the Julia set
        if (iter === maxIterations) {
          positions.push(new THREE.Vector3(x, y, z));
        }
        // Also include near-escape points for fuller visualization
        else if (iter > maxIterations * 0.9) {
          const intensity = (iter - maxIterations * 0.9) / (maxIterations * 0.1);
          positions.push(new THREE.Vector3(x, y, z * intensity));
        }
      }
    }
  }
  
  // Alternative: 2D slices approach for better performance
  if (positions.length === 0) {
    const slices = 15;
    for (let slice = 0; slice < slices; slice++) {
      const zPos = THREE.MathUtils.mapLinear(slice, 0, slices - 1, -size/4, size/4);
      const cMod = c.clone();
      cMod.x += zPos * 0.1; // Vary constant by z
      
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          const x = THREE.MathUtils.mapLinear(i, 0, resolution - 1, -bound, bound);
          const y = THREE.MathUtils.mapLinear(j, 0, resolution - 1, -bound, bound);
          
          let zx = x;
          let zy = y;
          let iter = 0;
          
          while (zx * zx + zy * zy < bailout * bailout && iter < maxIterations) {
            const tmp = zx * zx - zy * zy + cMod.x;
            zy = 2 * zx * zy + cMod.y;
            zx = tmp;
            iter++;
          }
          
          if (iter === maxIterations) {
            positions.push(new THREE.Vector3(x, y, zPos));
          }
        }
      }
    }
  }
  
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 6, 6);
  const geometries: THREE.BufferGeometry[] = [];
  
  // Limit number of spheres for performance
  const maxSpheres = Math.min(positions.length, 5000);
  const skipInterval = Math.max(1, Math.floor(positions.length / maxSpheres));
  
  for (let i = 0; i < positions.length; i += skipInterval) {
    const cloned = sphereGeometry.clone();
    cloned.translate(positions[i].x, positions[i].y, positions[i].z);
    geometries.push(cloned);
  }
  
  const merged = mergeGeometries(geometries, false);
  
  sphereGeometry.dispose();
  geometries.forEach(g => g.dispose());
  
  return merged || new THREE.BufferGeometry();
}