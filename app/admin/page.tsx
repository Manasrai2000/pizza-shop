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
  if (!orders || orders.length === 0) return []
  
  const dailyRevenue: Record<string, number> = {}
  
  orders.forEach(order => {
    const date = new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'short' })
    dailyRevenue[date] = (dailyRevenue[date] || 0) + (order.total_amount || 0)
  })
  
  return Object.keys(dailyRevenue).slice(0, 7).map(date => ({
    name: date,
    revenue: dailyRevenue[date]
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

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Welcome back. Here is your store&#39;s performance.</p>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column - Main Content (Spans 8 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          <RevenueChart data={chartData} />
          <RecentOrdersTable orders={orders || []} />
        </div>
        
        {/* Right Column - Side Panels (Spans 4 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <TopItems />
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
