/**
 * A text wordmark for the concept (not CST Training's own logo):
 * two stacked cards, the way site workers carry theirs.
 */
export function Logo() {
  return (
    <span className="logo">
      <svg className="logo__mark" viewBox="0 0 40 30" aria-hidden="true" focusable="false">
        <rect x="2" y="6" width="26" height="17" rx="3" fill="var(--card-green)" transform="rotate(-10 15 14.5)" />
        <rect x="11" y="8" width="26" height="17" rx="3" fill="var(--signal)" />
        <rect x="15" y="12" width="6" height="5" rx="1" fill="var(--ink)" opacity="0.55" />
      </svg>
      <span className="logo__text">
        <span className="logo__name">CST</span> Training
      </span>
    </span>
  );
}
