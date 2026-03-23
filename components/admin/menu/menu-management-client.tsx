'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react'
import { MenuItem, Category } from '@/lib/types'
import { MenuItemDialog } from './menu-item-dialog'
import { deleteMenuItem } from '@/lib/actions/menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface MenuManagementClientProps {
  initialItems: MenuItem[]
  categories: Category[]
  salesData: Record<string, number>
}

export function MenuManagementClient({ initialItems, categories, salesData }: MenuManagementClientProps) {
  const [items, setItems] = useState(initialItems)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteMenuItem(id)
        setItems(items.filter(item => item.id !== id))
        toast.success('Item deleted successfully')
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred."
        toast.error('Failed to delete item: ' + message)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }} className="rounded-lg h-9 px-4 font-bold transition-all hover:bg-primary/90 active:scale-95 text-xs">
          <Plus className="mr-1.5 h-4 w-4" /> Add Item
        </Button>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
          <Table className="min-w-[800px]">
            <TableHeader className="bg-muted/30">
              <tr className="hover:bg-transparent border-border/50">
                <th className="w-[200px] h-8 text-[9px] font-black uppercase tracking-widest pl-4 text-muted-foreground/80 text-left">Item</th>
                <th className="h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 text-left">Category</th>
                <th className="h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 text-left">Props</th>
                <th className="h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 text-left">Variants</th>
                <th className="text-right h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80">Sales</th>
                <th className="text-right h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground/80 pr-4">Actions</th>
              </tr>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-medium italic">
                    No menu items found. Click &quot;Add New Item&quot; to get started.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-muted/30 transition-all border-border/50">
                    <td className="pl-4 py-1.5 text-left">
                      <div className="flex flex-col">
                        <span className="font-bold text-xs tracking-tight group-hover:text-primary transition-colors">{item.name}</span>
                        <span className="text-[9px] font-bold text-muted-foreground line-clamp-1 tracking-tight">{item.description}</span>
                        {item.prep_time && (
                          <span className="text-[9px] text-primary font-bold mt-0.5 uppercase tracking-widest flex items-center gap-1">
                            {item.prep_time}m
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5 text-left">
                      <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-muted/50 border-none px-1.5 py-0 rounded-full">
                        {categories.find(c => c.id === item.category_id)?.name || 'Unknown'}
                      </Badge>
                    </td>
                    <td className="py-1.5 text-left">
                      <div className="flex flex-wrap gap-1">
                        {item.is_veg ? (
                          <div className="h-2 w-2 rounded-full bg-green-500" title="Veg" />
                        ) : (
                          <div className="h-2 w-2 rounded-full bg-red-500" title="Non-Veg" />
                        )}
                        {item.is_bestseller && (
                          <Badge className="bg-orange-500/10 text-orange-500 h-4 text-[8px] uppercase font-black tracking-widest border-none px-1.5 rounded-full">Hot</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5 text-left text-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {item.menu_variants?.map((v: any) => (
                          <Badge key={v.id} variant="outline" className="text-[9px] font-bold tracking-tighter bg-background/50 border-border/50 rounded-md px-1.5 py-0">
                            {v.variant_name[0]}: ₹{v.price}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="text-right py-1.5">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold flex items-center gap-1 tracking-tighter">
                          {salesData[item.id] || 0}
                        </span>
                      </div>
                    </td>
                    <td className="text-right pr-4 py-1.5">
                      <div className="flex justify-end gap-1 opacity-70 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-blue-500 hover:bg-blue-500/10 transition-colors" onClick={() => handleEdit(item)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-destructive hover:bg-destructive/10 transition-colors" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <MenuItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        item={editingItem || undefined}
        categories={categories}
        onSuccess={(newItem: MenuItem) => {
          if (editingItem) {
            setItems(items.map(i => i.id === newItem.id ? newItem : i))
          } else {
            setItems([newItem, ...items])
          }
          setIsDialogOpen(false)
        }}
      />
    </div>
  )
}
