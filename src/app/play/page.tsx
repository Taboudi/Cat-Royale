"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CAT_COUNT, isCat, type Cat } from "@/lib/cats";

type Game = {
  round: Cat[];
  winners: Cat[];
  match: number;
};

export default function Play() {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadCats() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cats", { cache: "no-store" });
      const data: unknown = await response.json();

      if (!response.ok) {
        setError("We couldn't load the cats right now. Please try again.");
        return;
      }

      if (!Array.isArray(data) || data.length !== CAT_COUNT || !data.every(isCat)) {
        console.error("The server returned an invalid cat pool.");
        setError("We couldn't load the cats right now. Please try again.");
        return;
      }

      setGame({ round: data, winners: [], match: 0 });

    } catch (error) {
      console.error("Failed to load the tournament:", error);
      setError("We couldn't load the cats right now. Please try again.");

    } finally {
      setLoading(false);
    }
  }

  if (!game) {
    return (
      <main>
        <Link href="/">← Back to Cat Royale</Link>

        <h1>Cat Royale</h1>
        <p>16 cats enter. One is crowned.</p>

        <button type="button" onClick={loadCats} disabled={loading} className="cursor-pointer disabled:cursor-not-allowed">
          {loading ? "Finding contenders..." : "Start Royale"}
        </button>

        {error && <p>{error}</p>}
      </main>
    );
  }

  const pair = game.round.slice(0, 2);

  return (
    <main>
      <Link href="/">← Back to Cat Royale</Link>

      <h1>Cat Royale</h1>
      <p>Round of 16 — Duel 1 of 8</p>

      <h2>Choose your favourite cat</h2>

      <div>
        {pair.map((cat, index) => (
          <div key={cat.id}>
            <Image src={cat.url} alt={`Cat ${index + 1}`} width={500} height={500} />
          </div>
        ))}
      </div>
    </main>
  );
}