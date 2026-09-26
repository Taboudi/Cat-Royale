import type { Metadata, Viewport } from "next";
import { Figtree, Lilita_One } from "next/font/google";
import { RoyaleProvider } from "@/components/royale-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const lilita = Lilita_One({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Cat Royale", template: "%s | Cat Royale" },
  description: "Choose the cutest of them all. Pick your favourite in each duel until one cat remains.",
};

export const viewport: Viewport = { themeColor: "#14171d", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${figtree.variable} ${lilita.variable}`}>
      <body>
        <RoyaleProvider>
          <a href="#main" className="skip-link">Skip to content</a>
          <SiteHeader />
          {children}
        </RoyaleProvider>
      </body>
    </html>
  );
}
