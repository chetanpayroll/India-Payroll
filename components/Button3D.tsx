'use client'

import { ButtonHTMLAttributes, ReactNode, useRef, MouseEvent } from 'react'
import { motion } from 'framer-motion'

interface Button3DProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  magnetic?: boolean
}

export default function Button3D({
  children,
  variant = 'primary',
  magnetic = true,
  className = '',
  ...props
}: Button3DProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const variants = {
    primary: 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500',
    secondary: 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800',
    success: 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-500',
    danger: 'bg-gradient-to-br from-red-500 via-rose-600 to-pink-500',
  }

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!magnetic || !buttonRef.current) return

    const button = buttonRef.current
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    const distance = Math.sqrt(x * x + y * y)
    if (distance < 100) {
      const angle = Math.atan2(y, x)
      const magnetStrength = Math.max(0, 1 - distance / 100)
      const translateX = Math.cos(angle) * magnetStrength * 10
      const translateY = Math.sin(angle) * magnetStrength * 10

      button.style.transform = `
        perspective(1000px)
        translateX(${translateX}px)
        translateY(${translateY}px)
        translateZ(20px)
        rotateX(${-y * 0.1}deg)
        rotateY(${x * 0.1}deg)
        scale3d(1.05, 1.05, 1.05)
      `
    }
  }

  const handleMouseLeave = () => {
    if (!buttonRef.current) return
    buttonRef.current.style.transform = `
      perspective(1000px)
      translateX(0px)
      translateY(0px)
      translateZ(0px)
      rotateX(0deg)
      rotateY(0deg)
      scale3d(1, 1, 1)
    `
  }

  return (
    <motion.button
      ref={buttonRef as any}
      onMouseMove={handleMouseMove as any}
      onMouseLeave={handleMouseLeave as any}
      whileTap={{ scale: 0.95 }}
      className={`
        relative px-6 py-3 rounded-xl
        text-white font-semibold
        transition-all duration-300 ease-out
        transform-gpu
        ${variants[variant]}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        boxShadow: `
          0 10px 30px -10px rgba(147, 51, 234, 0.5),
          0 0 20px rgba(147, 51, 234, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.2)
        `,
      }}
      {...(props as any)}
    >
      {/* Top shine layer */}
      <div
        className="absolute inset-0 rounded-xl overflow-hidden"
        style={{ transform: 'translateZ(1px)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-transparent" />
      </div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 rounded-xl overflow-hidden opacity-0 hover:opacity-100 transition-opacity duration-500">
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'shimmer 2s infinite',
          }}
        />
      </div>

      {/* Shadow layer */}
      <div
        className="absolute inset-0 rounded-xl bg-black/20"
        style={{ transform: 'translateZ(-10px)' }}
      />

      <span className="relative z-10" style={{ transform: 'translateZ(20px)' }}>
        {children}
      </span>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) rotate(45deg);
          }
        }
      `}</style>
    </motion.button>
  )
}
