'use client'

import React, { useState, useEffect } from 'react'
import { SplashScreen } from './splash-screen'

export function SplashScreenProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Defer state updates to avoid synchronous cascading renders and satisfy linter
    const init = () => {
      const shown = sessionStorage.getItem('splash-screen-shown')
      if (shown) {
        setShowSplash(false)
      }
      setMounted(true)
    }
    
    const timeoutId = setTimeout(init, 0)
    return () => clearTimeout(timeoutId)
  }, [])

  const handleComplete = () => {
    setShowSplash(false)
    sessionStorage.setItem('splash-screen-shown', 'true')
  }

  // Prevent hydration mismatch
  if (!mounted) return <div className="bg-[#0A0A0A] fixed inset-0 z-[100]" />

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleComplete} />}
      <div className={showSplash ? 'hidden' : 'block'}>
        {children}
      </div>
    </>
  )
}
