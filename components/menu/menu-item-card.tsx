'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { MarqueeText } from '@/components/ui/marquee-text'
import { MenuItemBottomSheet } from '@/components/menu/menu-item-bottom-sheet'

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

export function MenuItemCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore((state) => state.addItem)
  const variants = item.menu_variants || []
  const hasMultipleVariants = variants.length > 1
  const defaultVariant = variants[0] || { id: '', variant_name: 'Regular', price: 0 }
  const minPrice = hasMultipleVariants ? Math.min(...variants.map(v => v.price)) : defaultVariant.price

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [sheetMode, setSheetMode] = useState<'select-variant' | 'full-details'>('full-details')

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent card click opening full details

    if (hasMultipleVariants) {
      setSheetMode('select-variant')
      setIsSheetOpen(true)
    } else {
      addItem({
        menuItemId: item.id,
        name: item.name,
        variantName: defaultVariant.variant_name,
        price: defaultVariant.price,
        quantity: 1,
        imageUrl: item.image_url,
      })

      toast.success(`${item.name} added`, {
        duration: 1500,
        position: 'bottom-center'
      })
    }
  }

  const handleCardClick = () => {
    setSheetMode('full-details')
    setIsSheetOpen(true)
  }

  return (
    <>
      <Card
        className="rounded-[8px] overflow-hidden border-none relative bg-card py-0 gap-0 cursor-pointer transition-transform active:scale-[0.98]"
        onClick={handleCardClick}
      >
        <div className="relative aspect-square w-full">
          <Image
            src={item.image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'}
            alt={item.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-1.5 left-1.5 flex gap-1">
            {item.is_veg ? (
              <div className="h-3 w-3 border border-green-600 flex items-center justify-center bg-white/90 rounded-[2px]">
                <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
              </div>
            ) : (
              <div className="h-3 w-3 border border-red-600 flex items-center justify-center bg-white/90 rounded-[2px]">
                <div className="h-1.5 w-1.5 rounded-full bg-red-600" />
              </div>
            )}
          </div>
          {item.is_bestseller && (
            <div className="absolute top-1.5 right-1.5 bg-orange-500 text-[8px] px-1 rounded-sm text-white font-bold uppercase py-0.5 shadow-sm">
              Best
            </div>
          )}
        </div>

        <CardContent className="p-2 space-y-1">
          <div>
            <MarqueeText
              text={item.name}
              className="text-[12px] md:text-[13px] font-bold leading-tight"
              speed={40}
            />
            <p className="text-[9px] text-muted-foreground line-clamp-1 mt-0.5">
              {item.description}
            </p>
            {hasMultipleVariants && (
              <p className="text-[9px] text-primary/90 font-medium mt-0.5">
                {variants.length} sizes available
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-[11px] md:text-[12px] leading-tight flex-1 mr-1 line-clamp-2">
              {hasMultipleVariants ? (
                <>
                  <span className="font-medium text-[10px] md:text-[11px] opacity-80">Starts from <br />
                  </span>
                  <span className="font-black text-[13px] md:text-[14px]">
                    ₹{minPrice}
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium text-[10px] md:text-[11px] opacity-80">
                    {defaultVariant.variant_name} <br />
                  </span>
                  <span className="font-black text-[13px] md:text-[14px]">
                    ₹{minPrice}
                  </span>
                </>
              )}
            </span>
            <Button
              size="sm"
              className="h-6 shrink-0 w-12 rounded-[4px] bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-none font-bold text-[10px] p-0"
              onClick={handleAddToCart}
            >
              Add +
            </Button>
          </div>
        </CardContent>
      </Card>

      <MenuItemBottomSheet
        item={item}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        mode={sheetMode}
      />
    </>
  )
}
