'use client'

import { ReactNode, useRef, MouseEvent } from 'react'
import { motion } from 'framer-motion'

interface Card3DProps {
  children: ReactNode
  className?: string
  glassEffect?: boolean
  intensity?: number
}

export default function Card3D({
  children,
  className = '',
  glassEffect = true,
  intensity = 20
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * intensity
    const rotateY = ((x - centerX) / centerX) * intensity

    card.style.transform = `
      perspective(1000px)
      rotateX(${-rotateX}deg)
      rotateY(${rotateY}deg)
      translateZ(20px)
      scale3d(1.02, 1.02, 1.02)
    `
  }

  const handleMouseLeave = () => {
    if (!cardRef.current) return
    cardRef.current.style.transform = `
      perspective(1000px)
      rotateX(0deg)
      rotateY(0deg)
      translateZ(0px)
      scale3d(1, 1, 1)
    `
  }

  const glassStyles = glassEffect
    ? 'bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl'
    : 'bg-card'

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        relative rounded-xl border
        transition-all duration-300 ease-out
        transform-gpu
        ${glassStyles}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div
          className="absolute inset-[-2px] opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              'linear-gradient(45deg, transparent, rgba(147, 51, 234, 0.5), transparent)',
            animation: 'borderRotate 3s linear infinite',
          }}
        />
      </div>

      <div className="relative z-10" style={{ transform: 'translateZ(30px)' }}>
        {children}
      </div>

      <style jsx>{`
        @keyframes borderRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </motion.div>
  )
}
