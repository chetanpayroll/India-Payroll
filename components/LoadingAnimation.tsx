'use client'

import { motion } from 'framer-motion'

export default function LoadingAnimation() {
  const dots = Array.from({ length: 12 })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="relative">
        {/* Rotating dots */}
        <div className="relative w-32 h-32">
          {dots.map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0',
              }}
              animate={{
                rotate: [i * 30, i * 30 + 360],
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Center pulsing circle */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(147, 51, 234, 0.8), transparent)',
            filter: 'blur(10px)',
          }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Loading text */}
        <motion.div
          className="absolute top-full left-1/2 -translate-x-1/2 mt-8 text-white font-semibold text-xl"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          Loading...
        </motion.div>

        {/* Orbiting particles */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={`orbit-${i}`}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-cyan-400"
            style={{
              filter: 'blur(1px)',
              boxShadow: '0 0 10px rgba(34, 211, 238, 0.8)',
            }}
            animate={{
              x: [0, 60 * Math.cos(i * (Math.PI * 2) / 3), 0],
              y: [0, 60 * Math.sin(i * (Math.PI * 2) / 3), 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </div>
  )
}
