import { createClient } from '@/lib/supabase/server'
import { MenuManagementClient } from '@/components/admin/menu/menu-management-client'

export const revalidate = 0

export default async function AdminMenuPage() {
  const supabase = await createClient()

  // Fetch all necessary data
  const [
    { data: menuItems, error: itemsError },
    { data: categories, error: catsError },
    { data: orderItems }
  ] = await Promise.all([
    supabase.from('menu_items').select('*, menu_variants (*)').order('name'),
    supabase.from('categories').select('*').order('name'),
    supabase.from('order_items').select('menu_item_id, quantity')
  ])

  if (itemsError || catsError) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 p-4 rounded-lg text-destructive">
          Error loading menu data: {itemsError?.message || catsError?.message}
        </div>
      </div>
    )
  }

  // Aggregate sales data: { menuItemId: totalQuantity }
  const salesData: Record<string, number> = {}
  orderItems?.forEach(item => {
    if (item.menu_item_id) {
      salesData[item.menu_item_id] = (salesData[item.menu_item_id] || 0) + item.quantity
    }
  })

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <MenuManagementClient 
        initialItems={menuItems || []} 
        categories={categories || []} 
        salesData={salesData}
      />
    </div>
  )
}
