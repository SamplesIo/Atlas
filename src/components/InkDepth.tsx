import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'

type ParticleLayer = {
  points: import('three').Points
  geometry: import('three').BufferGeometry
  material: import('three').PointsMaterial
  drift: number
}

const sprite = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const context = canvas.getContext('2d')
  if (!context) return null
  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
  gradient.addColorStop(0.35, 'rgba(255,255,255,0.7)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, 64, 64)
  return canvas
}

export function InkDepth() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (reducedMotion) return
    const canvas = canvasRef.current
    if (!canvas) return

    let heroVisible = true
    let heroObserver: IntersectionObserver | null = null

    let disposed = false
    let cleanup: (() => void) | undefined

    const start = async () => {
      const THREE = await import('three')
      if (disposed) return

      let renderer: import('three').WebGLRenderer
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        })
      } catch {
        return
      }

      const isSmall = window.innerWidth < 720
      const textureCanvas = sprite()
      if (!textureCanvas) {
        renderer.dispose()
        return
      }

      const texture = new THREE.CanvasTexture(textureCanvas)
      texture.colorSpace = THREE.SRGBColorSpace

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        52,
        window.innerWidth / window.innerHeight,
        0.1,
        40,
      )
      camera.position.z = 9

      const configs = [
        {
          count: isSmall ? 190 : 430,
          color: 0x6f6757,
          size: 0.08,
          opacity: 0.28,
          spreadX: 17,
          spreadY: 10,
          z: [-8, -3] as const,
          drift: 0.25,
        },
        {
          count: isSmall ? 72 : 160,
          color: 0xb18a56,
          size: 0.115,
          opacity: 0.38,
          spreadX: 14,
          spreadY: 9,
          z: [-3, 0] as const,
          drift: 0.6,
        },
        {
          count: isSmall ? 18 : 42,
          color: 0x39362e,
          size: 0.24,
          opacity: 0.12,
          spreadX: 11,
          spreadY: 7,
          z: [0, 2] as const,
          drift: 1.1,
        },
        {
          count: isSmall ? 10 : 22,
          color: 0x896b43,
          size: 0.46,
          opacity: 0.07,
          spreadX: 12,
          spreadY: 8,
          z: [-5, -1] as const,
          drift: 0.8,
        },
      ]

      const layers: ParticleLayer[] = configs.map((config) => {
        const positions = new Float32Array(config.count * 3)
        for (let i = 0; i < config.count; i += 1) {
          positions[i * 3] = (Math.random() - 0.5) * config.spreadX
          positions[i * 3 + 1] = (Math.random() - 0.5) * config.spreadY
          positions[i * 3 + 2] =
            config.z[0] + Math.random() * (config.z[1] - config.z[0])
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        const material = new THREE.PointsMaterial({
          color: config.color,
          size: config.size,
          map: texture,
          transparent: true,
          opacity: config.opacity,
          depthWrite: false,
          sizeAttenuation: true,
          alphaTest: 0.01,
        })
        const points = new THREE.Points(geometry, material)
        scene.add(points)
        return { points, geometry, material, drift: config.drift }
      })

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35))
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      renderer.setClearColor(0x000000, 0)

      let scrollTarget = 0
      let scrollCurrent = 0
      let pointerTargetX = 0
      let pointerTargetY = 0
      let pointerX = 0
      let pointerY = 0

      const readScroll = () => {
        scrollTarget = Math.min(
          1,
          Math.max(0, window.scrollY / Math.max(window.innerHeight, 1)),
        )
      }
      const onPointerMove = (event: PointerEvent) => {
        pointerTargetX = (event.clientX / window.innerWidth) * 2 - 1
        pointerTargetY = (event.clientY / window.innerHeight) * 2 - 1
      }
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.35))
        renderer.setSize(window.innerWidth, window.innerHeight, false)
        readScroll()
      }

      readScroll()
      window.addEventListener('scroll', readScroll, { passive: true })
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      window.addEventListener('resize', onResize, { passive: true })

      const hero = document.querySelector('.hero')
      if (hero) {
        heroObserver = new IntersectionObserver(
          (entries) => {
            heroVisible = entries.some((entry) => entry.isIntersecting)
          },
          { threshold: 0.01 },
        )
        heroObserver.observe(hero)
      }

      let frame = 0
      let previous = performance.now()
      const animate = (now: number) => {
        frame = requestAnimationFrame(animate)
        if (!heroVisible || document.hidden) return
        const delta = Math.min(0.05, (now - previous) / 1000)
        previous = now

        scrollCurrent += (scrollTarget - scrollCurrent) * Math.min(1, delta * 3)
        pointerX += (pointerTargetX - pointerX) * Math.min(1, delta * 4)
        pointerY += (pointerTargetY - pointerY) * Math.min(1, delta * 4)

        camera.position.x = pointerX * 0.55
        camera.position.y = -pointerY * 0.3 - scrollCurrent * 0.55
        camera.lookAt(0, -scrollCurrent * 0.2, 0)

        layers.forEach((layer, index) => {
          layer.points.rotation.y += delta * (0.012 + index * 0.006)
          layer.points.rotation.x = Math.sin(now * 0.00008 + index) * 0.05
          layer.points.position.y = -scrollCurrent * layer.drift * 1.5
          layer.points.position.x = pointerX * layer.drift * 0.35
        })

        renderer.render(scene, camera)
      }
      frame = requestAnimationFrame(animate)

      cleanup = () => {
        cancelAnimationFrame(frame)
        window.removeEventListener('scroll', readScroll)
        window.removeEventListener('pointermove', onPointerMove)
        window.removeEventListener('resize', onResize)
        layers.forEach((layer) => {
          layer.geometry.dispose()
          layer.material.dispose()
        })
        texture.dispose()
        renderer.dispose()
        heroObserver?.disconnect()
      }
    }

    void start().catch(() => {
      cleanup?.()
    })

    return () => {
      disposed = true
      cleanup?.()
    }
  }, [reducedMotion])

  return <canvas ref={canvasRef} className="ink-depth" aria-hidden="true" />
}
