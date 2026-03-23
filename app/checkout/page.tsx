'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { submitOrder } from '@/app/actions/checkout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import {  Loader2 } from 'lucide-react'
import { validatePhoneNumber } from '@/lib/utils/phone-validation'

export default function CheckoutPage() {
  const router = useRouter()
  
  const items = useCartStore((state) => state.items)
  const totalPrice = useCartStore((state) => state.totalPrice())
  const clearCart = useCartStore((state) => state.clearCart)
  
  const [isMounted, setIsMounted] = useState(false)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    // Defer state update to satisfy linter and avoid synchronous cascading renders
    const timer = setTimeout(() => setIsMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (!isMounted) return null

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some items from the menu before checking out.</p>
        <Button onClick={() => router.push('/#menu')}>Browse Menu</Button>
      </div>
    )
  }

  async function clientAction(formData: FormData) {
    setIsPending(true)
    
    // Validate phone number using Abstract API
    let phone = formData.get('phone') as string
    if (phone) {
      // Prepend +91 if not already present
      if (!phone.startsWith('+91')) {
        phone = `+91${phone}`
      }
      
      const validationResult = await validatePhoneNumber(phone)
      if (validationResult && !validationResult.phone_validation.is_valid) {
        toast.error("Invalid Phone Number", {
          description: "Please enter a valid active phone number.",
        })
        setIsPending(false)
        return
      }
      
      // Update formData with the full phone number for submission
      formData.set('phone', phone)
    }

    formData.append('cartData', JSON.stringify(items))
    formData.append('totalAmount', totalPrice.toString())
    
    const result = await submitOrder({ success: false }, formData)
    
    if (result.success && result.orderId) {
       clearCart()
       toast.success("Order Placed Successfully! 🎉", {
         description: `Your order #${result.orderId.substring(0,8)} is confirmed.`,
       })
       router.push(`/track-order?id=${result.orderId}`)
    } else {
       toast.error("Error", {
         description: result.error || "Something went wrong.",
       })
    }
    setIsPending(false)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
              <CardDescription>Enter your information to complete the order.</CardDescription>
            </CardHeader>
            <CardContent>
              <form id="checkout-form" action={clientAction} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" required placeholder="John Doe" disabled={isPending}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center h-10 px-3 bg-muted border rounded-md text-sm font-medium text-muted-foreground shrink-0">
                        +91
                      </div>
                      <Input 
                        id="phone" 
                        name="phone" 
                        type="tel" 
                        required 
                        placeholder="7007734039" 
                        disabled={isPending}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea id="address" name="address" required placeholder="123 Main St, Apt 4B, City, Zip" rows={3} disabled={isPending}/>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                  <Textarea id="notes" name="notes" placeholder="Leave at the door, ring bell..." rows={2} disabled={isPending}/>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <span className="font-medium">{item.quantity}x</span> {item.name}
                      <div className="text-muted-foreground text-xs">{item.variantName}</div>
                    </div>
                    <div className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₹40.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                  <span>Total</span>
                  <span>₹{(totalPrice + 40).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                form="checkout-form" 
                className="w-full h-12 text-lg font-semibold" 
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Place Order (Cash on Delivery)'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
