import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function ArrowIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}><path d="M4 12h15M13 6l6 6-6 6" /></svg>;
}

export function SpeakerIcon({ muted = false, ...props }: IconProps & { muted?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" stroke="none" />
      {muted ? <path d="m17 9 5 6m0-6-5 6" /> : <><path d="M16 8a6 6 0 0 1 0 8" /><path d="M19 5a10 10 0 0 1 0 14" /></>}
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" focusable="false" {...props}><path d="M5 6h14M5 12h14M5 18h14" /></svg>;
}

export function CrownIcon(props: IconProps) {
  return <svg viewBox="0 0 64 48" fill="currentColor" stroke="var(--page)" strokeWidth="3" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}><path d="m7 10 15 11L32 5l10 16 15-11-6 31H13Z" /><path d="M15 34h34" fill="none" stroke="var(--page)" strokeWidth="1.7" /></svg>;
}

export function AccentIcon(props: IconProps) {
  return <svg viewBox="0 0 42 50" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" aria-hidden="true" focusable="false" {...props}><path d="m13 4 6 11M5 23l13 3M12 43l10-9" /></svg>;
}
