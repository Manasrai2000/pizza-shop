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
      subtitle: "Lifetime revenue",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      subtitle: "Lifetime orders",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    },
    {
      title: "Active Items",
      value: activeItems,
      icon: Pizza,
      subtitle: "Currently on menu",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: CopyCheck,
      subtitle: "Needs attention",
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((metric, i) => {
        const Icon = metric.icon
        return (
          <Card key={i} className="rounded-xl border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
            <CardContent className="p-3 flex flex-col justify-between h-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{metric.title}</span>
                <div className={cn("h-7 w-7 rounded-md flex items-center justify-center", metric.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", metric.color)} />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold tracking-tighter">{metric.value}</div>
                <div className="flex items-center mt-0.5">
                  <span className="text-[9px] font-bold text-muted-foreground tracking-tight opacity-70">{metric.subtitle}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
