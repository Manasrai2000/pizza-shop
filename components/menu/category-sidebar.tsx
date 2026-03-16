'use client'

import React from 'react'

import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  image_url?: string
}

interface CategorySidebarProps {
  categories: Category[]
  activeCategory: string
  onCategoryChange: (id: string) => void
}

export function CategorySidebar({ categories, activeCategory, onCategoryChange }: CategorySidebarProps) {
  return (
    <aside className="w-[80px] md:w-[120px] border-r h-[calc(100vh-3.5rem)] sticky top-14 bg-background z-30 transition-all">
      <ScrollArea className="h-full">
        <div className="p-2 space-y-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={cn(
                "w-full flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 gap-1.5 group",
                activeCategory === category.id 
                  ? "bg-primary/5 text-primary" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <div className={cn(
                "relative h-10 w-10 md:h-14 md:w-14 rounded-full overflow-hidden transition-transform group-active:scale-95",
                activeCategory === category.id ? "ring-2 ring-primary ring-offset-2" : "opacity-80 group-hover:opacity-100"
              )}>
                {category.image_url ? (
                  <Image 
                    src={category.image_url} 
                    alt={category.name} 
                    fill
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center text-lg">
                    🍽️
                  </div>
                )}
              </div>
              <span className={cn(
                "text-[9px] md:text-[11px] font-bold text-center leading-tight truncate w-full",
                activeCategory === category.id ? "text-primary" : ""
              )}>
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}
