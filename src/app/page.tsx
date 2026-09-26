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
      <div className="home-photos">
        <AccentIcon className="home-accent" />
        <div className="sample-photo sample-photo-first"><Image src="/cat-royale/home-tabby.webp" alt="An illustrated example of a fluffy tabby cat looking up" width={512} height={400} sizes="(max-width: 600px) 42vw, 264px" loading="eager" /></div>
        <div className="sample-photo sample-photo-second"><Image src="/cat-royale/home-ginger.webp" alt="An illustrated example of a ginger kitten" width={512} height={400} sizes="(max-width: 600px) 42vw, 264px" loading="eager" /></div>
      </div>
      <PlayButton />
    </main>
  );
}
