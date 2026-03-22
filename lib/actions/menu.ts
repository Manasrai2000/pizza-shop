'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface VariantInput {
  id?: string
  variant_name: string
  price: number
  menu_item_id?: string
}

export interface MenuItemInput {
  id?: string
  category_id: string
  name: string
  description?: string
  image_url?: string
  is_veg: boolean
  is_bestseller?: boolean
  is_combo?: boolean
  menu_variants?: VariantInput[]
}

export async function deleteMenuItem(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/menu')
  revalidatePath('/menu')
  return { success: true }
}

export async function upsertMenuItem(data: MenuItemInput) {
  const supabase = await createClient()
  
  const { id, menu_variants, ...itemData } = data

  let menuItemId = id

  if (id) {
    // Update item
    const { error: itemError } = await supabase
      .from('menu_items')
      .update(itemData)
      .eq('id', id)
    
    if (itemError) throw new Error(itemError.message)
  } else {
    // Create item
    const { data: newItem, error: itemError } = await supabase
      .from('menu_items')
      .insert(itemData)
      .select()
      .single()
    
    if (itemError) throw new Error(itemError.message)
    menuItemId = newItem.id
  }

  // Handle variants
  if (menu_variants && menu_variants.length > 0) {
    // Delete existing variants if updating
    if (id) {
      await supabase.from('menu_variants').delete().eq('menu_item_id', id)
    }

    // Insert new variants
    const variantsToInsert = menu_variants.map((v: VariantInput) => ({
      ...v,
      menu_item_id: menuItemId
    }))

    const { error: variantError } = await supabase
      .from('menu_variants')
      .insert(variantsToInsert)

    if (variantError) throw new Error(variantError.message)
  }

  revalidatePath('/admin/menu')
  revalidatePath('/menu')
  return { success: true, id: menuItemId }
}
