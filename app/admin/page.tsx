import { createClient } from '@/lib/supabase/server'
import { SummaryStrip } from '@/components/admin/dashboard/summary-strip'
import { MetricsCards } from '@/components/admin/dashboard/metrics-cards'
import { RevenueChart } from '@/components/admin/dashboard/revenue-chart'
import { TopItems } from '@/components/admin/dashboard/top-items'
import { QuickActions } from '@/components/admin/dashboard/quick-actions'
import { RecentOrdersTable } from '@/components/admin/dashboard/recent-orders-table'

export const revalidate = 0

interface Order {
  created_at: string
  total_amount: number
  status: string
}

// Helper to group orders by day for chart
function processChartData(orders: Order[]) {
  const dailyRevenue: Record<string, number> = {}
  
  // Get last 7 days including today
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  }).reverse()

  // Initialize with 0
  last7Days.forEach(day => dailyRevenue[day] = 0)
  
  if (orders && orders.length > 0) {
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short' })
      if (dailyRevenue[date] !== undefined) {
        dailyRevenue[date] += (order.total_amount || 0)
      }
    })
  }
  
  return last7Days.map(date => ({
    name: date,
    revenue: dailyRevenue[date]
  }))
}

// Helper to calculate top selling items
function processTopItems(orderItems: any[]) {
  const itemMap: Record<string, { name: string, orders: number }> = {}
  
  orderItems.forEach(item => {
    const id = item.menu_item_id
    const name = item.menu_items?.name || 'Unknown Item'
    if (!itemMap[id]) {
      itemMap[id] = { name, orders: 0 }
    }
    itemMap[id].orders += item.quantity
  })
  
  const sortedItems = Object.values(itemMap).sort((a, b) => b.orders - a.orders).slice(0, 5)
  const maxOrders = sortedItems[0]?.orders || 1
  
  return sortedItems.map(item => ({
    name: item.name,
    orders: item.orders,
    percentage: Math.round((item.orders / maxOrders) * 100)
  }))
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('id')

  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*, menu_items(name)')

  const totalOrders = orders?.length || 0
  const totalRevenue = orders?.reduce((acc, order) => acc + (order.total_amount || 0), 0) || 0
  
  // Today's metrics
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrdersList = orders?.filter(o => new Date(o.created_at) >= today) || []
  const todayRevenue = todayOrdersList.reduce((acc, order) => acc + (order.total_amount || 0), 0)
  const todayOrders = todayOrdersList.length
  
  const pendingOrders = orders?.filter(o => o.status === 'Pending').length || 0
  const activeItems = menuItems?.length || 0
  
  const chartData = processChartData(orders || [])
  const topSellingItems = processTopItems(orderItems || [])

  return (
    <div className="flex-1 space-y-4 pb-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-0">
          <h2 className="text-xl font-bold tracking-tighter bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent uppercase">
            Dashboard
          </h2>
          <p className="text-[10px] font-bold text-muted-foreground tracking-tight opacity-70">
            Welcome back. Here is your store overview.
          </p>
        </div>
        
        <SummaryStrip 
          todayRevenue={todayRevenue} 
          todayOrders={todayOrders} 
          pendingOrders={pendingOrders} 
        />
      </div>
      
      <MetricsCards 
        totalRevenue={totalRevenue} 
        totalOrders={totalOrders} 
        activeItems={activeItems} 
        pendingOrders={pendingOrders} 
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mt-4">
        {/* Left Column - Main Content */}
        <div className="flex flex-col gap-4 xl:col-span-8">
          <RevenueChart data={chartData} />
          <RecentOrdersTable orders={orders || []} />
        </div>
        
        {/* Right Column - Side Panels */}
        <div className="flex flex-col gap-4 xl:col-span-4">
          <TopItems data={topSellingItems} />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
