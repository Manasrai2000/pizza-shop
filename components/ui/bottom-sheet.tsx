'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  className?: string
}

export function BottomSheet({ isOpen, onClose, children, title, className }: BottomSheetProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              // Close if dragged down sufficiently or with high velocity
              if (offset.y > 100 || velocity.y > 500) {
                onClose()
              }
            }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[101] max-h-[90vh] pb-safe bg-background rounded-t-[20px] shadow-2xl flex flex-col",
              className
            )}
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-6 pb-4 flex items-center justify-between border-b border-border">
                <h2 className="text-xl font-bold font-sans tracking-tight">{title}</h2>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
                  <XIcon className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            )}
            {!title && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="absolute top-4 right-4 rounded-full h-8 w-8 z-10 bg-background/50 backdrop-blur-md border border-border"
              >
                <XIcon className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </Button>
            )}

            {/* Content area with scrolling if needed */}
            <div className="px-6 py-4 overflow-y-auto overscroll-contain flex-1">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
