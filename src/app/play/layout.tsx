import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play",
  description: "Play Cat Royale and choose your favourite cat through a 16-cat knockout tournament.",
};

export default function PlayLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}