/** Emblema del sistema: curva normal sobre disco dorado. */
export function Emblema({ className = 'h-11 w-11' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#f9b233" />
      <circle cx="24" cy="24" r="22" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1" />
      <path
        d="M9 31.5c3.6 0 5.2-2.6 7.2-7.4C18.4 18.9 20.3 14 24 14s5.6 4.9 7.8 10.1c2 4.8 3.6 7.4 7.2 7.4"
        fill="none"
        stroke="#006633"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path d="M24 14v17.5" stroke="#006633" strokeWidth="1.5" strokeDasharray="2 2.2" />
      <path d="M9 34.5h30" stroke="#006633" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
