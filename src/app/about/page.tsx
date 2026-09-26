import type { Metadata } from "next";
import { PlayButton } from "@/components/play-button";

export const metadata: Metadata = { title: "About" };

export default function About() {
  return (
    <main id="main" className="about-page">
      <p className="eyebrow">About Cat Royale</p>
      <h1 className="display-heading">A few cats.<br />One favourite.</h1>
      <div className="about-copy">
        <p>Sixteen cat photos enter a tournament. You choose your favourite from each pair until only one remains. There is no right answer.</p>
        <p>Cat Royale is a small student project built with Next.js and TypeScript. The point is simple: make a nice little game, and learn how to build it properly.</p>
        <p>Tournament photos come from <a href="https://thecatapi.com" target="_blank" rel="noreferrer">The Cat API</a>. The homepage uses two fixed, AI-generated example pictures from the site design, so opening it does not request a new batch of cats.</p>
        <p>Your current tournament stays available while you move between pages. Refreshing the site resets it. The sound button remembers your preference in this browser.</p>
      </div>
      <PlayButton />
    </main>
  );
}
