import { createClient } from '@/lib/supabase/server'
import { OrdersTable } from '@/components/admin/orders/orders-table'

export const revalidate = 0

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="p-8 pb-4">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Orders Management</h2>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
           Failed to load orders: {error.message}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h2 className="text-3xl font-bold tracking-tight">Orders Management</h2>
      </div>
      
      <OrdersTable initialOrders={orders || []} />
    </div>
  )
}
