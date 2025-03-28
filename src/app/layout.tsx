// src/app/layout.tsx
import { VisualizerProvider } from "@/context/VisualizerContext";
import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "../../styles/globals.css";

const orbitron = Orbitron({ weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Xaeneptune Official Website",
  description: "Collection of golden tracks",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={orbitron.className}>
      <head />
      <body className="antialiased">
        <VisualizerProvider>{children}</VisualizerProvider>
      </body>
    </html>
  );
}
