/** Ampelkuning artwork (public/brand): one PNG per colour scheme, swapped with the `dark` class. */

/** Bamboo mark only (no lettering), for large decorative use. */
export function LogoMark({ className = 'size-9' }: { className?: string }) {
  return (
    <>
      <img src="/brand/mark-light.png" alt="" width={327} height={360} className={`${className} object-contain dark:hidden`} aria-hidden="true" />
      <img src="/brand/mark-dark.png" alt="" width={327} height={360} className={`${className} hidden object-contain dark:block`} aria-hidden="true" />
    </>
  )
}

/** Full logo with lettering. Height comes from `className` (width follows the artwork). */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img src="/brand/logo-light.png" alt="Ampelkuning" width={461} height={240} className="h-[3.1rem] w-auto dark:hidden md:h-14" />
      <img src="/brand/logo-dark.png" alt="Ampelkuning" width={426} height={240} className="hidden h-[3.1rem] w-auto dark:block md:h-14" />
    </span>
  )
}
