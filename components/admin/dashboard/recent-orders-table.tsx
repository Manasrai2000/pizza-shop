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
    <Card className="rounded-xl border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold tracking-tight">Recent Orders</CardTitle>
        <p className="text-sm text-muted-foreground">Latest transactions from customers</p>
      </CardHeader>
      <CardContent>
        {displayOrders.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No recent orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-border/50 text-muted-foreground">
                  <th className="font-medium pb-3 pt-1 px-4">Order ID</th>
                  <th className="font-medium pb-3 pt-1 px-4">Customer</th>
                  <th className="font-medium pb-3 pt-1 px-4">Date</th>
                  <th className="font-medium pb-3 pt-1 px-4 text-right">Amount</th>
                  <th className="font-medium pb-3 pt-1 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {displayOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-4 font-mono text-xs text-muted-foreground uppercase">
                      #{order.id.slice(0, 6)}
                    </td>
                    <td className="py-4 px-4 font-medium">
                      {order.customer_name}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">
                      ₹{order.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {order.status === 'Pending' ? (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold shadow-none">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold shadow-none">
                          Completed
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
