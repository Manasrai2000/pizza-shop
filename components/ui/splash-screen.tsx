'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useMemo } from 'react'

interface SplashScreenProps {
  onComplete?: () => void
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      // Allow exit animation to complete before calling onComplete
      const onCompleteTimer = setTimeout(() => {
        onComplete?.()
      }, 1000)
      return () => clearTimeout(onCompleteTimer)
    }, 3200)

    return () => clearTimeout(timer)
  }, [onComplete])

  const brandNameChars = useMemo(() => "Pizza Expert".split(""), [])
  const tagline = "love at first slice"

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.05,
            transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] } 
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0A0A] overflow-hidden"
        >
          <div className="relative flex flex-col items-center px-4">
            {/* Brand Name Text with staggering character animation */}
            <h1 className="flex flex-wrap justify-center text-4xl font-bold tracking-tight text-[#FFC107] md:text-7xl lg:text-8xl">
              {brandNameChars.map((letter, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.5 + idx * 0.08,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                  className="inline-block"
                  style={{
                    textShadow: "0 0 30px rgba(255, 193, 7, 0.3)"
                  }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </h1>

            {/* Line Animation */}
            <div className="w-full max-w-[300px] md:max-w-[500px] mt-4 relative">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: 1.2,
                  delay: 1.8,
                  ease: [0.65, 0, 0.35, 1]
                }}
                className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#FFC107]/60 to-transparent origin-center"
              />
            </div>

            {/* Tagline Animation */}
            <motion.p
              initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{
                duration: 1,
                delay: 2.4,
                ease: [0.22, 1, 0.36, 1]
              }}
              className="mt-6 text-sm font-light text-[#FFC107]/70 md:text-xl lg:text-2xl tracking-[0.4em] uppercase text-center"
            >
              {tagline}
            </motion.p>
          </div>

          {/* Luxury Ambient Glow Element */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.15, scale: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FFC107] rounded-full blur-[140px] pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
