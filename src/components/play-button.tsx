"use client";

import { useRouter } from "next/navigation";
import { ArrowIcon } from "@/components/icons";
import { useRoyale } from "@/components/royale-provider";

export function PlayButton({ children = "Play", className = "" }: { children?: React.ReactNode; className?: string }) {
  const router = useRouter();
  const { loading, startRoyale } = useRoyale();

  function handlePlay() {
    if (loading) return;
    void startRoyale();
    router.push("/play");
  }

  return <button type="button" className={`primary-button ${className}`} onClick={handlePlay} aria-disabled={loading}>{loading ? "Finding cats..." : children}<ArrowIcon /></button>;
}
