'use client'

import { motion } from 'framer-motion'

export default function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
    x: Math.random() * 100,
    opacity: Math.random() * 0.5 + 0.2,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            background: `radial-gradient(circle, rgba(147, 51, 234, ${particle.opacity}), rgba(59, 130, 246, ${particle.opacity * 0.5}))`,
            filter: 'blur(1px)',
          }}
          animate={{
            y: ['100vh', '-10vh'],
            x: [
              `${particle.x}%`,
              `${particle.x + (Math.random() - 0.5) * 20}%`,
              `${particle.x}%`,
            ],
            scale: [1, 1.5, 1],
            opacity: [0, particle.opacity, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}
