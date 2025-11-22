'use client'

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      color: string
      radius: number
    }> = []

    const colors = [
      'rgba(59, 130, 246, 0.6)',   // blue
      'rgba(147, 51, 234, 0.6)',   // purple
      'rgba(236, 72, 153, 0.6)',   // pink
      'rgba(34, 211, 238, 0.6)',   // cyan
      'rgba(168, 85, 247, 0.6)',   // violet
    ]

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: (Math.random() - 0.5) * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: Math.random() * 3 + 1,
      })
    }

    let animationId: number

    function animate() {
      if (!ctx || !canvas) return

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, i) => {
        // Update position with 3D movement
        particle.x += particle.vx
        particle.y += particle.vy
        particle.z += particle.vz

        // Wrap around edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1
        if (particle.z < 0 || particle.z > 1000) particle.vz *= -1

        // 3D perspective effect
        const scale = 1000 / (1000 + particle.z)
        const x2d = particle.x
        const y2d = particle.y
        const radius = particle.radius * scale

        // Draw particle with glow
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(x2d, y2d, 0, x2d, y2d, radius * 3)
        gradient.addColorStop(0, particle.color)
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.fillStyle = gradient
        ctx.arc(x2d, y2d, radius * 3, 0, Math.PI * 2)
        ctx.fill()

        // Draw core particle
        ctx.beginPath()
        ctx.fillStyle = particle.color.replace('0.6', '0.9')
        ctx.arc(x2d, y2d, radius, 0, Math.PI * 2)
        ctx.fill()

        // Connect nearby particles with lines
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.2 * (1 - distance / 150)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(x2d, y2d)
            const otherScale = 1000 / (1000 + otherParticle.z)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
          }
        })
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'linear-gradient(to bottom right, #0a0a0a, #1a0a2e, #0a0a0a)',
      }}
    />
  )
}
