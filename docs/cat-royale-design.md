# Cat Royale design

## Direction

A small, friendly cat-choice game with a dark background, powder-blue identity, expressive headings and large photographs. The visual reference is the approved Cat Royale mockup. The simple navigation changes colour on hover. A crown appears only above the final winner.

## Tokens

| Role | Value |
| --- | --- |
| Page | `#14171d` |
| Photo background | `#202630` |
| Accent | `#b3d0f7` |
| Accent hover | `#cee2fc` |
| Main text | `#f4f5f7` |
| Supporting text | `#bcc6d4` |
| Muted border | `#414b5a` |
| Heading font | Lilita One, regular |
| Body font | Figtree, variable |

Font loading is configured in `src/app/layout.tsx` through `next/font/google`. The project does not contain a copied font file.

## Screens

Homepage: shared header, large wordmark, short explanation, two tilted example pictures, and Play.

Duel: round name and match count, Choose one, two equal photo areas, no VS badge and no visible contender labels. The whole image stays inside its frame without cropping. Both images must load before a choice is accepted. A short selection acknowledgement precedes the next duel.

Champion: Your favourite, winning photo, a single small crown above the image, restrained decorative lines and Play again.

About: a working destination for the navigation link. It explains the game, image source and the current storage behaviour.

## Interaction and state

A shared provider keeps the tournament while navigating between pages and starts a tournament only in response to a Play click. A browser refresh clears the tournament. The homepage Play action navigates to `/play` and starts the request directly; there is no second mandatory Start click.

There is one browser request to `/api/cats` for a new tournament. The existing backend may make additional upstream requests according to its existing retry loop. Selecting winners and retrying an image do not request another pool.

The sound switch saves an on/off preference in localStorage, with an in-memory fallback when storage is unavailable. Sound effects are short synthesised tones generated after user interaction, with no external audio files or music library.

Native buttons, visible keyboard-only focus, focus transfer after a choice, status messages and reduced-motion styling are included. The live API still supplies no verified descriptions of the appearance of individual cats; positional alternative text is not a full nonvisual equivalent of the game.

## Image provenance

`public/cat-royale/home-tabby.webp` and `public/cat-royale/home-ginger.webp` are AI-generated example cat pictures extracted and straightened from the approved design mockup. They are fixed homepage artwork, not additional API results. The actual tournament continues to use The Cat API through the existing backend.

## Scope

This change adds the shared visual system, reusable navigation and Play button, responsive photo layouts, an About page, sound control, and a shared tournament state provider. The tournament progression function is separated into `src/lib/tournament.ts`.

The server route, API credentials, package versions and Upstash rate-limit implementation are not replaced. This is not the rate-limit hardening work discussed earlier: upstream quotas, fail-open behaviour, logging and deployment configuration still need their own pre-launch review.

## Verification

All nine TS/TSX files passed a TypeScript transpilation syntax check. An offline Chromium harness using React 18.2 exercised page transitions, keyboard choice, the fifteen-choice tournament, sound preference updates, safe error messages, invalid-pool rejection, image retry and narrow layouts. One hundred additional tournament simulations reached a single winner after fifteen choices, and invalid winners were rejected without mutating the input state.

The harness used adapters for Next.js navigation and images, mocked responses and fallback fonts. It is not a Next.js production build, a check of the real font rendering or a live API/rate-limit test. Run the actual project locally and build it before committing.

## Implementation references

- Next.js font handling: `https://nextjs.org/docs/app/getting-started/fonts`
- Next.js Image and sizes: `https://nextjs.org/docs/app/api-reference/components/image`
- Next.js public assets: `https://nextjs.org/docs/app/api-reference/file-conventions/public-folder`
- React context: `https://react.dev/reference/react/createContext`
- React external-store subscriptions: `https://react.dev/reference/react/useSyncExternalStore`
- Web Audio and user interaction: `https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices`
