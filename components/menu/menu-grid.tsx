'use client'

import React from 'react'

interface MenuGridProps {
  children: React.ReactNode
}

export function MenuGrid({ children }: MenuGridProps) {
  return (
    <div className="
      grid 
      grid-cols-2 
      sm:grid-cols-3 
      md:grid-cols-4 
      lg:grid-cols-5 
      xl:grid-cols-6
      gap-3 
      p-3 
      sm:gap-4 
      sm:p-4 
      md:gap-5 
      md:p-5
      max-w-7xl 
      mx-auto
    ">
      {children}
    </div>
  )
}