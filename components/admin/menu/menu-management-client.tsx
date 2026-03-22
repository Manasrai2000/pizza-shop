'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, TrendingUp } from 'lucide-react'
import { MenuItem, Category } from '@/lib/types'
import { MenuItemDialog } from './menu-item-dialog'
import { deleteMenuItem } from '@/lib/actions/menu'
import { toast } from 'sonner'

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Menu Management</h2>
          <p className="text-muted-foreground">Manage your restaurant offerings and track sales performance.</p>
        </div>
        <Button onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Menu Items</CardTitle>
          <CardDescription>
            Detailed view of your menu items, variants, and sales performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[200px]">Item Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type & Status</TableHead>
                  <TableHead>Variants (Price)</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No menu items found. Click &quot;Add Item&quot; to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="group transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{item.name}</span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1">{item.description}</span>
                          {item.prep_time && (
                            <span className="text-[10px] text-primary font-medium mt-1">🕒 {item.prep_time} mins prep</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {categories.find(c => c.id === item.category_id)?.name || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.is_veg ? (
                            <Badge className="bg-green-500 hover:bg-green-600 h-5 text-[9px] uppercase font-bold border-none">Veg</Badge>
                          ) : (
                            <Badge className="bg-red-500 hover:bg-red-600 h-5 text-[9px] uppercase font-bold border-none">Non-Veg</Badge>
                          )}
                          {item.is_bestseller && (
                            <Badge className="bg-orange-500 h-5 text-[9px] uppercase font-bold border-none">Bestseller</Badge>
                          )}
                          {item.is_combo && (
                            <Badge className="bg-blue-500 h-5 text-[9px] uppercase font-bold border-none">Combo</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.menu_variants?.map((v) => (
                            <Badge key={v.id} variant="outline" className="text-[10px] bg-background">
                              {v.variant_name}: ₹{v.price}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-black flex items-center gap-1">
                            {salesData[item.id] || 0} <TrendingUp className="h-3 w-3 text-green-500" />
                          </span>
                          <span className="text-[9px] text-muted-foreground uppercase font-bold">Sold</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
