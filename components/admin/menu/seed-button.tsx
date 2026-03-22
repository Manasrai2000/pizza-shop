'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { upsertMenuItem } from '@/lib/actions/menu'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const SEED_DATA = [
  {
    categoryName: 'Pizza',
    items: [
      { name: 'Classic Corn', isVeg: true, variants: [{ size: 'Reg.', price: 69 }, { size: 'Med.', price: 149 }, { size: 'Lar.', price: 249 }] },
      { name: 'Classic Onion', isVeg: true, variants: [{ size: 'Reg.', price: 69 }, { size: 'Med.', price: 149 }, { size: 'Lar.', price: 249 }] },
      { name: 'Classic Tomato', isVeg: true, variants: [{ size: 'Reg.', price: 69 }, { size: 'Med.', price: 149 }, { size: 'Lar.', price: 249 }] },
      { name: 'Classic Capsicum', isVeg: true, variants: [{ size: 'Reg.', price: 69 }, { size: 'Med.', price: 149 }, { size: 'Lar.', price: 249 }] },

      { name: 'Cheese & Corn', isVeg: true, variants: [{ size: 'Reg.', price: 109 }, { size: 'Med.', price: 179 }, { size: 'Lar.', price: 289 }] },
      { name: 'Cheese & Onion', isVeg: true, variants: [{ size: 'Reg.', price: 109 }, { size: 'Med.', price: 179 }, { size: 'Lar.', price: 289 }] },
      { name: 'Cheese & Tomato', isVeg: true, variants: [{ size: 'Reg.', price: 109 }, { size: 'Med.', price: 179 }, { size: 'Lar.', price: 289 }] },
      { name: 'Cheese & Capsicum', isVeg: true, variants: [{ size: 'Reg.', price: 109 }, { size: 'Med.', price: 179 }, { size: 'Lar.', price: 289 }] },

      { name: 'Margherita', desc: 'Classic Cheese', isVeg: true, variants: [{ size: 'Reg.', price: 129 }, { size: 'Med.', price: 209 }, { size: 'Lar.', price: 389 }] },

      { name: 'Spicy Loaded', desc: 'Corn Jalapeno Red Peprika Cheese', isVeg: true, variants: [{ size: 'Reg.', price: 159 }, { size: 'Med.', price: 259 }, { size: 'Lar.', price: 439 }] },
      { name: 'Achari Paneer', desc: 'Achari Paneer mozzarella Cheese', isVeg: true, variants: [{ size: 'Reg.', price: 159 }, { size: 'Med.', price: 259 }, { size: 'Lar.', price: 439 }] },
      { name: 'Country Feast', desc: 'Onion Capsicum Tomato', isVeg: true, variants: [{ size: 'Reg.', price: 159 }, { size: 'Med.', price: 259 }, { size: 'Lar.', price: 439 }] },
      { name: 'Peppy Paneer', desc: 'Paneer, Capsicum, Onion & Red Parika', isVeg: true, variants: [{ size: 'Reg.', price: 159 }, { size: 'Med.', price: 259 }, { size: 'Lar.', price: 439 }] },
      { name: 'Double Cheese', desc: 'Loaded with Extra Cheese', isVeg: true, variants: [{ size: 'Reg.', price: 159 }, { size: 'Med.', price: 259 }, { size: 'Lar.', price: 439 }] },
      { name: 'Paneer Angara', desc: 'Onion Paneer Garlic Sauce', isVeg: true, variants: [{ size: 'Reg.', price: 159 }, { size: 'Med.', price: 259 }, { size: 'Lar.', price: 439 }] },

      { name: 'Veggie Supreme', desc: 'Onion, Capsicum, Tomato Mushroom & Baby Corn & Jalapeno', isVeg: true, variants: [{ size: 'Reg.', price: 209 }, { size: 'Med.', price: 329 }, { size: 'Lar.', price: 499 }] },
      { name: 'Popey Achari', desc: 'Onion Capsicum Paneer Jalapeno Achari mozzarella Cheese', isVeg: true, variants: [{ size: 'Reg.', price: 209 }, { size: 'Med.', price: 329 }, { size: 'Lar.', price: 499 }] },
      { name: 'Farmhouse', desc: 'Capsicum, Tomato Mushroom Sweet Corn, Baby Corn & Jalapeno', isVeg: true, variants: [{ size: 'Reg.', price: 209 }, { size: 'Med.', price: 329 }, { size: 'Lar.', price: 499 }] },
      { name: 'Veggie Deluxe', desc: 'Onion, Capsicum, Sweet Corn Paneer & Black Olive', isVeg: true, variants: [{ size: 'Reg.', price: 209 }, { size: 'Med.', price: 329 }, { size: 'Lar.', price: 499 }] },
      { name: 'Veg. Triple Tango', desc: 'Red peprika jalapeno extra cheese black olive corn', isVeg: true, variants: [{ size: 'Reg.', price: 209 }, { size: 'Med.', price: 329 }, { size: 'Lar.', price: 499 }] },
      { name: 'Tandoori Pizza', desc: 'Capsicum, Paneer Tandoori Sauce & Green Olive', isVeg: true, variants: [{ size: 'Reg.', price: 209 }, { size: 'Med.', price: 329 }, { size: 'Lar.', price: 499 }] },
      { name: 'Peppy Makhani', desc: 'Paneer Onion with Makhani Sauce & Green Olive', isVeg: true, variants: [{ size: 'Reg.', price: 209 }, { size: 'Med.', price: 329 }, { size: 'Lar.', price: 499 }] },
      { name: 'Paneer Paprika', desc: 'Paneer capsicum tomato Extra Cheese, Red Peprika', isVeg: true, variants: [{ size: 'Reg.', price: 209 }, { size: 'Med.', price: 329 }, { size: 'Lar.', price: 499 }] },

      { name: 'Veg Exotica', desc: 'Veggies, Sweet Corn, Red Parika Black Olive, Baby Corn & Paneer Cheese Cubes', isVeg: true, variants: [{ size: 'Reg.', price: 209 }, { size: 'Med.', price: 329 }, { size: 'Lar.', price: 499 }] },
      { name: 'Veg Extravaganza', desc: 'Black Olive, Onion, Capsicum, Golden Corn Jalapeno, Mushroom, Extra Cheese & Paneer', isVeg: true, variants: [{ size: 'Reg.', price: 209 }, { size: 'Med.', price: 329 }, { size: 'Lar.', price: 499 }] },
      
      { name: 'Extra Cheese Bust', isVeg: true, variants: [{ size: 'Reg.', price: 50 }, { size: 'Med.', price: 80 }, { size: 'Lar.', price: 120 }] },
      { name: 'Extra Cheese', isVeg: true, variants: [{ size: 'Reg.', price: 30 }, { size: 'Med.', price: 40 }, { size: 'Lar.', price: 60 }] },
      { name: 'Extra Toppings', isVeg: true, variants: [{ size: 'Reg.', price: 20 }, { size: 'Med.', price: 30 }, { size: 'Lar.', price: 40 }] },
    ]
  },
  {
    categoryName: 'Shake',
    items: [
      { name: 'Cold Coffee', isVeg: true, variants: [{ size: 'Regular', price: 50 }] },
      { name: 'Oreo Ooze Shake', isVeg: true, variants: [{ size: 'Regular', price: 90 }] },
      { name: 'Chocolate Shake', isVeg: true, variants: [{ size: 'Regular', price: 90 }] },
      { name: 'Mashala Cold Drink', isVeg: true, variants: [{ size: 'Regular', price: 50 }] },
      { name: 'Ice Cream Extra Charge', isVeg: true, variants: [{ size: 'Regular', price: 30 }] },
    ]
  },
  {
    categoryName: 'Combo',
    items: [
      { name: 'COMBO - 1', desc: '(3 Pizza + Coke Glass 250mlx3) Onion Capsicum, Tomato Corn, Jalapeno Corn', isVeg: true, isCombo: true, variants: [{ size: 'Regular', price: 320 }] },
      { name: 'COMBO - 2', desc: '(Set of 2 Pizza + Coke Glass 250mlx2) Paneer Corn & Onion Capsicum', isVeg: true, isCombo: true, variants: [{ size: 'Regular', price: 220 }] },
      { name: 'COMBO - 3', desc: '(4 Pizza Combo) Onion Capsicum, Tomato Capsicum, Onion Paneer & Jalapeno Corn', isVeg: true, isCombo: true, variants: [{ size: 'Regular', price: 360 }] },
      { name: 'COMBO - 4', desc: 'Spicy Allo Tikki Burger, Red Pepper Paneer Pizza & Lawa Cake', isVeg: true, isCombo: true, variants: [{ size: 'Regular', price: 200 }] },
      { name: 'COMBO - 5', desc: 'Red Peprika Paneer Pizza, Lawa Cake', isVeg: true, isCombo: true, variants: [{ size: 'Regular', price: 130 }] },
    ]
  },
  {
    categoryName: 'Kulhad Pizza',
    items: [
      { name: 'Paneer & Capsicum Kulhad', isVeg: true, variants: [{ size: 'Regular', price: 99 }] },
      { name: 'Spicy Born Paneer Kulhad', isVeg: true, variants: [{ size: 'Regular', price: 99 }] },
      { name: 'Corn Paneer Kulhad', isVeg: true, variants: [{ size: 'Regular', price: 99 }] },
      { name: 'Onion & Capsicum Kulhad', isVeg: true, variants: [{ size: 'Regular', price: 99 }] },
      { name: 'Onion & Corn Kulhad', isVeg: true, variants: [{ size: 'Regular', price: 99 }] },
      { name: 'Tomato & Corn Kulhad', isVeg: true, variants: [{ size: 'Regular', price: 99 }] },
      { name: 'Onion & Paneer Kulhad', isVeg: true, variants: [{ size: 'Regular', price: 99 }] },
      { name: 'Jalapeno & Corn Kulhad', isVeg: true, variants: [{ size: 'Regular', price: 99 }] },
      { name: 'Spicy Paneer Kulhad', isVeg: true, variants: [{ size: 'Regular', price: 99 }] },
      { name: 'Special Kulhad Pizza', isVeg: true, variants: [{ size: 'Regular', price: 60 }, { size: 'Special', price: 80 }] },
    ]
  },
  {
    categoryName: 'Coffee & Fingers',
    items: [
      { name: 'Salted Finger', isVeg: true, variants: [{ size: 'Regular', price: 50 }] },
      { name: 'Peri Peri Finger', isVeg: true, variants: [{ size: 'Regular', price: 60 }] },
      { name: 'Cheese Finger', isVeg: true, variants: [{ size: 'Regular', price: 70 }] },
    ]
  },
  {
    categoryName: 'Bread',
    items: [
      { name: 'Cheese Garlic Bread', isVeg: true, variants: [{ size: 'Regular', price: 99 }] },
      { name: 'Stuffed Garlic Bread', isVeg: true, variants: [{ size: 'Regular', price: 129 }] },
      { name: 'Exotic Garlic Bread', isVeg: true, variants: [{ size: 'Regular', price: 149 }] },
    ]
  },
  {
    categoryName: 'Dessert',
    items: [
      { name: 'Lava Cake', isVeg: true, variants: [{ size: 'Regular', price: 50 }] },
      { name: 'Roll Cake', isVeg: true, variants: [{ size: 'Regular', price: 30 }] },
    ]
  },
  {
    categoryName: 'Burger',
    items: [
      { name: 'Allo Tikki Burger', isVeg: true, variants: [{ size: 'Regular', price: 40 }] },
      { name: 'Cheese Burger', isVeg: true, variants: [{ size: 'Regular', price: 60 }] },
      { name: 'Paneer Burger', isVeg: true, variants: [{ size: 'Regular', price: 60 }] },
      { name: 'Double Cheese Burger', isVeg: true, variants: [{ size: 'Regular', price: 80 }] },
    ]
  },
  {
    categoryName: 'Jumbo Grilled Sandwich',
    items: [
      { name: 'Veg Sandwich', isVeg: true, variants: [{ size: 'Regular', price: 50 }] },
      { name: 'Cheese Paneer Sandwich', isVeg: true, variants: [{ size: 'Regular', price: 70 }] },
      { name: 'Corn Mayo Sandwich', isVeg: true, variants: [{ size: 'Regular', price: 70 }] },
      { name: 'Cheese Corn Sandwich', isVeg: true, variants: [{ size: 'Regular', price: 70 }] },
      { name: 'Paneer Sandwich', isVeg: true, variants: [{ size: 'Regular', price: 60 }] },
      { name: 'Special Sandwich', isVeg: true, variants: [{ size: 'Regular', price: 100 }] },
    ]
  }
]

export function SeedMenuButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSeed = async () => {
    if (!confirm('This will seed the database with all items from the image. Proceed?')) return
    setLoading(true)
    
    try {
      let totalInserted = 0
      for (const cat of SEED_DATA) {
        // 1. Get or create category
        let { data: existingCats } = await supabase.from('categories').select('id').eq('name', cat.categoryName)
        let categoryId = existingCats?.[0]?.id

        if (!categoryId) {
          const { data: newCat, error: catError } = await supabase
            .from('categories')
            .insert({ name: cat.categoryName })
            .select()
            .single()
          if (catError) throw new Error(catError.message)
          categoryId = newCat.id
        }

        // 2. Insert items
        for (const item of cat.items) {
          await upsertMenuItem({
            category_id: categoryId,
            name: item.name,
            description: item.desc || '',
            is_veg: item.isVeg,
            is_combo: !!(item as any).isCombo,
            menu_variants: item.variants.map(v => ({ variant_name: v.size, price: v.price }))
          })
          totalInserted++
        }
      }
      toast.success(`Successfully seeded ${totalInserted} items!`)
      router.refresh()
    } catch (e: any) {
      console.error(e)
      toast.error('Seed failed: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      onClick={handleSeed}
      disabled={loading}
      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
    >
      {loading ? 'Seeding...' : 'Quick Seed Menu (Image)'}
    </Button>
  )
}
