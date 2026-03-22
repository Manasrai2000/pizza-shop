'use client'

import { ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/lib/store/cart'
import { useEffect, useState } from 'react'
import { Sheet, SheetTrigger } from '@/components/ui/sheet'
import { CartDrawer } from './cart-drawer'

export function CartSummaryBar() {
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((state) => state.totalItems())
  const totalPrice = useCartStore((state) => state.totalPrice())

  useEffect(() => {
    // Defer state update to satisfy linter and avoid synchronous cascading renders
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted || totalItems === 0) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-8 md:bottom-8">
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            className="w-full md:w-auto h-14 px-6 rounded-2xl shadow-2xl shadow-primary/40 bg-primary text-primary-foreground flex items-center justify-between gap-4 group hover:scale-[1.02] transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold opacity-80 leading-none mb-1">{totalItems} Items Added</p>
                <p className="text-sm font-extrabold leading-none">View Cart</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <p className="text-lg font-black">₹{totalPrice}</p>
          </Button>
        </SheetTrigger>
        <CartDrawer />
      </Sheet>
    </div>
  )
}
