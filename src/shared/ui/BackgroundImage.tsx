import { useState, useEffect } from 'react'

interface BackgroundImageProps {
  /** Resolved image URL (e.g. from import). */
  src: string
  /** Optional overlay class (e.g. "bg-slate-900/50"). */
  overlayClassName?: string
  /** Optional class for the container. */
  className?: string
  /** Accessibility: mark as decorative. */
  'aria-hidden'?: boolean
}

/**
 * Full-bleed background image with fade-in on load so first paint is less jarring on slow networks.
 */
export function BackgroundImage({
  src,
  overlayClassName = 'bg-slate-900/55',
  className = 'absolute inset-0',
  'aria-hidden': ariaHidden = true,
}: BackgroundImageProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!src) return
    const img = new Image()
    img.onload = () => setLoaded(true)
    img.src = src
  }, [src])

  return (
    <div className={`${className} bg-slate-900`} aria-hidden={ariaHidden}>
      <div
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ backgroundImage: `url(${src})` }}
      />
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  )
}
