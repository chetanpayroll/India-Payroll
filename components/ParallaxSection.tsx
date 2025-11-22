'use client'

import { ReactNode, useRef, useEffect, useState } from 'react'

interface ParallaxSectionProps {
  children: ReactNode
  speed?: number
  className?: string
}

export default function ParallaxSection({
  children,
  speed = 0.5,
  className = '',
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return

      const rect = sectionRef.current.getBoundingClientRect()
      const scrolled = window.pageYOffset + rect.top
      const viewportHeight = window.innerHeight
      const elementHeight = rect.height

      // Calculate parallax offset
      if (rect.top < viewportHeight && rect.bottom > 0) {
        const relativeScroll = (viewportHeight - rect.top) / (viewportHeight + elementHeight)
        setOffset(relativeScroll * 100 * speed)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      <div
        style={{
          transform: `translate3d(0, ${-offset}px, 0)`,
          transition: 'transform 0.1s ease-out',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  )
}
