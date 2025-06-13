/* =========================================================
 *  Type definitions & shared constants for Visualizer Four
 * ======================================================= */
import * as THREE from "three";

/* ----- UI enums -------------------------------------------------------- */
export type RenderingMode = "solid" | "wireframe" | "rainbow" | "transparent";
export type ColorMode    = "default" | "audioAmplitude" | "frequencyBased" | "rainbow";

/* ----- FFT texture size (MUST be power-of-two for DataTexture) -------- */
export const FFT_TEXTURE_SIZE = 512;

/* ----- Palette list (28 hand-curated schemes) ------------------------- */
export const colorPalettes: string[][] = [
  ["#0077B6","#00B4D8","#90E0EF","#CAF0F8"],
  ["#264653","#2A9D8F","#E9C46A","#F4A261","#E76F51"],
  ["#4506CB","#7A0BC0","#A20BD1","#C700B9","#F900BF"],
  ["#0B666A","#5CB85C","#FDE74C","#FFC857","#E9724C"],
  ["#1A535C","#4ECDC4","#F7FFF7","#FF6B6B","#FFE66D"],
  ["#283618","#606C38","#B8B8B8","#DDA15E","#BC6C25"],
  ["#03045E","#0077B6","#00A6FB","#B4D2E7","#F1FAEE"],
  ["#6A040F","#9D0208","#D7263D","#F48C06","#FFBA08"],
  // ----- 20 extra ------------------------------------------------------
  ["#2B2D42","#3A86FF","#FF006E","#FB5607","#FFBE0B"],
  ["#FAF3DD","#C8D5B9","#8FC0A9","#68B0AB","#4A7C59"],
  ["#0A0908","#22333B","#EAE0D5","#C6AC8F","#5E503F"],
  ["#DCE8C0","#F5634A","#DF2935","#86BA90","#CCFF66"],
  ["#7C4FFF","#651FFF","#6200EA","#B385FF","#4E148C"],
  ["#665191","#F28482","#F6BD60","#F5CAC3","#84A59D"],
  ["#8AAAE5","#FFC2CE","#FFA384","#FFBF81","#FFEE93"],
  ["#E7EFC5","#C4DFAA","#90C290","#4F6C50","#2C3639"],
  ["#BCE6EB","#FDFA66","#FFB5C2","#FF94CC","#FA5882"],
  ["#3F72AF","#D3E9FF","#F3F7FA","#364F6B","#FC5185"],
  ["#DFE7FD","#C2BBF0","#7E78D2","#5952C1","#27296D"],
  ["#34344A","#883677","#F7E5F1","#CFC4E9","#5E4352"],
  ["#F0EFF4","#D3CCE3","#E9E4F0","#BBA0CA","#C7B8E1"],
  ["#FAD5A5","#FFB385","#FFAAA6","#DEA2A2","#F6EAC2"],
  ["#4F000B","#720026","#CE4257","#FF7F51","#FFB7C3"],
  ["#B8FEF1","#BAFFB4","#FFD9DA","#FFA6C9","#FF74B1"],
  ["#C6F1D6","#F3FFBD","#FFDA9A","#FFA5A5","#FF6767"],
  ["#F72585","#7209B7","#560BAD","#480CA8","#3A0CA3"],
  ["#6D6875","#B5838D","#E5989B","#FFB4A2","#FFCDB2"],
  ["#110B11","#2C2A4A","#801BF2","#B726FF","#F5B8FF"],
];

/* ----- Helper to get THREE.Color palettes quickly -------------------- */
export const paletteToThree = (p: string[]) =>
  p.map(col => new THREE.Color(col));
