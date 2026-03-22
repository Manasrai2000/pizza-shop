'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Clock, MapPin, Phone, ChefHat } from 'lucide-react'

type OrderItem = {
  id: string
  menu_item_id: string
  variant_name: string
  price: number
  quantity: number
}

type Order = {
  id: string
  customer_name: string
  phone: string
  address: string
  notes: string | null
  status: string
  total_amount: number
  created_at: string
  order_items: OrderItem[]
}

type MenuItem = {
  id: string
  name: string
}

export function OrderTracking({ initialOrder, menuItems }: { initialOrder: Order, menuItems: MenuItem[] }) {
  const [order, setOrder] = useState<Order>(initialOrder)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          const updatedOrder = payload.new as Order
          setOrder(prev => ({
            ...prev,
            ...updatedOrder
          }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [order.id, supabase])

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-500/10 text-yellow-500',
    'Preparing': 'bg-orange-500/10 text-orange-500',
    'Ready': 'bg-blue-500/10 text-blue-500',
    'Completed': 'bg-green-500/10 text-green-500',
    'Cancelled': 'bg-destructive/10 text-destructive',
  }

  const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    'Pending': Clock,
    'Preparing': ChefHat,
    'Ready': CheckCircle2,
    'Completed': MapPin,
    'Cancelled': AlertCircle
  }

  const StatusIcon = statusIcons[order.status] || Clock

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Order <span className="text-primary">#{order.id.slice(-4).toUpperCase()}</span></h1>
              <p className="text-muted-foreground mt-1 text-sm font-medium">Tracking in realtime</p>
            </div>
            <Badge variant="outline" className={`text-base px-4 py-1.5 border-none ${statusColors[order.status] || ''}`}>
              <StatusIcon className="mr-2 h-4 w-4" />
              {order.status}
            </Badge>
          </div>
          
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary">Need an update?</h3>
                <p className="text-sm text-foreground/70">Call our store for quick help.</p>
              </div>
              <Button asChild variant="default" className="rounded-full px-6">
                <a href="tel:910000000000">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Store
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-muted-foreground text-sm">{order.address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm">{order.phone}</p>
            </div>
            {order.notes && (
              <div className="pt-4 mt-4 border-t">
                <p className="text-sm font-medium">Delivery Notes:</p>
                <p className="text-sm text-muted-foreground italic mt-1">&quot;{order.notes}&quot;</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
          <CardDescription>{order.order_items?.length || 0} items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.order_items?.map((item) => {
              const menuItem = menuItems.find(m => m.id === item.menu_item_id)
              return (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex gap-3">
                    <span className="font-bold flex-shrink-0">{item.quantity}x</span>
                    <div>
                      <span className="font-medium">{menuItem?.name || `Item #${item.menu_item_id.slice(0, 4)}`}</span>
                      <div className="text-muted-foreground text-xs mt-0.5">{item.variant_name}</div>
                    </div>
                  </div>
                  <span className="font-medium whitespace-nowrap pl-4">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              )
            })}
            
            <div className="border-t pt-4 mt-6 space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Subtotal</span>
                 <span>₹{order.total_amount.toFixed(2)}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-muted-foreground">Delivery Fee</span>
                 <span>₹40.00</span>
               </div>
               <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t">
                 <span>Total</span>
                 <span>₹{(Number(order.total_amount) + 40).toFixed(2)}</span>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
