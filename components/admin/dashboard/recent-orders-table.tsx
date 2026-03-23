import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Order {
  id: string
  customer_name: string
  created_at: string
  total_amount: number
  status: string
}

interface RecentOrdersTableProps {
  orders: Order[]
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const displayOrders = orders?.slice(0, 5) || []

  return (
    <Card className="rounded-xl border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden border-none flex flex-col">
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center justify-between">
           <div className="space-y-0">
              <CardTitle className="text-base font-bold tracking-tighter uppercase leading-none">Recent Orders</CardTitle>
              <p className="text-[8px] font-black tracking-widest text-muted-foreground/60 uppercase">Latest Activity</p>
           </div>
           <div className="flex -space-x-2">
              {displayOrders.slice(0, 3).map((_, i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black uppercase text-muted-foreground">
                   {String.fromCharCode(65 + i)}
                </div>
              ))}
           </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-muted/30">
              <tr className="border-b border-border/50">
                <th className="px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/80">ID</th>
                <th className="px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/80">Customer</th>
                <th className="px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/80">Time</th>
                <th className="px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/80 text-right">Amount</th>
                <th className="px-4 py-1.5 text-[8px] font-black uppercase tracking-widest text-muted-foreground/80 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-8 text-center text-sm font-bold text-muted-foreground italic">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                displayOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-muted/40 transition-all duration-200">
                    <td className="px-4 py-1 font-bold text-primary text-[10px] font-mono tracking-tighter">
                      <span className="opacity-30">#</span>{order.id.slice(-4).toUpperCase()}
                    </td>
                    <td className="px-4 py-1">
                       <p className="text-xs font-bold tracking-tight group-hover:text-primary transition-colors">{order.customer_name}</p>
                    </td>
                    <td className="px-4 py-1">
                       <p className="text-[10px] font-bold text-muted-foreground tracking-tight">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </p>
                    </td>
                    <td className="px-4 py-1 text-right">
                       <span className="text-xs font-bold tracking-tighter">₹{order.total_amount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-4 py-1 text-right">
                       <Badge variant="outline" className={cn(
                         "border-none font-black text-[8px] px-1.5 py-0 rounded-full",
                         order.status === 'Pending' ? "bg-orange-500/10 text-orange-500" : "bg-emerald-500/10 text-emerald-500"
                       )}>
                         {order.status}
                       </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
