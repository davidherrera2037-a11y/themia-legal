type LogoProps = {
  className?: string;
};

/**
 * Placeholder wordmark: a simple line-art "Justice figure as the letter T".
 *
 * This stands in for the real Themia Legal logo until the actual file is
 * added. To use the real logo instead, drop the file at
 * public/images/logo.png and swap the <LogoMark /> usage in Hero.tsx for
 * a plain <img src="/images/logo.png" ... /> — no other changes needed.
 */
export function LogoMark({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 130"
      className={className}
      role="img"
      aria-label="Themia Legal"
    >
      <title>Themia Legal</title>
      {/* scale beam + strings + pans (forms the crossbar of the T) */}
      <line x1="8" y1="40" x2="92" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="50" y1="26" x2="50" y2="40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="40" x2="8" y2="54" stroke="currentColor" strokeWidth="1.5" />
      <line x1="92" y1="40" x2="92" y2="54" stroke="currentColor" strokeWidth="1.5" />
      <path d="M 1 54 Q 8 66 15 54" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 85 54 Q 92 66 99 54" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* head + blindfold */}
      <circle cx="50" cy="18" r="9" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <line x1="42" y1="17.5" x2="58" y2="17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* robe (forms the stem of the T) */}
      <path
        d="M 38 30 L 62 30 L 70 118 L 30 118 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <line x1="50" y1="30" x2="50" y2="118" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
