import * as THREE from "three";
import { PointMode, ShapeMode } from "./types";

// Randomize initial shape on each render
const SHAPE_MODES: ShapeMode[] = ["sphere", "cube", "icosahedron", "tetrahedron", "dodecahedron", "octahedron", "torus"];
export const getRandomShape = (): ShapeMode => SHAPE_MODES[Math.floor(Math.random() * SHAPE_MODES.length)];

// Randomize point mode on each render
const POINT_MODES: PointMode[] = ["points", "smallCubes", "crosses", "circles", "diamonds", "triangles"];
export const getRandomPointMode = (): PointMode => POINT_MODES[Math.floor(Math.random() * POINT_MODES.length)];

export function createShapeGeometry(mode: ShapeMode): THREE.BufferGeometry {
  switch (mode) {
    case "cube":
      return new THREE.BoxGeometry(20, 20, 20, 10, 10, 10);
    case "icosahedron":
      return new THREE.IcosahedronGeometry(10, 4);
    case "tetrahedron":
      return new THREE.TetrahedronGeometry(15, 3);
    case "dodecahedron":
      return new THREE.DodecahedronGeometry(10, 2);
    case "octahedron":
      return new THREE.OctahedronGeometry(12, 3);
    case "torus":
      return new THREE.TorusGeometry(10, 4, 16, 100);
    case "sphere":
    default:
      return new THREE.SphereGeometry(10, 32, 32);
  }
}

export function createPointGeometry(mode: PointMode): THREE.BufferGeometry {
  switch (mode) {
    case "smallCubes":
      return new THREE.BoxGeometry(0.8, 0.8, 0.8);
    case "crosses":
      return new THREE.BoxGeometry(1.5, 0.3, 0.3);
    case "circles":
      return new THREE.SphereGeometry(0.4, 8, 8);
    case "diamonds":
      return new THREE.OctahedronGeometry(0.6, 0);
    case "triangles":
      return new THREE.TetrahedronGeometry(0.7, 0);
    default:
      return new THREE.BoxGeometry(0.8, 0.8, 0.8);
  }
}