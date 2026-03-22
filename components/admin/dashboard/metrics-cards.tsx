import { Card, CardContent } from "@/components/ui/card"
import { IndianRupee, ShoppingBag, Pizza, CopyCheck, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricsCardsProps {
  totalRevenue: number
  totalOrders: number
  activeItems: number
  pendingOrders: number
}

export function MetricsCards({ totalRevenue, totalOrders, activeItems, pendingOrders }: MetricsCardsProps) {
  const metrics = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      trend: "+12.5%",
      isPositive: true,
      subtitle: "vs last month"
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      trend: "+8.2%",
      isPositive: true,
      subtitle: "vs last month"
    },
    {
      title: "Active Items",
      value: activeItems,
      icon: Pizza,
      trend: "0%",
      isPositive: null,
      subtitle: "currently on menu"
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: CopyCheck,
      trend: pendingOrders > 5 ? "+2" : "-1",
      isPositive: pendingOrders <= 5,
      subtitle: "needs attention"
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, i) => {
        const Icon = metric.icon
        return (
          <Card key={i} className="rounded-xl border shadow-sm">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground tracking-tight">{metric.title}</span>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tight">{metric.value}</div>
                <div className="flex items-center mt-1 gap-2">
                  {metric.isPositive !== null && (
                    <span className={cn(
                      "flex items-center text-xs font-semibold",
                      metric.isPositive ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {metric.isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                      {metric.trend}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{metric.subtitle}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
