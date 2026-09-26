"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { MenuIcon, SpeakerIcon } from "@/components/icons";
import { useRoyale } from "@/components/royale-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const { soundEnabled, toggleSound } = useRoyale();
  const links = [{ href: "/", label: "Homepage" }, { href: "/about", label: "About" }];

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  return (
    <header className="site-header">
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map((link) => <Link key={link.href} href={link.href} className="nav-link" aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
      </nav>
      <details ref={menuRef} className="mobile-menu" onKeyDown={(event) => { if (event.key === "Escape") { closeMenu(); menuRef.current?.querySelector("summary")?.focus(); } }}>
        <summary className="icon-button" aria-label="Navigation"><MenuIcon /></summary>
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {links.map((link) => <Link key={link.href} href={link.href} className="nav-link" aria-current={pathname === link.href ? "page" : undefined} onClick={closeMenu}>{link.label}</Link>)}
        </nav>
      </details>
      <Link href="/" className="site-wordmark" aria-label="Cat Royale homepage">Cat Royale</Link>
      <button type="button" className="icon-button sound-toggle" onClick={toggleSound} aria-label={soundEnabled ? "Mute sound" : "Enable sound"} title={soundEnabled ? "Sound on" : "Sound off"}><SpeakerIcon muted={!soundEnabled} /></button>
    </header>
  );
}
