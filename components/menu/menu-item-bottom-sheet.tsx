'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useCartStore } from '@/lib/store/cart'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Variant = {
  id: string
  variant_name: string
  price: number
}

type MenuItem = {
  id: string
  category_id: string
  name: string
  description: string
  image_url: string
  is_veg: boolean
  is_bestseller?: boolean
  menu_variants: Variant[]
}

interface MenuItemBottomSheetProps {
  item: MenuItem
  isOpen: boolean
  onClose: () => void
  mode: 'select-variant' | 'full-details'
}

export function MenuItemBottomSheet({ item, isOpen, onClose, mode }: MenuItemBottomSheetProps) {
  const variants = item.menu_variants || []
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id || '')
  const addItem = useCartStore((state) => state.addItem)

  // Find the selected variant object
  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0]

  const handleAddToCart = () => {
    if (!selectedVariant) return

    addItem({
      menuItemId: item.id,
      name: item.name,
      variantName: selectedVariant.variant_name,
      price: selectedVariant.price,
      quantity: 1,
      imageUrl: item.image_url,
    })

    toast.success(`${item.name} added`, {
      duration: 1500,
      position: 'bottom-center'
    })
    
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} className="md:max-w-md md:mx-auto">
      <div className="flex flex-col gap-6">
        
        {/* Full Details Mode: Image and Detailed Text */}
        {mode === 'full-details' && (
          <div className="flex flex-col gap-4">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-sm">
              <Image
                src={item.image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'}
                alt={item.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 left-2 flex gap-1">
                <div className={cn(
                  "h-4 w-4 border flex items-center justify-center bg-white/95 rounded-[4px] shadow-sm",
                  item.is_veg ? "border-green-600" : "border-red-600"
                )}>
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    item.is_veg ? "bg-green-600" : "bg-red-600"
                  )} />
                </div>
              </div>
              {item.is_bestseller && (
                <div className="absolute top-2 right-2 bg-orange-500 text-[10px] px-2 rounded-md text-white font-bold uppercase py-1 shadow-md">
                  Bestseller
                </div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-2xl font-black tracking-tight leading-tight">{item.name}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          </div>
        )}

        {/* Select Variant Mode Header (if not full details) */}
        {mode === 'select-variant' && (
          <div className="space-y-1 border-b border-border pb-4">
            <h2 className="text-xl font-bold tracking-tight">Select Size</h2>
            <p className="text-sm text-muted-foreground">{item.name}</p>
          </div>
        )}

        {/* Variant Selection List */}
        <div className="space-y-4">
          {mode === 'full-details' && (
            <h3 className="font-bold text-lg border-b border-border pb-2">Choose Size</h3>
          )}
          
          <RadioGroup 
            value={selectedVariantId} 
            onValueChange={setSelectedVariantId}
            className="flex flex-col gap-3"
          >
            {variants.map((v) => (
              <Label
                key={v.id}
                htmlFor={v.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer",
                  selectedVariantId === v.id 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-border/60 hover:border-border hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <RadioGroupItem value={v.id} id={v.id} className="h-5 w-5" />
                  <span className="font-semibold text-base">{v.variant_name}</span>
                </div>
                <span className="font-bold text-base">₹{v.price}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button 
            className="w-full h-14 rounded-xl text-lg font-bold shadow-md hover:shadow-lg transition-shadow bg-primary text-primary-foreground" 
            onClick={handleAddToCart}
          >
            Add to Cart • ₹{selectedVariant?.price || 0}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
