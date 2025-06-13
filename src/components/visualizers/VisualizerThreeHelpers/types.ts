export type EnvironmentMode =
  | "phantom" | "octagrams" | "raymarching"
  | "cycube"  | "disco"     | "golden"      | "undulating"
  | "mandelbob" | "plasma"  | "crystal"     | "truchet"
  | "structural" | "apollonian" | "binary" | "solar" | "pastel";

export type RenderingMode = "solid" | "wireframe" | "rainbow" | "transparent";

export type ColorPaletteName = 
  | "default" | "sunset" | "ocean" | "forest" | "candy" | "pastel" | "neon"
  | "grayscale" | "blues" | "greens" | "reds" | "purples" | "yellows"
  | "oranges" | "browns" | "teals" | "magentas" | "lime" | "indigo"
  | "violet" | "coral" | "salmon" | "skyblue" | "goldenrod" | "chocolate"
  | "maroon" | "olive" | "cyan" | "beige" | "lavender" | "tan"
  | "mustard" | "plum" | "turquoise" | "skyblue_darker";