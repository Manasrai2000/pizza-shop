'use client'

import React from 'react'

interface MenuGridProps {
  children: React.ReactNode
}

export function MenuGrid({ children }: MenuGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-3 md:gap-4 md:p-4 max-w-4xl mx-auto">
      {children}
    </div>
  )
}
