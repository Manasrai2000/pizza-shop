'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MenuItemForm } from './menu-item-form'

interface MenuItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: any
  categories: any[]
  onSuccess: (item: any) => void
}

export function MenuItemDialog({ open, onOpenChange, item, categories, onSuccess }: MenuItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
          <DialogDescription>
            Fill in the details below to {item ? 'update' : 'create'} your menu item.
          </DialogDescription>
        </DialogHeader>
        <MenuItemForm 
          item={item} 
          categories={categories} 
          onSuccess={onSuccess} 
          onCancel={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  )
}
