export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="26" height="26" rx="7" stroke="url(--lg)" strokeWidth="1.2" opacity="0.3"/>
      <path d="M10 20l4-10 2 5 2-3 4 8H10z" fill="url(--lg)" opacity="0.7"/>
      <circle cx="10" cy="26" r="2" fill="#7C3AED"/>
      <circle cx="16" cy="26" r="2" fill="#EC4899"/>
      <circle cx="22" cy="26" r="2" fill="#F59E0B"/>
      <defs>
        <linearGradient id="--lg" x1="6" y1="26" x2="26" y2="6">
          <stop offset="0%" stopColor="#A78BFA"/>
          <stop offset="35%" stopColor="#7C3AED"/>
          <stop offset="65%" stopColor="#EC4899"/>
          <stop offset="100%" stopColor="#F59E0B"/>
        </linearGradient>
      </defs>
    </svg>
  )
}
