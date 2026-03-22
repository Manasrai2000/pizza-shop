'use client'

import Link from 'next/link'
import { ShoppingCart, Menu as MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { useCartStore } from '@/lib/store/cart'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const totalItems = useCartStore((state) => state.totalItems())
  const totalPrice = useCartStore((state) => state.totalPrice())
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)

  useEffect(() => {
    // Defer state update to satisfy linter and avoid synchronous cascading renders
    const timer = setTimeout(() => setIsMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (pathname.startsWith('/admin')) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight hover:text-primary transition-colors">
          <span className="text-2xl">🍕</span> PizzaExpert
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/track-order" className="transition-colors hover:text-primary text-foreground/60">
            Track Order
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="relative h-10 w-10 rounded-full">
                <ShoppingCart className="h-5 w-5" />
                {isMounted && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Open cart</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
              <SheetHeader className="px-1">
                <SheetTitle>Your Cart {isMounted && totalItems > 0 && `(${totalItems})`}</SheetTitle>
                <SheetDescription>
                  Review your items and proceed to checkout.
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-6 pr-6">
                {!isMounted || items.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-2 text-center text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 opacity-50" />
                    <p className="text-lg font-medium">Your cart is empty</p>
                    <p className="text-sm">Looks like you haven&apos;t added anything yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 shadow-sm">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start justify-between space-x-4 border-b pb-4">
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold line-clamp-1">{item.name}</h4>
                          <div className="text-sm text-muted-foreground">
                            {item.variantName}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="font-semibold whitespace-nowrap">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isMounted && items.length > 0 && (
                <div className="pr-6 pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-xl">₹{totalPrice.toFixed(2)}</span>
                  </div>
                  <Link href="/checkout" passHref>
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              )}
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-8 py-8">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                  <span className="text-2xl">🍕</span> PizzaExpert
                </Link>
                <nav className="flex flex-col gap-4 text-lg font-medium">
                  <Link href="/track-order" className="transition-colors hover:text-primary">
                    Track Order
                  </Link>
                  <Link href="/admin" className="transition-colors hover:text-primary text-muted-foreground">
                    Admin Login
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
