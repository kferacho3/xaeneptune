import { ColorMode, PointMode, RenderingMode, ShapeMode } from "./types";

interface VisualizerControlsProps {
  renderingMode: RenderingMode;
  setRenderingMode: (mode: RenderingMode) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  shapeMode: ShapeMode;
  setShapeMode: (mode: ShapeMode) => void;
  pointMode: PointMode;
  setPointMode: (mode: PointMode) => void;
}

export function VisualizerOneControls({
  renderingMode,
  setRenderingMode,
  colorMode,
  setColorMode,
  shapeMode,
  setShapeMode,
  pointMode,
  setPointMode,
}: VisualizerControlsProps) {
  const selectStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "6px",
    padding: "6px 10px",
    fontSize: "13px",
    cursor: "pointer",
    outline: "none",
    width: "100%",
  };

  return (
   
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          left: "0%",
          width: "40vw",
          display: "flex",
          zIndex: 99999,
          flexDirection: "column",
          gap: "12px",
          color: "white",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          padding: "20px",
          borderRadius: "12px",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          pointerEvents: 'auto',
        }}
      >
        <h3 style={{ 
          margin: "0 0 10px 0", 
          fontSize: "16px", 
          fontWeight: "600",
          borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
          paddingBottom: "10px"
        }}>
          Visualizer Settings
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255, 255, 255, 0.9)" }}>
            Rendering Mode
          </label>
          <select
            value={renderingMode}
            onChange={(e) => setRenderingMode(e.target.value as RenderingMode)}
            style={selectStyle}
          >
            <option value="solid">Solid</option>
            <option value="wireframe">Wireframe</option>
            <option value="rainbow">Rainbow</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255, 255, 255, 0.9)" }}>
            Color Mode
          </label>
          <select
            value={colorMode}
            onChange={(e) => setColorMode(e.target.value as ColorMode)}
            style={selectStyle}
          >
            <option value="default">Default</option>
            <option value="audioAmplitude">Audio Amplitude</option>
            <option value="frequencyBased">Frequency Based</option>
            <option value="rainbow">Rainbow</option>
          </select>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255, 255, 255, 0.9)" }}>
            Shape Mode
          </label>
          <select
            value={shapeMode}
            onChange={(e) => setShapeMode(e.target.value as ShapeMode)}
            style={selectStyle}
          >
            <option value="sphere">Sphere</option>
            <option value="cube">Cube</option>
            <option value="icosahedron">Icosahedron</option>
            <option value="tetrahedron">Tetrahedron</option>
            <option value="dodecahedron">Dodecahedron</option>
            <option value="octahedron">Octahedron</option>
            <option value="torus">Torus</option>
          </select>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "13px", fontWeight: "500", color: "rgba(255, 255, 255, 0.9)" }}>
            Point Style
          </label>
          <select
            value={pointMode}
            onChange={(e) => setPointMode(e.target.value as PointMode)}
            style={selectStyle}
          >
            <option value="points">Points</option>
            <option value="smallCubes">Small Cubes</option>
            <option value="crosses">Crosses</option>
            <option value="circles">Circles</option>
            <option value="diamonds">Diamonds</option>
            <option value="triangles">Triangles</option>
          </select>
        </div>
      </div>

  );
}