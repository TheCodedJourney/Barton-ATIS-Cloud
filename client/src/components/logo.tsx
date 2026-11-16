// Windsock mark. Keep in sync with client/public/favicon.svg.
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Windsock logo">
      <path d="M6 4v25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M7 5 12.25 6v10L7 17Z" fill="#f97316" />
      <path d="M12.25 6 17.5 7v8l-5.25 1Z" fill="#fff" stroke="#f97316" strokeWidth=".5" />
      <path d="M17.5 7 22.75 8v6l-5.25 1Z" fill="#f97316" />
      <path d="M22.75 8 28 9v4l-5.25 1Z" fill="#fff" stroke="#f97316" strokeWidth=".5" />
    </svg>
  );
}
