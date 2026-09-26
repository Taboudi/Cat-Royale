"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { CAT_COUNT, isCat, type Cat } from "@/lib/cats";

type Game = {
  round: Cat[];
  winners: Cat[];
  match: number;
};

const roundNames: Record<number, string> = {
  16: "Round of 16",
  8: "Quarterfinals",
  4: "Semifinals",
  2: "Final",
};

const LOAD_ERROR = "We couldn't load the cats right now. Please try again.";
const IMAGE_ERROR = "A cat photo couldn't load. Please start another Royale.";

export default function Play() {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);

  const requestInProgress = useRef(false);
  const nextChoiceAt = useRef(0);

  // Fetch a new tournament pool only when a start button is clicked.
  async function loadCats() {
    if (requestInProgress.current) {
      return;
    }

    requestInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cats", { cache: "no-store" });
      const data: unknown = await response.json();

      if (!response.ok) {
        setError(LOAD_ERROR);
        return;
      }

      if (!Array.isArray(data) || data.length !== CAT_COUNT || !data.every(isCat)) {
        setError(LOAD_ERROR);
        return;
      }

      // Every tournament entry must have a different image ID.
      if (new Set(data.map((cat) => cat.id)).size !== CAT_COUNT) {
        setError(LOAD_ERROR);
        return;
      }

      setLoadedImages([]);
      nextChoiceAt.current = 0;
      setGame({ round: data, winners: [], match: 0 });

    } catch {
      setError(LOAD_ERROR);

    } finally {
      requestInProgress.current = false;
      setLoading(false);
    }
  }

  // Record a winner and advance to the next duel or round.
  function chooseWinner(winner: Cat) {
    if (loading || error || Date.now() < nextChoiceAt.current) {
      return;
    }

    // Ignore very rapid repeat clicks.
    nextChoiceAt.current = Date.now() + 400;
    setLoadedImages([]);

    setGame((current) => {
      if (!current || current.round.length === 1) {
        return current;
      }

      const currentPair = current.round.slice(current.match * 2, current.match * 2 + 2);

      // Only a cat in the current duel can win.
      if (!currentPair.some((cat) => cat.id === winner.id)) {
        return current;
      }

      const winners = [...current.winners, winner];

      // Once every duel is finished, the winners become the next round.
      if (winners.length === current.round.length / 2) {
        return { round: winners, winners: [], match: 0 };
      }

      return { ...current, winners, match: current.match + 1 };
    });
  }

  // Remember which photos have finished loading.
  function markImageLoaded(id: string) {
    setLoadedImages((current) => current.includes(id) ? current : [...current, id]);
  }

  // Before a tournament starts.
  if (!game) {
    return (
      <main className="mx-auto max-w-5xl space-y-6 p-6">
        <Link href="/" className="underline">← Back to Homepage</Link>

        <h1 className="text-3xl font-bold">Cat Royale</h1>
        <p>{CAT_COUNT} cats enter. One is crowned.</p>

        <button type="button" onClick={loadCats} disabled={loading} className="cursor-pointer rounded-lg border px-5 py-3 disabled:cursor-not-allowed">
          {loading ? "Finding contenders..." : "Start Royale"}
        </button>

        {error && <p role="alert">{error}</p>}
      </main>
    );
  }

  // One remaining cat means the tournament is finished.
  if (game.round.length === 1) {
    const champion = game.round[0];

    return (
      <main className="mx-auto max-w-3xl space-y-6 p-6 text-center">
        <Link href="/" className="underline">← Back to Homepage</Link>

        <h1 className="text-4xl font-bold">Your Cat Royale</h1>
        <p>Meet your champion!</p>

        <Image src={champion.url} alt="Your Cat Royale champion" width={500} height={500} className="mx-auto aspect-square w-full max-w-lg object-contain" onError={() => setError(IMAGE_ERROR)} />

        <button type="button" onClick={loadCats} disabled={loading} className="cursor-pointer rounded-lg border px-5 py-3 disabled:cursor-not-allowed">
          {loading ? "Finding contenders..." : "Start another Royale"}
        </button>

        {error && <p role="alert">{error}</p>}
      </main>
    );
  }

  // Select the two cats taking part in the current duel.
  const pair = game.round.slice(game.match * 2, game.match * 2 + 2);
  const imagesReady = pair.every((cat) => loadedImages.includes(cat.id));
  const canChoose = imagesReady && !loading && !error;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6">
      <Link href="/" className="underline">← Back to Homepage</Link>

      <h1 className="text-3xl font-bold">Cat Royale</h1>

      <p aria-live="polite">
        {roundNames[game.round.length]} — Duel {game.match + 1} of {game.round.length / 2}
      </p>

      <h2 className="text-2xl font-semibold">Choose your favourite cat</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        {pair.map((cat, index) => (
          <button key={`${game.round.length}-${game.match}-${cat.id}`} type="button" onClick={() => chooseWinner(cat)} disabled={!canChoose} className="cursor-pointer overflow-hidden rounded-xl border-2 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed">
            <Image src={cat.url} alt={`Cat ${index + 1} in this duel`} width={500} height={500} loading="eager" className="aspect-square w-full object-contain" onLoad={() => markImageLoaded(cat.id)} onError={() => setError(IMAGE_ERROR)} />

            <span className="block p-3 font-semibold">Choose this cat</span>
          </button>
        ))}
      </div>

      {!error && <p role="status">{canChoose ? "Click your favourite to send it to the next round." : "Loading the contenders..."}</p>}

      {error && <p role="alert">{error}</p>}

      {error && (
        <button type="button" onClick={loadCats} disabled={loading} className="cursor-pointer rounded-lg border px-5 py-3 disabled:cursor-not-allowed">
          {loading ? "Finding contenders..." : "Start another Royale"}
        </button>
      )}
    </main>
  );
}