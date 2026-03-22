'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Volume2, VolumeX, MessageSquare, Search, Eye, PhoneIcon, MapPin, Package } from 'lucide-react'
import { toast } from 'sonner'
import { updateOrderStatus } from '@/app/actions/orders'
import { Order, MenuItem } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'



const statusColors: Record<string, string> = {
  'Pending': 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  'Preparing': 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  'Ready': 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  'Completed': 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
}

const statuses = ['Pending', 'Preparing', 'Ready', 'Completed']

export function OrdersTable({ initialOrders, menuItems }: { initialOrders: Order[], menuItems: MenuItem[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const supabase = createClient()

  // Create an audio instance for the alert sound
  // Note: We use a simple base64 beep sound to avoid needing external assets
  const audioContext = useRef<AudioContext | null>(null)

  const playBeep = () => {
    if (!soundEnabled) return
    try {
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, soundEnabled])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // Optimistic update
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

      await updateOrderStatus(orderId, newStatus)

      toast.success("Status Updated", {
        description: `Order is now ${newStatus}`,
      })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred."
      toast.error("Error updating status", {
        description: message,
      })
      // Revert optimistic update by refreshing
      window.location.reload()
    }
  }

  const sendWhatsAppUpdate = (order: Order) => {
    const restaurantName = "PizzaExpert"
    const orderIdShort = order.id
    const itemsSummary = order.order_items?.map(item => {
      const menuItem = menuItems.find(m => m.id === item.menu_item_id)
      return `${item.quantity}x ${menuItem?.name || 'Item'} (${item.variant_name})`
    }).join('\n') || ''

    const message = `*${restaurantName}* Order Update!

Order ID: #${orderIdShort}
Status: *${order.status}*

Items:
${itemsSummary}

Total: ₹${order.total_amount.toFixed(2)}

Thank you for ordering with ${restaurantName}!`

    const encodedMessage = encodeURIComponent(message)
    // Remove any non-digit characters from the phone number
    const cleanPhone = order.phone.replace(/\D/g, '')
    // Add country code if not present (assuming Indian numbers based on ₹, usually starts with 91)
    const phoneWithCode = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone

    const whatsappUrl = `https://wa.me/${phoneWithCode}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase()
    const shortId = `#${order.id.slice(-4)}`
    return (
      order.customer_name.toLowerCase().includes(searchLower) ||
      order.phone.includes(searchLower) ||
      order.id.toLowerCase().includes(searchLower) ||
      shortId.toLowerCase().includes(searchLower)
    )
  })



  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by name, phone, or ID..."
            className="pl-9 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 bg-muted/50 p-2 rounded-lg border w-full md:w-auto">
          <div className="flex items-center gap-2 px-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Live</span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`h-8 hover:bg-background ${soundEnabled ? 'text-primary font-bold' : 'text-muted-foreground'}`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
            {soundEnabled ? 'Sound: ON' : 'Sound: OFF'}
          </Button>
        </div>
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
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-bold text-primary font-mono cursor-help" title={order.id}>
                    #{order.id.slice(-4).toUpperCase()}
                  </TableCell>
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
                            {s}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuItem
                          onClick={() => setSelectedOrder(order)}
                          className="border-t mt-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => sendWhatsAppUpdate(order)}
                          className="text-primary font-medium"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Send Update
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex justify-between items-center pr-8">
              <div>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  Order <span className="text-primary">#{selectedOrder?.id.slice(-4).toUpperCase()}</span>
                </DialogTitle>
                <DialogDescription>
                  Placed on {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}
                </DialogDescription>
              </div>
              <Badge variant="outline" className={`text-sm px-3 py-1 border-none ${selectedOrder ? statusColors[selectedOrder.status] : ''}`}>
                {selectedOrder?.status}
              </Badge>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                      <Package className="h-4 w-4" /> RECIPIENT
                    </h4>
                    <div className="space-y-1">
                      <p className="font-bold text-lg">{selectedOrder?.customer_name}</p>
                      <p className="text-sm flex items-center gap-2 text-muted-foreground">
                        <PhoneIcon className="h-3 w-3" /> {selectedOrder?.phone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4" /> DELIVERY ADDRESS
                    </h4>
                    <p className="text-sm leading-relaxed">{selectedOrder?.address}</p>
                  </div>

                  {selectedOrder?.notes && (
                    <div className="bg-muted/30 p-3 rounded-md border border-dashed">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase mb-1">Kitchen Notes</h4>
                      <p className="text-sm italic">&quot;{selectedOrder.notes}&quot;</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4" /> ORDER ITEMS
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder?.order_items?.map((item) => {
                      const menuItem = menuItems.find(m => m.id === item.menu_item_id)
                      return (
                        <div key={item.id} className="flex justify-between text-sm items-start">
                          <div className="flex gap-3">
                            <span className="font-bold text-primary">{item.quantity}×</span>
                            <div>
                              <p className="font-semibold">{menuItem?.name || 'Item'}</p>
                              <p className="text-xs text-muted-foreground">{item.variant_name}</p>
                            </div>
                          </div>
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      )
                    })}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg pt-2">
                      <span>Total Amount</span>
                      <span className="text-primary">₹{selectedOrder?.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-4 border-t bg-muted/20">
            <div className="flex gap-2 w-full justify-end">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>Close</Button>
              <Button
                onClick={() => selectedOrder && sendWhatsAppUpdate(selectedOrder)}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Status WhatsApp
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
