/** Ampelkuning mark: a traffic light with the amber lamp lit ("ampel kuning"). */
export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="9" y="2" width="22" height="36" rx="8" fill="oklch(0.27 0.03 70)" />
      <circle cx="20" cy="11" r="4.2" fill="oklch(0.58 0.22 27)" opacity="0.35" />
      <circle cx="20" cy="20" r="4.6" fill="oklch(0.84 0.172 86)" className="lamp-glow" />
      <circle cx="20" cy="29" r="4.2" fill="oklch(0.68 0.18 150)" opacity="0.35" />
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className="text-xl font-extrabold tracking-tight">
        Ampel<span className="text-[oklch(0.68_0.17_72)] dark:text-primary">kuning</span>
      </span>
    </span>
  )
}
