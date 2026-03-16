'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Volume2, VolumeX } from 'lucide-react'
import { toast } from 'sonner'
import { updateOrderStatus } from '@/app/actions/orders'

type Order = {
  id: string
  customer_name: string
  phone: string
  address: string
  notes: string | null
  status: string
  total_amount: number
  created_at: string
}

const statusColors: Record<string, string> = {
  'Pending': 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  'Preparing': 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  'Ready': 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  'Completed': 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
}

const statuses = ['Pending', 'Preparing', 'Ready', 'Completed']

export function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const supabase = createClient()
  
  // Create an audio instance for the alert sound
  // Note: We use a simple base64 beep sound to avoid needing external assets
  const audioContext = useRef<AudioContext | null>(null)

  const playBeep = () => {
    if (!soundEnabled) return
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const oscillator = audioContext.current.createOscillator()
      const gainNode = audioContext.current.createGain()
      
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(880, audioContext.current.currentTime) // A5
      
      gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.current.currentTime + 0.5)
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.current.destination)
      
      oscillator.start()
      oscillator.stop(audioContext.current.currentTime + 0.5)
    } catch (e) {
      console.error('Audio play failed', e)
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as Order
            setOrders((prev) => [newOrder, ...prev])
            toast.info("🚨 New Order Received!", {
              description: `Order from ${newOrder.customer_name} for ₹${newOrder.total_amount}`,
            })
            playBeep()
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as Order
            setOrders((prev) => 
              prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
            )
          } else if (payload.eventType === 'DELETE') {
             setOrders((prev) => prev.filter(o => o.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, soundEnabled])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      
      await updateOrderStatus(orderId, newStatus)
      
      toast.success("Status Updated", {
        description: `Order is now ${newStatus}`,
      })
    } catch (e: any) {
      toast.error("Error updating status", {
        description: e.message,
      })
      // Revert optimistic update by refreshing
      window.location.reload()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-2">
           <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
           <span className="text-sm font-medium">Listening for new orders in realtime</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={soundEnabled ? 'text-primary' : 'text-muted-foreground'}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
          {soundEnabled ? 'Alert Sound: ON' : 'Alert Sound: OFF'}
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{order.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(order.created_at).toLocaleTimeString()}</div>
                    <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell className="font-medium">₹{order.total_amount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-none ${statusColors[order.status] || ''}`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {statuses.map((s) => (
                          <DropdownMenuItem 
                            key={s} 
                            onClick={() => handleStatusChange(order.id, s)}
                            className={order.status === s ? 'font-bold bg-muted' : ''}
                          >
                            Mark as {s}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
