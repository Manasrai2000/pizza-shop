'use client'

import React, { useState, useEffect } from 'react'
import { SplashScreen } from './splash-screen'

export function SplashScreenProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Check if session storage has 'splash-shown'
    const shown = sessionStorage.getItem('splash-screen-shown')
    if (shown) {
      setShowSplash(false)
    }
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
