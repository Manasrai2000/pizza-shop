-- Create Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Menu Items Table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_veg BOOLEAN DEFAULT true,
  is_bestseller BOOLEAN DEFAULT false,
  is_combo BOOLEAN DEFAULT false,
  prep_time INTEGER, -- Prep time in minutes
  spiciness_level INTEGER DEFAULT 0, -- 0-3
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Menu Variants Table
CREATE TABLE menu_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- nullable for guests
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'Pending', -- Pending, Preparing, Ready, Completed
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  variant_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policies for Categories
CREATE POLICY "Categories are viewable by everyone." 
ON categories FOR SELECT USING (true);

CREATE POLICY "Categories are insertable, updatable, deletable by admin only." 
ON categories FOR ALL USING (auth.role() = 'authenticated'); 

-- Policies for Menu Items
CREATE POLICY "Menu items are viewable by everyone." 
ON menu_items FOR SELECT USING (true);

CREATE POLICY "Menu items are insertable, updatable, deletable by admin only." 
ON menu_items FOR ALL USING (auth.role() = 'authenticated');

-- Policies for Menu Variants
CREATE POLICY "Menu variants are viewable by everyone." 
ON menu_variants FOR SELECT USING (true);

CREATE POLICY "Menu variants are insertable, updatable, deletable by admin only." 
ON menu_variants FOR ALL USING (auth.role() = 'authenticated');

-- Policies for Orders
CREATE POLICY "Orders can be inserted by anyone." 
ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own orders or admins can view all." 
ON orders FOR SELECT USING (
  auth.uid() = user_id OR auth.role() = 'authenticated'
);

CREATE POLICY "Admins can update and delete orders." 
ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete orders." 
ON orders FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for Order Items
CREATE POLICY "Order items can be inserted by anyone." 
ON order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own order items or admins can view all." 
ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR auth.role() = 'authenticated')
  )
);

CREATE POLICY "Admins can update and delete order items." 
ON order_items FOR ALL USING (auth.role() = 'authenticated');


-- Enable realtime for orders table
alter publication supabase_realtime add table orders;


-- Insert Mock Data
INSERT INTO categories (id, name) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Pizza'),
  ('22222222-2222-2222-2222-222222222222', 'Burger'),
  ('33333333-3333-3333-3333-333333333333', 'Sandwich'),
  ('44444444-4444-4444-4444-444444444444', 'Tacos');

INSERT INTO menu_items (id, category_id, name, description, image_url, is_veg) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Margherita Pizza', 'Classic delight with 100% real mozzarella cheese.', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Pepperoni Supreme', 'Loaded with pepperoni and extra cheese.', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80', false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Classic Cheeseburger', 'Juicy beef patty with fresh lettuce, tomato, and cheese.', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', false),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', 'Veggie Delight Burger', 'Crispy veggie patty with special sauce.', 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=800&q=80', true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 'Spicy Chicken Tacos', 'Grilled chicken with spicy salsa and guac.', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80', false);

INSERT INTO menu_variants (menu_item_id, variant_name, price) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Small', 9.99),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Medium', 12.99),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Large', 15.99),
  
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Medium', 14.99),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Large', 17.99),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Extra Cheese', 19.99),
  
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Regular', 8.99),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Double Patty', 11.99),
  
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Regular', 7.99),
  
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2 Pieces', 6.99),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '3 Pieces', 8.99);
