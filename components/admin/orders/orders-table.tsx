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
import { cn } from "@/lib/utils"



const statusColors: Record<string, string> = {
  'Pending': 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
  'Preparing': 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
  'Ready': 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  'Completed': 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
}

const statuses = ['Pending', 'Preparing', 'Ready', 'Completed']

export function OrdersTable({ initialOrders, menuItems }: {
  initialOrders: Order[],
  menuItems: Pick<MenuItem, 'id' | 'name'>[]
}) {
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
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search orders..."
            className="pl-9 h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary rounded-lg text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg border border-border/50 w-fit self-end lg:self-auto">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-background rounded-md border border-border/50">
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Live</span>
          </div>
          <Separator orientation="vertical" className="h-3" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`h-7 px-3 rounded-md transition-all ${soundEnabled ? 'text-primary bg-primary/5 hover:bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5 mr-1.5" /> : <VolumeX className="h-3.5 w-3.5 mr-1.5" />}
            <span className="text-[10px] font-bold">{soundEnabled ? 'ON' : 'OFF'}</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-muted">
          <div className="min-w-[800px] lg:min-w-full">
            <Table>
              <TableHeader className="bg-muted/30">
                <tr className="hover:bg-transparent border-border/50">
                  <th className="w-[80px] h-8 text-[9px] font-black uppercase tracking-widest pl-4 text-left text-muted-foreground/80">ID</th>
                  <th className="h-8 text-[9px] font-black uppercase tracking-widest text-left text-muted-foreground/80">Customer</th>
                  <th className="h-8 text-[9px] font-black uppercase tracking-widest text-center text-muted-foreground/80">Time</th>
                  <th className="h-8 text-[9px] font-black uppercase tracking-widest text-center text-muted-foreground/80">Total</th>
                  <th className="h-8 text-[9px] font-black uppercase tracking-widest text-center text-muted-foreground/80">Status</th>
                  <th className="h-8 text-[9px] font-black uppercase tracking-widest text-right pr-4 text-muted-foreground/80">Actions</th>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-medium italic">
                      No orders found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} className="group hover:bg-muted/30 transition-all border-border/50">
                      <td className="font-bold text-primary font-mono text-[10px] pl-4 py-1.5 text-left uppercase">
                        <span className="opacity-40">#</span>{order.id.slice(-4)}
                      </td>
                      <td className="py-1.5 text-left">
                        <div className="font-bold text-xs tracking-tight">{order.customer_name}</div>
                        <div className="text-[9px] font-bold text-muted-foreground tracking-wide">{order.phone}</div>
                      </td>
                      <td className="text-center py-1.5">
                        <div className="text-[10px] font-bold tracking-tight">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="text-center py-1.5">
                         <span className="font-bold text-xs tracking-tighter">₹{order.total_amount?.toLocaleString('en-IN') || '0.00'}</span>
                      </td>
                      <td className="text-center py-1.5">
                        <Badge variant="outline" className={cn("border-none font-black text-[8px] px-1.5 py-0 rounded-full uppercase tracking-widest", statusColors[order.status] || '')}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="text-right pr-4 py-1.5">
                        <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-all">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-7 w-7 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                            onClick={() => {
                              setSelectedOrder(order)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:bg-muted transition-colors">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-36 p-1 rounded-lg border-none shadow-2xl">
                               <div className="px-2 py-1 mb-0.5">
                                  <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Status</p>
                               </div>
                            {statuses.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                onClick={() => handleStatusChange(order.id, s)}
                                className={`rounded-md py-1.5 font-bold text-xs mb-0.5 ${order.status === s ? 'bg-primary/10 text-primary' : 'hover:bg-muted transition-colors'}`}
                              >
                                <div className={`h-1 w-1 rounded-full mr-1.5 ${statusColors[s]?.split(' ')[0] || 'bg-muted'}`} />
                                {s}
                              </DropdownMenuItem>
                            ))}
                            <div className="h-px bg-muted my-1 mx-2" />
                            <DropdownMenuItem
                              onClick={() => setSelectedOrder(order)}
                              className="rounded-md py-1.5 font-bold text-xs hover:bg-muted transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5 text-primary" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => sendWhatsAppUpdate(order)}
                              className="rounded-md py-1.5 font-bold text-xs text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
                            >
                              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                              Send WhatsApp
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col rounded-xl border-border/50 shadow-2xl">
          <DialogHeader className="p-4 border-b bg-muted/20">
            <div className="flex justify-between items-center pr-8">
              <div className="space-y-0.5">
                <DialogTitle className="text-lg font-black flex items-center gap-2 tracking-tight">
                  ORDER <span className="text-primary tracking-widest">#{selectedOrder?.id.slice(-4).toUpperCase()}</span>
                </DialogTitle>
                <DialogDescription className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                  {selectedOrder && new Date(selectedOrder.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                </DialogDescription>
              </div>
              <Badge variant="outline" className={cn(
                "border-none font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest",
                statusColors[selectedOrder?.status || ''] || ''
              )}>
                {selectedOrder?.status}
              </Badge>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" /> Recipient
                    </h4>
                    <div className="pl-3 border-l-2 border-primary/20 space-y-0.5">
                      <p className="font-bold text-sm tracking-tight">{selectedOrder?.customer_name}</p>
                      <p className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                        <PhoneIcon className="h-2.5 w-2.5" /> {selectedOrder?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" /> Delivery Area
                    </h4>
                    <div className="pl-3 border-l-2 border-primary/20">
                      <p className="text-[11px] font-bold leading-relaxed text-muted-foreground/90">{selectedOrder?.address}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-primary" /> Details
                    </h4>
                    <div className="pl-3 border-l-2 border-primary/20 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                        <span className="opacity-60">Status History</span>
                        <span className="bg-primary/10 text-primary px-1.5 rounded">{selectedOrder?.status}</span>
                      </div>
                      {selectedOrder?.notes && (
                        <div className="bg-muted/30 p-2 rounded-md border border-dashed border-border/50 mt-2">
                          <p className="text-[10px] italic font-medium leading-tight">&quot;{selectedOrder.notes}&quot;</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Package className="h-3 w-3" /> Order Items
                  </h4>
                  <div className="rounded-xl border border-border/50 overflow-hidden bg-background/50">
                    <div className="divide-y divide-border/50">
                      {selectedOrder?.order_items?.map((item) => {
                        const menuItem = menuItems.find(m => m.id === item.menu_item_id)
                        return (
                          <div key={item.id} className="p-2.5 flex justify-between text-xs items-start hover:bg-muted/30 transition-colors">
                            <div className="flex gap-2.5">
                              <span className="font-black text-primary text-[10px] mt-0.5">{item.quantity}×</span>
                              <div className="space-y-0.5">
                                <p className="font-bold text-[11px] tracking-tight">{menuItem?.name || 'Item'}</p>
                                <p className="text-[9px] font-black uppercase text-muted-foreground/70 tracking-tighter">{item.variant_name}</p>
                              </div>
                            </div>
                            <span className="font-bold text-[11px] tracking-tighter">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="p-3 bg-primary/5 border-t border-border/50">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Grand Total</span>
                        <span className="text-sm font-black text-primary tracking-tighter">₹{selectedOrder?.total_amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-3 border-t bg-muted/20">
            <div className="flex gap-2 w-full justify-end">
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest h-8 rounded-md" onClick={() => setSelectedOrder(null)}>Close</Button>
              <Button
                size="sm"
                onClick={() => selectedOrder && sendWhatsAppUpdate(selectedOrder)}
                className="bg-[#25D366] hover:bg-[#128C7E] text-white text-[10px] font-black uppercase tracking-widest h-8 rounded-md shadow-lg shadow-[#25D366]/20"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-2" />
                Send Status WhatsApp
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
