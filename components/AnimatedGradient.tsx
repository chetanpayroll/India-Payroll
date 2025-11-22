'use client'

import { useEffect, useRef } from 'react'

interface AnimatedGradientProps {
  colors?: string[]
  speed?: number
  className?: string
}

export default function AnimatedGradient({
  colors = ['#3b82f6', '#9333ea', '#ec4899', '#22d3ee', '#a855f7'],
  speed = 0.002,
  className = '',
}: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let time = 0
    let animationId: number

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 }
    }

    const rgbColors = colors.map(hexToRgb)

    function drawGradient() {
      if (!ctx || !canvas) return

      const gradient = ctx.createLinearGradient(
        Math.sin(time) * canvas.width,
        Math.cos(time) * canvas.height,
        Math.cos(time) * canvas.width,
        Math.sin(time) * canvas.height
      )

      rgbColors.forEach((color, index) => {
        const position = index / (rgbColors.length - 1)
        const offset = Math.sin(time + index) * 0.1
        gradient.addColorStop(
          Math.max(0, Math.min(1, position + offset)),
          `rgb(${color.r}, ${color.g}, ${color.b})`
        )
      })

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      time += speed
      animationId = requestAnimationFrame(drawGradient)
    }

    drawGradient()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [colors, speed])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ opacity: 0.15 }}
    />
  )
}
