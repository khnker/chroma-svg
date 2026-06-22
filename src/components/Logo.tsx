export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300" />
      <circle cx="10" cy="11" r="4.5" fill="currentColor" className="text-primary-500" />
      <circle cx="22" cy="11" r="4.5" fill="currentColor" className="text-purple-500" />
      <circle cx="10" cy="21" r="4.5" fill="currentColor" className="text-pink-500" />
      <circle cx="22" cy="21" r="4.5" fill="currentColor" className="text-amber-500" />
      <circle cx="16" cy="16" r="3" fill="currentColor" className="text-emerald-500" />
    </svg>
  )
}
