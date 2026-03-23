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

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id, name')

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
    <div className="flex-1 space-y-10 pb-10">
      <div className="space-y-1">
        <h2 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent italic uppercase">
          Orders
        </h2>
        <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/60 uppercase">
          Manage and track customer transactions
        </p>
      </div>
      
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <OrdersTable 
          initialOrders={orders || []} 
          menuItems={menuItems || []} 
        />
      </div>
    </div>
  )
}
