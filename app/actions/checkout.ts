'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CheckoutState = {
  success: boolean
  error?: string
  orderId?: string
}

export async function submitOrder(prevState: CheckoutState, formData: FormData): Promise<CheckoutState> {
  try {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const notes = formData.get('notes') as string
    const cartDataStr = formData.get('cartData') as string
    const totalAmount = parseFloat(formData.get('totalAmount') as string)

    if (!name || !phone || !address || !cartDataStr) {
      return { success: false, error: 'Missing required fields' }
    }

    const cartItems = JSON.parse(cartDataStr)
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user?.id || null,
        customer_name: name,
        phone,
        address,
        notes,
        total_amount: totalAmount,
        status: 'Pending'
      })
      .select('id')
      .single()

    if (orderError) throw orderError

    // 2. Create Order Items
    const orderItemsToInsert = cartItems.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      variant_name: item.variantName,
      price: item.price,
      quantity: item.quantity
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsToInsert)

    if (itemsError) throw itemsError

    revalidatePath('/admin/orders') // Let admin know there's a new order

    return { success: true, orderId: order.id }
  } catch (error: any) {
    console.error('Order submission failed:', error)
    return { success: false, error: error.message || 'Failed to submit order' }
  }
}
