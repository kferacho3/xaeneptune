export type ColorPalette = {
  name: string;
  colors: string[];
};

export const COLOR_PALETTES: ColorPalette[] = [
  {
    name: "Cyberpunk Dreams",
    colors: ["#FF006E", "#8338EC", "#3A86FF", "#06FFB4", "#FFBE0B", "#FB5607"]
  },
  {
    name: "Vaporwave Sunset",
    colors: ["#FF71CE", "#01CDFE", "#05FFA1", "#B967FF", "#FFFB96", "#FF9CEE"]
  },
  {
    name: "Deep Space",
    colors: ["#0D1B2A", "#1B263B", "#415A77", "#778DA9", "#B0C4DE", "#E0E1DD"]
  },
  {
    name: "Electric Garden",
    colors: ["#05F140", "#00FF88", "#7FFF00", "#DFFF00", "#FFEA00", "#FFC600"]
  },
  {
    name: "Midnight City",
    colors: ["#F72585", "#B5179E", "#7209B7", "#560BAD", "#480CA8", "#3A0CA3"]
  },
  {
    name: "Crystal Cave",
    colors: ["#89CFF0", "#6CB4EE", "#5AA9E6", "#4895EF", "#4361EE", "#3F37C9"]
  },
  {
    name: "Fire & Ice",
    colors: ["#FF0000", "#FF4500", "#FFA500", "#87CEEB", "#4682B4", "#0000FF"]
  },
  {
    name: "Holographic",
    colors: ["#F3C4FB", "#E4C1F9", "#D6A3DC", "#C589E8", "#B07CF2", "#9B72F2"]
  }
];

export function getRandomPalette(): ColorPalette {
  return COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : { r: 1, g: 1, b: 1 };
}