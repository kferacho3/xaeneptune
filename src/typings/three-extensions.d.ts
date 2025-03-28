declare module "three/examples/jsm/geometries/TextGeometry";
declare module "three/examples/jsm/loaders/FontLoader";
declare module "three/examples/jsm/utils/BufferGeometryUtils.js";
declare module "three/examples/jsm/utils/BufferGeometryUtils" {
  import { BufferGeometry } from "three";
  export function mergeBufferGeometries(
    geometries: BufferGeometry[],
    useGroups?: boolean,
  ): BufferGeometry | null;
}
