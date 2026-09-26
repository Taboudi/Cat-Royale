import type { Metadata } from "next";
import { PlayButton } from "@/components/play-button";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <main id="main" className="about-page">
      <p className="eyebrow">About Cat Royale</p>
      <h1 className="display-heading">A few cats.<br />One favourite.</h1>
      <div className="about-copy">
        <p>Sixteen cat photos enter a tournament. You choose your favourite from each pair until only the cutest remains.</p>
        <p>Cat Royale is a small student project built with Next.js, TypeScript and ChatGPT. The point is simple: make a nice little game as a way of learning how to build website structures properly.</p>
        <p>Tournament photos come from <a href="https://thecatapi.com" target="_blank" rel="noreferrer">The Cat API.</a></p>
        <p>You can contact me at <a href="mailto:cat.royale.official.queries@gmail.com" className="nav-link">cat.royale.official.queries@gmail.com</a>.</p>
      </div>
      <PlayButton />
    </main>
  );
}
