// src/app/layout.tsx
import { VisualizerProvider } from "@/context/VisualizerContext";
import type { Metadata } from "next";
import "../../styles/globals.css";

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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <VisualizerProvider>{children}</VisualizerProvider>
      </body>
    </html>
  );
}
