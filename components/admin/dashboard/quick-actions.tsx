'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, ListOrdered, Settings2, BellRing } from "lucide-react"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      {/* Quick Actions Card */}
      <Card className="rounded-xl border shadow-sm flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold tracking-tight">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button 
            className="w-full justify-start h-11" 
            variant="default"
            onClick={() => router.push('/admin/menu')}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Item
          </Button>
          <Button 
            className="w-full justify-start h-11 bg-muted/50 text-foreground hover:bg-muted" 
            variant="outline"
            onClick={() => router.push('/admin/orders')}
          >
            <ListOrdered className="mr-2 h-4 w-4 text-primary" />
            View Orders
          </Button>
          <Button 
            className="w-full justify-start h-11 bg-muted/50 text-foreground hover:bg-muted" 
            variant="outline"
            onClick={() => router.push('/admin/menu')}
          >
            <Settings2 className="mr-2 h-4 w-4 text-primary" />
            Manage Menu
          </Button>
        </CardContent>
      </Card>

      {/* Alerts / Notifications Card */}
      <Card className="rounded-xl border shadow-sm bg-orange-500/5 border-orange-500/20">
        <CardContent className="p-4 flex gap-3">
          <div className="mt-0.5">
            <BellRing className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">Needs Attention</h4>
            <p className="text-xs text-muted-foreground mt-1">2 Items are running low on stock. Please update inventory soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
