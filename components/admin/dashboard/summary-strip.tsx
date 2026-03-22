import { IndianRupee, Store } from "lucide-react"

interface SummaryStripProps {
  todayRevenue: number
  todayOrders: number
  pendingOrders: number
}

export function SummaryStrip({ todayRevenue, todayOrders, pendingOrders }: SummaryStripProps) {
  return (
    <div className="flex items-center gap-4 bg-muted/40 rounded-xl px-5 py-3 border text-sm font-medium">
      <div className="flex items-center gap-2 text-muted-foreground mr-6">
        <Store className="h-4 w-4" />
        <span className="text-foreground tracking-tight">Today&#39;s Overview:</span>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5"><IndianRupee className="h-3.5 w-3.5 text-primary" />{todayRevenue.toLocaleString('en-IN')}</span>
        <span className="text-muted-foreground/30">•</span>
        <span>{todayOrders} Orders</span>
        <span className="text-muted-foreground/30">•</span>
        <span className={pendingOrders > 0 ? "text-amber-500 font-bold" : ""}>
          {pendingOrders} Pending
        </span>
      </div>
    </div>
  )
}
