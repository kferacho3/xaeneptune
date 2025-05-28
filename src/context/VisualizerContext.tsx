// src/context/VisualizerContext.tsx
"use client";
import { createContext, ReactNode, useContext, useState } from "react";

type VisualizerContextType = {
  isBeatVisualizer: boolean;
  setIsBeatVisualizer: (value: boolean) => void;
};

const VisualizerContext = createContext<VisualizerContextType | undefined>(
  undefined,
);

export const VisualizerProvider = ({ children }: { children: ReactNode }) => {
  const [isBeatVisualizer, setIsBeatVisualizer] = useState<boolean>(false);
  return (
    <VisualizerContext.Provider
      value={{ isBeatVisualizer, setIsBeatVisualizer }}
    >
      {children}
    </VisualizerContext.Provider>
  );
};

export const useVisualizer = (): VisualizerContextType => {
  const context = useContext(VisualizerContext);
  if (!context) {
    throw new Error("useVisualizer must  be used within a VisualizerProvider");
  }
  return context;
};
