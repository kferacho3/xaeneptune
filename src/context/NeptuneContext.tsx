// /src/context/NeptuneContext.tsx
import { createContext, useContext } from "react";
import * as THREE from "three";

// Provide a valid default ref object with current set to null.
export const NeptuneContext = createContext<
  React.RefObject<THREE.Group | null>
>({ current: null });
// /src/context/NeptuneContext.tsx

// Export a custom hook to access the Neptune context
export const useNeptune = () => useContext(NeptuneContext);
