'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface ChartData {
  name: string
  revenue: number
}

export function RevenueChart({ data }: { data: ChartData[] }) {
  // Use mock data if not enough real data for a good chart
  const defaultData = [
    { name: 'Mon', revenue: 1240 },
    { name: 'Tue', revenue: 2100 },
    { name: 'Wed', revenue: 1800 },
    { name: 'Thu', revenue: 2400 },
    { name: 'Fri', revenue: 3200 },
    { name: 'Sat', revenue: 4100 },
    { name: 'Sun', revenue: 3800 },
  ]

  const chartData = data && data.length > 3 ? data : defaultData

  return (
    <Card className="rounded-xl border shadow-sm col-span-1 lg:col-span-8 flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold tracking-tight">Revenue Overview</CardTitle>
        <p className="text-sm text-muted-foreground">Last 7 days performance</p>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FB923C" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#FB923C" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
              tickFormatter={(value) => `₹${value}`}
              width={60}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
              formatter={(value: number | string | readonly (number | string)[] | undefined) => [
                value !== undefined ? `₹${Number(value).toLocaleString('en-IN')}` : '₹0', 
                'Revenue'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#F97316" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
