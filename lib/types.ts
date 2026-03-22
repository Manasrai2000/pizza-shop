export interface MenuItem {
  id: string
  name: string
  description?: string
  image_url?: string
  category_id: string
  is_veg: boolean
  is_bestseller: boolean
  is_combo: boolean
  prep_time?: number
  spiciness_level: number
  menu_variants: {
    id?: string
    variant_name: string
    price: number
  }[]
}

export interface Category {
  id: string
  name: string
}

export interface Order {
  id: string
  customer_name: string
  phone: string
  address: string
  notes: string | null
  status: string
  total_amount: number
  created_at: string
  order_items?: {
    id: string
    menu_item_id: string
    variant_name: string
    price: number
    quantity: number
  }[]
}
