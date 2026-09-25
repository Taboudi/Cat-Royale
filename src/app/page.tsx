import Link from "next/link";

export default function Home() {
  return (
    <main>
      <h1>Cat Royale</h1>

      <h2>16 cats enter, Only the cutest will be crowned.</h2>

      <p>
        In Cat Royale, you choose your favourite cat in every duel and discover your ultimate
        champion of cuteness.
      </p>

      <Link href="/play">
        Start Royale
      </Link>
    </main>
  );
}