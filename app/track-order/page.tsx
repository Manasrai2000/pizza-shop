import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle2, Clock, MapPin, Phone, ChefHat } from 'lucide-react'

export const revalidate = 0

export default async function TrackOrderPage({ 
  searchParams 
}: { 
  searchParams: { id?: string } 
}) {
  const orderId = searchParams.id

  if (!orderId) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">Track Order</h1>
        <p className="text-muted-foreground mb-8">Enter your order ID below to track its status.</p>
        <form method="GET" action="/track-order" className="flex gap-2">
          <input 
            type="text" 
            name="id" 
            placeholder="e.g. 123e4567-e89b-12d3..." 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          />
          <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Track
          </button>
        </form>
      </div>
    )
  }

  const supabase = await createClient()

  // Fetch the order and its items
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-destructive">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Order Not Found</h1>
        <p className="mt-2 text-muted-foreground">We couldn't track order with ID: {orderId}</p>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    'Preparing': 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
    'Ready': 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    'Completed': 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    'Cancelled': 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  }

  const statusIcons: Record<string, any> = {
    'Pending': Clock,
    'Preparing': ChefHat,
    'Ready': CheckCircle2,
    'Completed': MapPin,
  }

  const StatusIcon = statusIcons[order.status] || Clock

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b pb-8">
        <div>
          <h1 className="text-3xl font-bold">Order Tracking</h1>
          <p className="text-muted-foreground mt-1">ID: <span className="font-mono text-xs">{order.id}</span></p>
          <p className="text-sm text-muted-foreground mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <Badge variant="outline" className={`text-base px-4 py-1.5 border-none ${statusColors[order.status] || ''}`}>
          <StatusIcon className="mr-2 h-4 w-4" />
          {order.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
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
                  <p className="text-sm text-muted-foreground italic mt-1">"{order.notes}"</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
               <h3 className="font-semibold mb-2 text-primary">Need Help?</h3>
               <p className="text-sm text-foreground/80 mb-4">Contact our support team for any issues with your order.</p>
               <button className="text-primary font-medium hover:underline text-sm">(555) 123-4567</button>
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
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex gap-3">
                    <span className="font-bold flex-shrink-0">{item.quantity}x</span>
                    <div>
{/* Since we didn't save the item name in order_items (just menu_item_id), 
    we would normally do a JOIN or we could just show the variant.
    Let's display the variant and price. In a real app we'd fetch the name too. */}
                      <span className="font-medium">Menu Item #{item.menu_item_id.substring(0,4)}</span>
                      <div className="text-muted-foreground text-xs mt-0.5">{item.variant_name}</div>
                    </div>
                  </div>
                  <span className="font-medium whitespace-nowrap pl-4">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
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
                   <span>₹{(order.total_amount + 40).toFixed(2)}</span>
                 </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
