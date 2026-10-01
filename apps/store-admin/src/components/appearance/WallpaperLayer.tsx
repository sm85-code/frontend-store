import { AuroraBackground } from '../magicui/aurora-background'
import { DotPattern } from '../magicui/dot-pattern'
import { Ripple } from '../magicui/ripple'
import { useTheme } from '../../lib/appearance'

/** Fixed decorative layer behind shell content, driven by Appearance wallpaper. */
export default function WallpaperLayer() {
  const { wallpaper } = useTheme()
  if (wallpaper === 'none') return null
  return (
    <div className="wallpaper-layer" aria-hidden="true">
      {wallpaper === 'dots' && <DotPattern />}
      {wallpaper === 'glow' && <Ripple />}
      {wallpaper === 'aurora' && <AuroraBackground />}
    </div>
  )
}
