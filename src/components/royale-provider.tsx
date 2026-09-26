"use client";

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CAT_COUNT, isCat } from "@/lib/cats";
import { advanceTournament, createTournament, getCurrentPair, type Game } from "@/lib/tournament";

const SOUND_KEY = "cat-royale:sound";
const SOUND_EVENT = "cat-royale:sound-change";
const LOAD_ERROR = "We couldn't load the cats right now. Please try again.";
let memorySoundEnabled = true;

function subscribeToSound(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SOUND_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SOUND_EVENT, callback);
  };
}

function getSoundSnapshot() {
  try {
    const value = window.localStorage.getItem(SOUND_KEY);
    return value === null ? memorySoundEnabled : value !== "off";
  } catch {
    return memorySoundEnabled;
  }
}

function getServerSoundSnapshot() {
  return true;
}

type RoyaleContextValue = {
  game: Game | null;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  soundEnabled: boolean;
  startRoyale: () => Promise<void>;
  chooseWinner: (winnerId: string) => void;
  toggleSound: () => void;
};

const RoyaleContext = createContext<RoyaleContextValue | null>(null);

export function RoyaleProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const soundEnabled = useSyncExternalStore(subscribeToSound, getSoundSnapshot, getServerSoundSnapshot);
  const requestInProgress = useRef(false);
  const choiceInProgress = useRef(false);
  const requestController = useRef<AbortController | null>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      requestController.current?.abort();
      if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
      if (audioContext.current) void audioContext.current.close().catch(() => undefined);
    };
  }, []);

  function toggleSound() {
    const nextValue = !soundEnabled;
    memorySoundEnabled = nextValue;

    try {
      window.localStorage.setItem(SOUND_KEY, nextValue ? "on" : "off");
    } catch {
      window.dispatchEvent(new Event(SOUND_EVENT));
      return;
    }

    window.dispatchEvent(new Event(SOUND_EVENT));
  }

  function playSound(victory: boolean) {
    if (!soundEnabled) return;

    try {
      if (!audioContext.current || audioContext.current.state === "closed") {
        audioContext.current = new AudioContext();
      }

      const context = audioContext.current;
      const scheduleNotes = () => {
        const notes = victory ? [523.25, 659.25, 783.99] : [587.33];
        const duration = victory ? 0.22 : 0.075;

        notes.forEach((frequency, index) => {
          const start = context.currentTime + index * 0.09;
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, start);
          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(0.035, start + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start(start);
          oscillator.stop(start + duration + 0.02);
          oscillator.onended = () => {
            oscillator.disconnect();
            gain.disconnect();
          };
        });
      };

      if (context.state === "suspended") {
        void context.resume().then(scheduleNotes).catch(() => undefined);
      } else {
        scheduleNotes();
      }
    } catch {
      return;
    }
  }

  async function startRoyale() {
    if (requestInProgress.current || choiceInProgress.current) return;

    requestInProgress.current = true;
    setLoading(true);
    setError(null);
    setGame(null);
    setSelectedId(null);

    const controller = new AbortController();
    requestController.current = controller;
    const timeout = setTimeout(() => controller.abort(), 22000);

    try {
      const response = await fetch("/api/cats", { cache: "no-store", signal: controller.signal });
      const data: unknown = await response.json();

      if (!response.ok) {
        const message = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string" ? data.error : LOAD_ERROR;
        setError(message);
        return;
      }

      if (!Array.isArray(data) || data.length !== CAT_COUNT || !data.every(isCat)) {
        setError(LOAD_ERROR);
        return;
      }

      setGame(createTournament(data));
    } catch {
      setError(LOAD_ERROR);
    } finally {
      clearTimeout(timeout);
      requestController.current = null;
      requestInProgress.current = false;
      setLoading(false);
    }
  }

  function chooseWinner(winnerId: string) {
    if (!game || game.round.length === 1 || loading || choiceInProgress.current || requestInProgress.current) return;
    if (!getCurrentPair(game).some((cat) => cat.id === winnerId)) return;

    choiceInProgress.current = true;
    setSelectedId(winnerId);
    playSound(game.round.length === 2);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 140;

    transitionTimer.current = setTimeout(() => {
      setGame((current) => current === game ? advanceTournament(current, winnerId) : current);
      setSelectedId(null);
      choiceInProgress.current = false;
      transitionTimer.current = null;
    }, delay);
  }

  return <RoyaleContext.Provider value={{ game, loading, error, selectedId, soundEnabled, startRoyale, chooseWinner, toggleSound }}>{children}</RoyaleContext.Provider>;
}

export function useRoyale() {
  const context = useContext(RoyaleContext);
  if (!context) throw new Error("useRoyale must be used inside RoyaleProvider.");
  return context;
}
