import { useEffect, useRef } from 'react'

const Fireworks = ({ duration = 3000 }: { duration?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const startTime = performance.now()
    const particles: {
      x: number
      y: number
      vx: number
      vy: number
      color: string
      alpha: number
    }[] = []

    const createExplosion = (x: number, y: number) => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500']
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 3 + 2
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1,
        })
      }
    }

    const loop = (timestamp: number) => {
      const elapsed = timestamp - startTime
      const isSpawning = elapsed < duration
      const hasParticles = particles.length > 0

      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.10)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'

      // 2. Spawn explosions only during the duration
      if (isSpawning && Math.random() < 0.05) {
        createExplosion(Math.random() * canvas.width, Math.random() * canvas.height * 0.8)
      }

      // 3. Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.alpha -= 0.02

        if (p.alpha <= 0) {
          particles.splice(i, 1)
        } else {
          ctx.globalAlpha = p.alpha
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      if (isSpawning || hasParticles) {
        animationFrameId = requestAnimationFrame(loop)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()
    animationFrameId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      // Ensure canvas is empty if component unmounts mid-animation
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [duration])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        borderRadius: 'inherit',
      }}
    />
  )
}

export default Fireworks
