-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    is_veg BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.menu_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    variant_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'Pending',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID,
    variant_name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 3. Setup RLS Policies
-- Allow public read access to menu
DROP POLICY IF EXISTS "Public read access for categories" ON public.categories;
CREATE POLICY "Public read access for categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for menu_items" ON public.menu_items;
CREATE POLICY "Public read access for menu_items" ON public.menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access for menu_variants" ON public.menu_variants;
CREATE POLICY "Public read access for menu_variants" ON public.menu_variants FOR SELECT USING (true);

-- Allow public to insert orders securely
DROP POLICY IF EXISTS "Public can insert orders" ON public.orders;
CREATE POLICY "Public can insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert order items" ON public.order_items;
CREATE POLICY "Public can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Allow admins to manage everything
DROP POLICY IF EXISTS "Admin full access to categories" ON public.categories;
CREATE POLICY "Admin full access to categories" ON public.categories TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access to menu_items" ON public.menu_items;
CREATE POLICY "Admin full access to menu_items" ON public.menu_items TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access to menu_variants" ON public.menu_variants;
CREATE POLICY "Admin full access to menu_variants" ON public.menu_variants TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access to orders" ON public.orders;
CREATE POLICY "Admin full access to orders" ON public.orders TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access to order_items" ON public.order_items;
CREATE POLICY "Admin full access to order_items" ON public.order_items TO authenticated USING (true) WITH CHECK (true);


-- 4. Enable Supabase Realtime for orders
-- Only need to run this once per table to broadcast changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;
END $$;


-- 5. Insert Dummy Data (Categories, Items, Variants)
DO $$
DECLARE
  cat_pizza UUID;
  cat_burger UUID;
  cat_taco UUID;
  cat_sandwich UUID;
  item_1 UUID;
  item_2 UUID;
  item_3 UUID;
  item_4 UUID;
BEGIN
  -- Clear existing mock data if needed (Optional)
  -- DELETE FROM public.categories;

  -- Create Categories
  INSERT INTO public.categories (name) VALUES ('Pizza') RETURNING id INTO cat_pizza;
  INSERT INTO public.categories (name) VALUES ('Burgers') RETURNING id INTO cat_burger;
  INSERT INTO public.categories (name) VALUES ('Tacos') RETURNING id INTO cat_taco;
  INSERT INTO public.categories (name) VALUES ('Sandwiches') RETURNING id INTO cat_sandwich;

  -- Insert Menu Items
  INSERT INTO public.menu_items (category_id, name, description, image_url, is_veg)
  VALUES (cat_pizza, 'Pepperoni Supreme', 'Classic pepperoni with extra cheese and standard crust.', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop', false)
  RETURNING id INTO item_1;

  INSERT INTO public.menu_items (category_id, name, description, image_url, is_veg)
  VALUES (cat_burger, 'Double Cheese Burger', 'Two smashed beef patties, double cheddar cheese, pickles, and our signature sauce.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop', false)
  RETURNING id INTO item_2;

  INSERT INTO public.menu_items (category_id, name, description, image_url, is_veg)
  VALUES (cat_pizza, 'Margherita Magic', 'Fresh tomatoes, mozzarella, and locally sourced basil.', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop', true)
  RETURNING id INTO item_3;

  INSERT INTO public.menu_items (category_id, name, description, image_url, is_veg)
  VALUES (cat_taco, 'Spicy Mexican Taco', 'Authentic hard-shell taco loaded with spicy ground meat, lettuce, cheese, and salsa.', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&auto=format&fit=crop', false)
  RETURNING id INTO item_4;

  -- Insert Variants (Prices in Rupees)
  INSERT INTO public.menu_variants (menu_item_id, variant_name, price) VALUES (item_1, 'Medium (10")', 299.00);
  INSERT INTO public.menu_variants (menu_item_id, variant_name, price) VALUES (item_1, 'Large (14")', 499.00);
  
  INSERT INTO public.menu_variants (menu_item_id, variant_name, price) VALUES (item_2, 'Single Patty', 149.00);
  INSERT INTO public.menu_variants (menu_item_id, variant_name, price) VALUES (item_2, 'Double Patty', 249.00);

  INSERT INTO public.menu_variants (menu_item_id, variant_name, price) VALUES (item_3, 'Medium (10")', 249.00);
  INSERT INTO public.menu_variants (menu_item_id, variant_name, price) VALUES (item_3, 'Large (14")', 399.00);

  INSERT INTO public.menu_variants (menu_item_id, variant_name, price) VALUES (item_4, 'Regular', 99.00);
  INSERT INTO public.menu_variants (menu_item_id, variant_name, price) VALUES (item_4, 'Large Meal (w/ Drink)', 199.00);

END $$;
