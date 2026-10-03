/** Ampelkuning artwork (public/brand): one PNG per colour scheme, swapped with the `dark` class. */
export function Logo({ className = 'h-10' }: { className?: string }) {
  return (
    <span className="inline-flex items-center">
      <img src="/brand/logo-light.png" alt="Ampelkuning" width={461} height={240} className={`${className} w-auto dark:hidden`} />
      <img src="/brand/logo-dark.png" alt="Ampelkuning" width={426} height={240} className={`${className} hidden w-auto dark:block`} />
    </span>
  )
}
