export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lgs" x1="4" y1="28" x2="28" y2="4">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="35%" stopColor="#7C3AED" />
          <stop offset="65%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#lgs)" opacity="0.12" />
      <circle cx="12" cy="13" r="5" fill="currentColor" opacity="0.3" className="text-primary-400" />
      <circle cx="20" cy="13" r="5" fill="currentColor" opacity="0.3" className="text-primary-400" />
      <circle cx="16" cy="21" r="5" fill="currentColor" opacity="0.3" className="text-primary-400" />
      <circle cx="12.5" cy="14" r="3" fill="currentColor" className="text-primary-400" />
      <circle cx="19.5" cy="14" r="3" fill="currentColor" className="text-pink-400" />
      <circle cx="16" cy="20" r="3" fill="currentColor" className="text-amber-400" />
    </svg>
  )
}
