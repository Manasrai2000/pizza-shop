'use client'

import Link from 'next/link'
import { ShoppingCart, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/store/cart'
import { useEffect, useState } from 'react'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'

export function RestaurantNavbar() {
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((state) => state.totalItems())

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:text-primary transition-colors">
          <span className="text-xl">🍕</span> BiteExpress
        </Link>

        <div className="flex items-center gap-3">
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <ShoppingCart className="h-5 w-5" />
              {mounted && totalItems > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px] font-bold"
                >
                  {totalItems}
                </Badge>
              )}
              <span className="sr-only">Open cart</span>
            </Button>
          </SheetTrigger>

          <Button variant="outline" size="sm" className="h-9 gap-2 px-3">
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
