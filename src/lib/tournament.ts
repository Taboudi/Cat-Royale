import { CAT_COUNT, type Cat } from "@/lib/cats";

export type Game = {
  round: Cat[];
  winners: Cat[];
  match: number;
};

export const ROUND_NAMES: Record<number, string> = {
  16: "Round of 16",
  8: "Quarterfinals",
  4: "Semifinals",
  2: "Final",
};

export function createTournament(cats: Cat[]): Game {
  if (cats.length !== CAT_COUNT || new Set(cats.map((cat) => cat.id)).size !== CAT_COUNT) {
    throw new Error("A tournament needs 16 different cat entries.");
  }

  return { round: [...cats], winners: [], match: 0 };
}

export function getCurrentPair(game: Game): Cat[] {
  return game.round.slice(game.match * 2, game.match * 2 + 2);
}

export function advanceTournament(game: Game, winnerId: string): Game {
  if (game.round.length === 1) {
    return game;
  }

  const winner = getCurrentPair(game).find((cat) => cat.id === winnerId);

  if (!winner) {
    return game;
  }

  const winners = [...game.winners, winner];

  if (winners.length === game.round.length / 2) {
    return { round: winners, winners: [], match: 0 };
  }

  return { ...game, winners, match: game.match + 1 };
}
