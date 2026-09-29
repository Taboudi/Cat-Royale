import Image from "next/image";
import { AccentIcon } from "@/components/icons";
import { PlayButton } from "@/components/play-button";

export default function Home() {
  return (
    <main id="main" className="home-page">
      <h1 className="hero-wordmark">Cat Royale</h1>

      <div className="home-intro">
        <h2>Choose the cutest of them all.</h2>
        <p>Pick your favourite in each duel until one cat remains.</p>
      </div>

      <div className="home-photos" data-nosnippet>
        <AccentIcon className="home-accent" />

        <div className="sample-photo sample-photo-first">
          <Image
            src="/cat-royale/Cutie 1.jpeg"
            alt="Cute cat of a friend"
            fill
            sizes="(max-width: 600px) 42vw, 260px"
            className="sample-photo-image"
            priority
          />
        </div>

        <div className="sample-photo sample-photo-second">
          <Image
            src="/cat-royale/Cutie 2.jpeg"
            alt="Another cute cat"
            fill
            sizes="(max-width: 600px) 42vw, 260px"
            className="sample-photo-image"
            priority
          />
        </div>
      </div>

      <PlayButton />
    </main>
  );
}