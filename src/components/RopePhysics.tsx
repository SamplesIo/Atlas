import { useEffect, useRef, type RefObject } from 'react'
import { useMediaQuery, usePrefersReducedMotion } from '../hooks/useMediaQuery'

type RopePhysicsProps = {
  containerRef: RefObject<HTMLDivElement | null>
}

type Swing = {
  row: HTMLElement
  y: number
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value))

/**
 * A damped rope pendulum driven by slow random gusts. There is no scroll
 * coupling: the wind changes the lean of the whole rope, while a small bow
 * and a tiny oscillation keep it alive. Knots sample this exact curve.
 */
export function RopePhysics({ containerRef }: RopePhysicsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const narrow = useMediaQuery('(max-width: 760px)')

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!container || !canvas || !context) return

    let frame = 0
    let visible = true
    let width = 0
    let height = 0
    let startY = 8
    let endY = 0
    let anchorX = 0
    let swings: Swing[] = []
    let cordGradient: CanvasGradient | null = null
    let threadGradient: CanvasGradient | null = null
    let resizeObserver: ResizeObserver | null = null
    let visibilityObserver: IntersectionObserver | null = null

    let lean = 0
    let leanVelocity = 0
    let leanTarget = 0
    let nextGust = 0
    let lastTime = 0
    let lastDraw = 0

    const maxLean = () => (narrow ? 5 : 8)

    const xAtY = (y: number, now: number): number => {
      if (endY <= startY) return anchorX
      const t = clamp((y - startY) / (endY - startY), 0, 1)
      const envelope = Math.sin(Math.PI * t)
      const bow =
        Math.sin(now * 0.0006 + 1.2) * 1.15 +
        Math.sin(now * 0.00027 + 2.6) * 0.55
      const tremble = Math.sin(now * 0.001 + t * 1.7) * 0.22
      return anchorX + lean * t + (bow + tremble) * envelope
    }

    const buildGradients = () => {
      const cord = context.createLinearGradient(0, startY, 0, endY)
      cord.addColorStop(0, 'rgba(128, 102, 63, 0.82)')
      cord.addColorStop(0.78, 'rgba(128, 102, 63, 0.82)')
      cord.addColorStop(0.9, 'rgba(128, 102, 63, 0.42)')
      cord.addColorStop(1, 'rgba(128, 102, 63, 0)')
      cordGradient = cord

      const thread = context.createLinearGradient(0, startY, 0, endY)
      thread.addColorStop(0, 'rgba(201, 168, 115, 0.66)')
      thread.addColorStop(0.78, 'rgba(201, 168, 115, 0.66)')
      thread.addColorStop(0.9, 'rgba(201, 168, 115, 0.3)')
      thread.addColorStop(1, 'rgba(201, 168, 115, 0)')
      threadGradient = thread
    }

    const build = () => {
      width = container.clientWidth
      height = container.clientHeight
      startY = 8
      endY = Math.max(startY + 80, height - 10)
      anchorX = narrow ? 16 : width / 2

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)

      const list = container.querySelector<HTMLElement>('.wishes-list')
      const rowBase = list?.offsetTop ?? 0
      swings = [...container.querySelectorAll<HTMLElement>('.wish')].map((row) => {
        const knot = row.querySelector<HTMLElement>('.wish__knot')
        return {
          row,
          y:
            rowBase +
            row.offsetTop +
            (knot?.offsetTop ?? 20) +
            (knot?.offsetHeight ?? 0) / 2,
        }
      })
      swings.forEach(({ row }) => {
        row.style.setProperty('--knot-x', '0px')
        row.style.setProperty('--card-x', '0px')
        row.style.setProperty('--card-rot', '0deg')
      })
      buildGradients()
      draw(0)
    }

    const updateWind = (now: number) => {
      if (now >= nextGust) {
        const direction = Math.random() < 0.5 ? -1 : 1
        leanTarget = direction * (maxLean() * (0.55 + Math.random() * 0.45))
        nextGust = now + 3600 + Math.random() * 3600
      }
    }

    const update = (now: number, delta: number) => {
      updateWind(now)
      leanVelocity += (leanTarget - lean) * 0.0045 * delta
      leanVelocity *= 0.986
      lean += leanVelocity * delta
      lean = clamp(lean, -maxLean() - 1, maxLean() + 1)

      swings.forEach(({ row, y }) => {
        const sway = xAtY(y, now) - anchorX
        row.style.setProperty('--knot-x', `${sway.toFixed(2)}px`)
        row.style.setProperty('--card-x', `${(sway * 0.16).toFixed(2)}px`)
        row.style.setProperty(
          '--card-rot',
          `${clamp(sway * 0.05, -0.4, 0.4).toFixed(2)}deg`,
        )
      })
    }

    const draw = (now: number) => {
      context.clearRect(0, 0, width, height)
      if (endY <= startY) return

      context.beginPath()
      let first = true
      for (let y = startY; y <= endY; y += 12) {
        const x = xAtY(y, now)
        if (first) {
          context.moveTo(x, y)
          first = false
        } else {
          context.lineTo(x, y)
        }
      }
      context.lineTo(xAtY(endY, now), endY)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.strokeStyle = cordGradient ?? 'rgba(128, 102, 63, 0.82)'
      context.lineWidth = 5.5
      context.stroke()

      context.beginPath()
      first = true
      for (let y = startY; y <= endY; y += 12) {
        const x = xAtY(y, now)
        if (first) {
          context.moveTo(x, y)
          first = false
        } else {
          context.lineTo(x, y)
        }
      }
      context.lineTo(xAtY(endY, now), endY)
      context.strokeStyle = threadGradient ?? 'rgba(201, 168, 115, 0.6)'
      context.lineWidth = 1.7
      context.setLineDash([3, 5])
      context.lineDashOffset = -now * 0.006
      context.stroke()
      context.setLineDash([])
    }

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (!visible || document.hidden) return
      if (now - lastDraw < 32) return
      const delta = lastTime ? clamp((now - lastTime) / 33, 0.25, 2) : 1
      lastDraw = now
      lastTime = now
      update(now, delta)
      draw(now)
    }

    build()
    visibilityObserver = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting)
        if (visible) lastTime = 0
      },
      { rootMargin: '120px 0px' },
    )
    visibilityObserver.observe(container)

    if (!reducedMotion) {
      resizeObserver = new ResizeObserver(() => build())
      resizeObserver.observe(container)
      frame = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      visibilityObserver?.disconnect()
      swings.forEach(({ row }) => {
        row.style.removeProperty('--knot-x')
        row.style.removeProperty('--card-x')
        row.style.removeProperty('--card-rot')
      })
    }
  }, [containerRef, narrow, reducedMotion])

  return <canvas ref={canvasRef} className="wishes-rope__canvas" aria-hidden="true" />
}
