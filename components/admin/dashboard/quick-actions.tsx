'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, ListOrdered, Settings2, BellRing } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Actions Card */}
      <Card className="rounded-lg border shadow-none flex-1">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-base font-bold tracking-tighter uppercase">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-3 flex flex-col gap-1.5">
          <Button 
            className="w-full justify-start h-8 rounded-md font-bold text-[10px] py-0" 
            variant="default"
            onClick={() => router.push('/admin/menu')}
          >
            <PlusCircle className="mr-2 h-3 w-3" />
            Add New Item
          </Button>
          <Button 
            className="w-full justify-start h-8 rounded-md font-bold text-[10px] bg-muted/50 text-foreground hover:bg-muted border-none py-0" 
            variant="outline"
            onClick={() => router.push('/admin/orders')}
          >
            <ListOrdered className="mr-2 h-3 w-3 text-primary" />
            View Orders
          </Button>
          <Button 
            className="w-full justify-start h-8 rounded-md font-bold text-[10px] bg-muted/50 text-foreground hover:bg-muted border-none py-0" 
            variant="outline"
            onClick={() => router.push('/admin/menu')}
          >
            <Settings2 className="mr-2 h-3 w-3 text-primary" />
            Manage Menu
          </Button>
        </CardContent>
      </Card>

      {/* Alerts / Notifications Card */}
      <Card className="rounded-lg border shadow-none bg-orange-500/5 border-orange-500/10">
        <CardContent className="p-2.5 flex gap-2">
          <div className="mt-0.5">
            <BellRing className="h-3.5 w-3.5 text-orange-500" />
          </div>
          <div>
            <h4 className="font-bold text-[12px] uppercase tracking-wider text-foreground">Alert</h4>
            <p className="text-[10px] font-bold text-muted-foreground mt-0 leading-tight">This dashboard is designed by <a href="https://github.com/Manasrai2000" className="text-primary">Manas rai</a></p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
