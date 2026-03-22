'use client'

import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter 
} from '@/components/ui/sheet'
import { useCartStore } from '@/lib/store/cart'
import { useEffect, useState } from 'react'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import Image from 'next/image'


export function CartDrawer() {
  const [mounted, setMounted] = useState(false)
  const { items, totalPrice, updateQuantity, removeItem } = useCartStore()

  useEffect(() => {
    // Defer state update to satisfy linter and avoid synchronous cascading renders
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null

  const cartTotal = totalPrice()

  return (
    <SheetContent className="flex w-full flex-col pr-0 sm:max-w-md">
      <SheetHeader className="px-6 border-b pb-4">
        <SheetTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Your Cart
        </SheetTitle>
      </SheetHeader>
      
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-2 text-center text-muted-foreground">
            <div className="bg-muted p-4 rounded-full">
              <ShoppingCart className="h-8 w-8 opacity-20" />
            </div>
            <p className="text-lg font-medium">Your cart is empty</p>
            <p className="text-sm">Add some delicious items to get started!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4">
                {item.imageUrl && (
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill
                      className="h-full w-full object-cover" 
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm truncate">{item.name}</h4>
                    <span className="font-bold text-sm ml-2 self-start">₹{item.price * item.quantity}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{item.variantName}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/50">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md hover:bg-background"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md hover:bg-background"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length > 0 && (
        <SheetFooter className="px-6 py-6 border-t bg-background">
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between text-base">
              <span className="font-medium text-muted-foreground">Subtotal</span>
              <span className="font-bold">₹{cartTotal}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-lg">
              <span className="font-bold">Total</span>
              <span className="font-extrabold text-primary text-2xl">₹{cartTotal}</span>
            </div>
            <Link href="/checkout" className="block w-full">
              <Button className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/20" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </SheetFooter>
      )}
    </SheetContent>
  )
}
