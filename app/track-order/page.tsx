import { createClient } from '@/lib/supabase/server'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { OrderTracking } from '@/components/order/order-tracking'
import Link from 'next/link'

export const revalidate = 0

export default async function TrackOrderPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id?: string }> 
}) {
  const params = await searchParams
  const rawId = params.id?.trim() || ''
  const cleanId = rawId.replace('#', '')

  if (!rawId) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-md">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Menu
        </Link>
        <h1 className="text-3xl font-bold mb-4 tracking-tight">Track Order</h1>
        <p className="text-muted-foreground mb-8 text-sm">Enter your Order ID (e.g. #2516 or full ID) below.</p>
        <form method="GET" action="/track-order" className="flex gap-2">
          <input 
            type="text" 
            name="id" 
            placeholder="e.g. #2516" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
            autoComplete="off"
          />
          <button type="submit" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Track
          </button>
        </form>
      </div>
    )
  }

  const supabase = await createClient()

  // 1. Try fetching by full UUID if it looks like one
  let orderData = null
  let orderError = null

  if (cleanId.length === 36) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items (*)')
      .eq('id', cleanId)
      .single()
    orderData = data
    orderError = error
  } else if (cleanId.length >= 4 && cleanId.length <= 6) {
    // 2. Try fetching by Short ID
    // Since we can't easily do endsworth on UUID in Supabase client, 
    // we fetch recent orders and filter in memory for the simple case
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*, order_items (*)')
      .order('created_at', { ascending: false })
      .limit(100)
    
    orderData = recentOrders?.find(o => o.id.endsWith(cleanId.toLowerCase()))
  }

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, name')

  if (orderError || !orderData) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-destructive">
        <AlertCircle className="h-12 w-12 mx-auto mb-4" />
        <h1 className="text-2xl font-bold tracking-tight">Order Not Found</h1>
        <p className="mt-2 text-muted-foreground text-sm">We couldn't find an order with ID: <span className="font-bold">{rawId}</span></p>
        <p className="mt-8">
          <Link href="/track-order" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
             <ArrowLeft className="h-4 w-4" /> Try another ID
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Menu
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4 border-b pb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order <span className="text-primary">#{orderData.id.slice(-4).toUpperCase()}</span></h1>
          <p className="text-muted-foreground mt-1">Full ID: <span className="font-mono text-[10px] opacity-70">{orderData.id}</span></p>
          <p className="text-sm text-muted-foreground mt-1 text-xs">Placed on {new Date(orderData.created_at).toLocaleString()}</p>
        </div>
      </div>

      <OrderTracking initialOrder={orderData} menuItems={menuItems || []} />
    </div>
  )
}
