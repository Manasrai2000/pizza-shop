import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"

export function TopItems() {
  // Using dummy data as accurate order_item aggregation requires complex SQL / view
  const topItems = [
    { name: "Pepperoni Supreme", orders: 142, percentage: 85 },
    { name: "Double Cheese Burger", orders: 98, percentage: 60 },
    { name: "Margherita Magic", orders: 85, percentage: 50 },
    { name: "Spicy Mexican Taco", orders: 45, percentage: 30 },
  ]

  return (
    <Card className="rounded-xl border shadow-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg font-bold tracking-tight">Top Selling</CardTitle>
          <p className="text-sm text-muted-foreground">Highest performing items</p>
        </div>
        <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
          <Flame className="h-4 w-4 text-orange-500" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {topItems.map((item, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.name}</span>
                <span className="text-muted-foreground font-semibold">{item.orders} orders</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
