'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MenuItemCard } from '@/components/menu/menu-item-card'
import { CategorySidebar } from '@/components/menu/category-sidebar'
import { MenuGrid } from '@/components/menu/menu-grid'
import { RestaurantNavbar } from '@/components/layout/restaurant-navbar'
import { CartSummaryBar } from '@/components/cart/cart-summary-bar'
import { Sheet } from '@/components/ui/sheet'
import { CartDrawer } from '@/components/cart/cart-drawer'

const CATEGORY_IMAGES: Record<string, string> = {
  'all': '/combo.png',
  'combos': '/combo.png',
  'pizza': '/pizza.png',
  'burger': '/burger.png',
  'sandwich': '/sandwich.png',
  'tacos': '/tacos.png',
  'drink': '/pizza.png',
  'dessert': '/pizza.png',
  'side': '/tacos.png',
}

interface Category {
  id: string
  name: string
  image_url: string
}

interface MenuItem {
  id: string
  category_id: string
  name: string
  description: string
  image_url: string
  is_veg: boolean
  is_combo: boolean
  is_bestseller?: boolean
  menu_variants: {
    id: string
    variant_name: string
    price: number
  }[]
}

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      const { data: cats, error: catsError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      const { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select('*, menu_variants (*)')
        .order('name')

      if (catsError || itemsError) {
        setError({ catsError, itemsError })
      } else {
        const enhancedCats = [
          { id: 'all', name: 'All', image_url: CATEGORY_IMAGES['all'] },
          { id: 'combos', name: 'Combos', image_url: CATEGORY_IMAGES['combos'] },
          ...(cats || []).map(c => ({
            ...c,
            image_url: CATEGORY_IMAGES[c.name.toLowerCase()] || CATEGORY_IMAGES['pizza']
          }))
        ]
        setCategories(enhancedCats)
        setMenuItems(items || [])
        setActiveCategory('all')
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Failed to load menu</h2>
        <p className="text-muted-foreground italic">Please check your database connection.</p>
      </div>
    )
  }

  const filteredItems = menuItems.filter(item => {
    if (activeCategory === 'all') return true
    if (activeCategory === 'combos') return item.is_combo || item.name.toLowerCase().includes('combo')
    return item.category_id === activeCategory
  })

  return (
    <Sheet>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <RestaurantNavbar />
        
        <div className="flex flex-1 overflow-hidden h-[calc(100vh-3.5rem)]">
          <CategorySidebar 
            categories={categories} 
            activeCategory={activeCategory} 
            onCategoryChange={setActiveCategory} 
          />
          
          <main className="flex-1 overflow-y-auto pb-24 md:pb-8 bg-accent/5 overflow-x-hidden relative">
            <div className="max-w-5xl mx-auto">
               <div className="px-4 py-4 md:px-6 flex items-baseline justify-between">
                 <h2 className="text-lg font-bold md:text-2xl tracking-tight">
                   {categories.find(c => c.id === activeCategory)?.name}
                 </h2>
                 <span className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase opacity-60">
                   {filteredItems.length} Items
                 </span>
               </div>
              
              {filteredItems.length > 0 ? (
                <MenuGrid>
                  {filteredItems.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </MenuGrid>
              ) : (
                <div className="text-center py-20 bg-background/50 rounded-2xl border border-dashed mx-4 mt-4">
                  <p className="text-muted-foreground text-xs font-medium">No items found in this category.</p>
                </div>
              )}
            </div>
          </main>
        </div>

        <CartSummaryBar />
        <CartDrawer />
      </div>
    </Sheet>
  )
}
