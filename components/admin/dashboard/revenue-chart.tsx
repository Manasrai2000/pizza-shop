'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface ChartData {
  name: string
  revenue: number
}

export function RevenueChart({ data }: { data: ChartData[] }) {
  const chartData = data && data.length > 0 ? data : []

  return (
    <Card className="rounded-xl border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col border-none">
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center justify-between">
           <div className="space-y-0">
              <CardTitle className="text-base font-bold tracking-tighter uppercase">Revenue Overview</CardTitle>
              <p className="text-[8px] font-black tracking-widest text-muted-foreground/60 uppercase">Last 7 days performance</p>
           </div>
           <div className="h-1 w-1 bg-primary rounded-full animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-4 flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} 
              dy={15}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} 
              tickFormatter={(value) => `₹${value}`}
              width={80}
            />
            <Tooltip 
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid hsl(var(--border))', 
                backgroundColor: 'hsl(var(--card))',
                boxShadow: 'none',
                padding: '8px'
              }}
              labelStyle={{ fontSize: '9px', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 700, fontSize: '11px' }}
              formatter={(value: number | string | readonly (number | string)[] | undefined) => [
                value !== undefined ? `₹${Number(value).toLocaleString('en-IN')}` : '₹0', 
                'Revenue'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
