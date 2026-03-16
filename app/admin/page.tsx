import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IndianRupee, ShoppingBag, Pizza, CopyCheck } from 'lucide-react'

export const revalidate = 0

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id')

  const totalOrders = orders?.length || 0
  const totalRevenue = orders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0
  const pendingOrders = orders?.filter(o => o.status === 'Pending').length || 0
  const completedOrders = orders?.filter(o => o.status === 'Completed').length || 0
  const totalItems = menuItems?.length || 0

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Pizza className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Items on the menu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Processing</CardTitle>
            <CopyCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
               {completedOrders} completed
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-8">
         <Card className="col-span-4">
           <CardHeader>
             <CardTitle>Recent Orders</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-8">
                {orders?.slice(0, 5).map((order) => (
                   <div key={order.id} className="flex items-center">
                     <div className="space-y-1">
                       <p className="text-sm font-medium leading-none">{order.customer_name}</p>
                       <p className="text-sm text-muted-foreground">
                         {new Date(order.created_at).toLocaleDateString()} - {order.status}
                       </p>
                     </div>
                     <div className="ml-auto font-medium">
                       +${order.total_amount.toFixed(2)}
                     </div>
                   </div>
                ))}
                {(!orders || orders.length === 0) && (
                   <p className="text-sm text-muted-foreground">No recent orders found.</p>
                )}
             </div>
           </CardContent>
         </Card>
      </div>
    </div>
  )
}
