import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './useMediaQuery'

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3

export function useCountUp(target: number, active: boolean): number {
  const reducedMotion = usePrefersReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!active || reducedMotion) return

    const start = performance.now()
    const duration = 1500
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      setValue(Math.round(target * easeOutCubic(progress)))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, reducedMotion, target])

  return reducedMotion ? target : value
}
