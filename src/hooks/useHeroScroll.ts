import { useEffect, type RefObject } from 'react'
import { usePrefersReducedMotion } from './useMediaQuery'

export function useHeroScroll(ref: RefObject<HTMLElement | null>): void {
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const element = ref.current
    if (!element || reducedMotion) return

    let frame = 0
    const update = () => {
      frame = 0
      const rect = element.getBoundingClientRect()
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)))
      element.style.setProperty('--scroll', progress.toFixed(4))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) cancelAnimationFrame(frame)
      element.style.removeProperty('--scroll')
    }
  }, [reducedMotion, ref])
}
