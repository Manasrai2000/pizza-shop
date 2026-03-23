import { cn } from "@/lib/utils"

interface SummaryStripProps {
  todayRevenue: number
  todayOrders: number
  pendingOrders: number
}

export function SummaryStrip({ todayRevenue, todayOrders, pendingOrders }: SummaryStripProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-muted/40 backdrop-blur-sm rounded-lg px-3 py-1 border border-border/50 w-fit">
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 bg-primary rounded-full animate-pulse" />
        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/80">Stats</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="h-3 w-px bg-border/50 hidden sm:block" />
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Rev</span>
            <span className="text-[11px] font-bold tracking-tighter">₹{todayRevenue.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Ord</span>
            <span className="text-[11px] font-bold tracking-tighter">{todayOrders}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Pen</span>
            <span className={cn("text-[11px] font-bold tracking-tighter", pendingOrders > 0 ? "text-orange-500" : "")}>
              {pendingOrders}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
