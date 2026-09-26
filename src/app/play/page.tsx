"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AccentIcon, CrownIcon } from "@/components/icons";
import { PlayButton } from "@/components/play-button";
import { useRoyale } from "@/components/royale-provider";
import { getCurrentPair, ROUND_NAMES, type Game } from "@/lib/tournament";

type PhotoState = "ready" | "failed";
type HeadingRef = RefObject<HTMLHeadingElement | null>;

function Duel({ game, headingRef }: { game: Game; headingRef: HeadingRef }) {
  const { selectedId, chooseWinner } = useRoyale();
  const [photos, setPhotos] = useState<Record<string, PhotoState>>({});
  const [photoAttempt, setPhotoAttempt] = useState(0);
  const pair = getCurrentPair(game);
  const ready = pair.every((cat) => photos[cat.id] === "ready");
  const failed = pair.some((cat) => photos[cat.id] === "failed");
  const canChoose = ready && selectedId === null;

  function retryPhotos() {
    setPhotos({});
    setPhotoAttempt((attempt) => attempt + 1);
  }

  return (
    <section className="duel-screen" aria-label="Current duel">
      <div className="screen-heading">
        <p id="duel-round" className="round-label">{ROUND_NAMES[game.round.length]} <span aria-hidden="true">&middot;</span> {game.match + 1} of {game.round.length / 2}</p>
        <h1 ref={headingRef} tabIndex={-1} aria-describedby="duel-round" className="display-heading focus-heading">Choose one.</h1>
      </div>
      <div className="duel-grid">
        {pair.map((cat, index) => (
          <button key={cat.id} type="button" className="cat-choice" aria-label={`Choose the ${index === 0 ? "first" : "second"} cat`} aria-disabled={!canChoose} data-outcome={selectedId ? selectedId === cat.id ? "chosen" : "dismissed" : undefined} onClick={(event) => { if (canChoose && event.detail < 2) chooseWinner(cat.id); }}>
            <span className="cat-frame">
              <Image key={`${cat.id}-${photoAttempt}`} src={cat.url} alt={`${index === 0 ? "First" : "Second"} cat in this duel`} fill sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1064px) calc((100vw - 88px) / 2), 488px" loading="eager" className="cat-photo" onLoad={() => setPhotos((current) => ({ ...current, [cat.id]: "ready" }))} onError={() => setPhotos((current) => ({ ...current, [cat.id]: "failed" }))} />
              {photos[cat.id] !== "ready" && <span className="photo-overlay" aria-hidden="true">{photos[cat.id] === "failed" ? "Photo unavailable" : <span className="spinner" />}</span>}
            </span>
          </button>
        ))}
      </div>
      <div className="duel-feedback">
        {!failed && <p role="status" className={ready ? "sr-only" : "quiet-text"}>{ready ? "Both cats are ready. Choose your favourite." : "Loading the photos..."}</p>}
        {failed && <div className="error-note"><p role="alert">A photo could not load. Your tournament is still here.</p><button type="button" className="text-button" onClick={retryPhotos}>Retry photos</button></div>}
      </div>
    </section>
  );
}

function Champion({ game, headingRef }: { game: Game; headingRef: HeadingRef }) {
  const champion = game.round[0];
  const [photoState, setPhotoState] = useState<"loading" | PhotoState>("loading");
  const [photoAttempt, setPhotoAttempt] = useState(0);

  function retryPhoto() {
    setPhotoState("loading");
    setPhotoAttempt((attempt) => attempt + 1);
  }

  return (
    <section className="champion-screen">
      <h1 ref={headingRef} tabIndex={-1} className="display-heading focus-heading">Your favourite.</h1>
      <div className="champion-portrait">
        <CrownIcon className="winner-crown" />
        <AccentIcon className="winner-accent winner-accent-left" />
        <AccentIcon className="winner-accent winner-accent-right" />
        <div className="champion-frame">
          <Image key={`${champion.id}-${photoAttempt}`} src={champion.url} alt="The cat you chose as your tournament winner" fill sizes="(max-width: 550px) calc(100vw - 64px), 470px" loading="eager" className="cat-photo" onLoad={() => setPhotoState("ready")} onError={() => setPhotoState("failed")} />
          {photoState !== "ready" && <div className="photo-overlay" aria-hidden="true">{photoState === "failed" ? "Photo unavailable" : <span className="spinner" />}</div>}
        </div>
      </div>
      {photoState === "loading" && <p role="status" className="sr-only">Loading your winner.</p>}
      {photoState === "failed" && <div className="error-note"><p role="alert">The winning photo could not load.</p><button type="button" className="text-button" onClick={retryPhoto}>Retry photo</button></div>}
      <PlayButton>Play again</PlayButton>
    </section>
  );
}

export default function Play() {
  const { game, loading, error } = useRoyale();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!loading) headingRef.current?.focus({ preventScroll: true });
  }, [game, loading, error]);

  return (
    <main id="main" className="play-page">
      {loading ? (
        <section className="waiting-screen" aria-busy="true">
          <h1 className="display-heading">One moment.</h1>
          <span className="spinner spinner-large" aria-hidden="true" />
          <p role="status" className="quiet-text">Finding 16 contenders...</p>
        </section>
      ) : !game ? (
        <section className="waiting-screen">
          <h1 ref={headingRef} tabIndex={-1} className="display-heading focus-heading">{error ? "Let's try that again." : "Ready when you are."}</h1>
          {error ? <p role="alert" className="error-note">{error}</p> : <p className="quiet-text">16 cats. One favourite.</p>}
          <PlayButton>{error ? "Try again" : "Play"}</PlayButton>
        </section>
      ) : game.round.length === 1 ? (
        <Champion key={game.round[0].id} game={game} headingRef={headingRef} />
      ) : (
        <Duel key={`${game.round.length}-${game.match}-${game.round[0].id}`} game={game} headingRef={headingRef} />
      )}
    </main>
  );
}
