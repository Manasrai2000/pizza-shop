'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface MarqueeTextProps {
  text: string
  className?: string
  speed?: number // pixels per second
}

export function MarqueeText({ text, className, speed = 30 }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [duration, setDuration] = useState(8)
  const [distance, setDistance] = useState(0)

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        // Reset state for measurement
        setShouldAnimate(false)
        
        // Use getBoundingClientRect for more precision
        const containerWidth = containerRef.current.getBoundingClientRect().width
        const textWidth = textRef.current.scrollWidth
        
        const overflow = textWidth > containerWidth
        if (overflow) {
          const overflowDistance = (textWidth - containerWidth) + 15
          setDistance(overflowDistance)
          
          const moveDuration = overflowDistance / speed
          const totalDuration = moveDuration / 0.2
          setDuration(Math.max(6, Math.min(15, totalDuration)))
          setShouldAnimate(true)
        }
      }
    }

    // Measure after layout is likely finished
    const timeoutId = setTimeout(checkOverflow, 100)
    
    // Create a ResizeObserver to re-measure when the window or container changes
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow()
    })
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
    }
  }, [text, speed])

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "marquee-container w-full min-w-0 flex-shrink", // Ensure it doesn't expand its parent
        className,
        shouldAnimate && "text-left"
      )}
      style={{ 
        '--marquee-duration': `${duration}s`,
        '--marquee-distance': `-${distance}px`,
      } as React.CSSProperties}
    >
      <span
        ref={textRef}
        className={cn("inline-block whitespace-nowrap", shouldAnimate && "animate-marquee-music")}
      >
        {text}
      </span>
    </div>
  )
}
