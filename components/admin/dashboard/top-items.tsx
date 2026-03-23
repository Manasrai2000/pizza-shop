import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Flame } from "lucide-react"

interface TopItem {
  name: string
  orders: number
  percentage: number
}

export function TopItems({ data }: { data: TopItem[] }) {
  const topItems = data && data.length > 0 ? data : []

  return (
    <Card className="rounded-xl border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden border-none flex flex-col">
      <CardHeader className="p-3 pb-1 flex flex-row items-center justify-between">
        <div className="space-y-0">
          <CardTitle className="text-base font-bold tracking-tighter uppercase leading-none">Top Selling</CardTitle>
          <p className="text-[8px] font-black tracking-widest text-muted-foreground/60 uppercase">Performance Leaders</p>
        </div>
        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
          <Flame className="h-3.5 w-3.5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="space-y-3">
          {topItems.map((item, i) => (
            <div key={i} className="space-y-1.5 group">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-tight group-hover:text-primary transition-colors">{item.name}</span>
                <span className="text-[8px] font-bold text-muted-foreground/60 tracking-wider uppercase bg-muted/50 px-1.5 py-0 rounded-full">{item.orders} orders</span>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
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
