-- Create ENUM types safely
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tables safely
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    image_url text
);

CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    description text,
    price numeric NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    image_url text,
    in_stock boolean DEFAULT true NOT NULL,
    featured boolean DEFAULT false NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name text NOT NULL,
    customer_phone text NOT NULL,
    customer_address text NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    product_price numeric NOT NULL,
    quantity integer NOT NULL,
    total numeric NOT NULL,
    status order_status DEFAULT 'pending'::order_status NOT NULL,
    notes text
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid NOT NULL,
    role app_role DEFAULT 'user'::app_role NOT NULL
);

-- Setup RLS (Row Level Security)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Permettre aux utilisateurs de voir leur propre rôle
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
END $$;
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Reset and re-apply Policies (prevents duplicate policy errors)
DO $$ 
BEGIN
  -- Drop existing policies if they exist (to avoid errors)
  DROP POLICY IF EXISTS "Public read access to categories" ON public.categories;
  DROP POLICY IF EXISTS "Public read access to products" ON public.products;
  DROP POLICY IF EXISTS "Public insert access to orders" ON public.orders;
  DROP POLICY IF EXISTS "Public read access to orders" ON public.orders;
  DROP POLICY IF EXISTS "Admin full access categories" ON public.categories;
  DROP POLICY IF EXISTS "Admin full access products" ON public.products;
  DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
END $$;

-- Allow public read access (Products & Categories)
CREATE POLICY "Public read access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read access to products" ON public.products FOR SELECT USING (true);

-- Allow public insert access for Orders (Customers placing orders)
CREATE POLICY "Public insert access to orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access to orders" ON public.orders FOR SELECT USING (true);

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.has_role(_role app_role, _user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies (Admins have full access to all tables)
CREATE POLICY "Admin full access categories" ON public.categories FOR ALL USING (public.has_role('admin', auth.uid()));
CREATE POLICY "Admin full access products" ON public.products FOR ALL USING (public.has_role('admin', auth.uid()));
CREATE POLICY "Admin full access orders" ON public.orders FOR ALL USING (public.has_role('admin', auth.uid()));

-- Set up storage buckets (Run these in SQL Editor to create buckets)
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;

-- Set up storage policies for public access to images
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
  DROP POLICY IF EXISTS "Admin write product images" ON storage.objects;
END $$;

CREATE POLICY "Public read product images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin write product images" ON storage.objects FOR ALL USING (bucket_id = 'product-images' AND public.has_role('admin', auth.uid()));

-- Insert initial admin user role 
-- This uses ON CONFLICT (user_id, role) to be perfectly idempotent
INSERT INTO public.user_roles (user_id, role) 
VALUES ('bec67325-8236-4b51-911e-5d19f119f658', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add SKU and stock management columns to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sku text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;

-- Function to decrement stock atomically and handle in_stock status
CREATE OR REPLACE FUNCTION public.decrement_product_stock(product_id uuid, qty_to_decrement int)
RETURNS void AS $$
BEGIN
    UPDATE public.products
    SET 
        stock_quantity = stock_quantity - qty_to_decrement,
        in_stock = (CASE WHEN (stock_quantity - qty_to_decrement) > 0 THEN true ELSE false END)
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Multi-product order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    product_price numeric NOT NULL,
    quantity integer NOT NULL,
    total numeric NOT NULL
);

-- RLS for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public insert access to order_items" ON public.order_items;
  DROP POLICY IF EXISTS "Public read access to order_items" ON public.order_items;
  DROP POLICY IF EXISTS "Admin full access order_items" ON public.order_items;
END $$;

CREATE POLICY "Public insert access to order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read access to order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Admin full access order_items" ON public.order_items FOR ALL USING (public.has_role('admin', auth.uid()));

-- Modify products to allow NULL category_id if needed (already done)
-- Modify orders to make product_id, product_name, product_price nullable (since they might be in order_items instead)
ALTER TABLE public.orders ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN product_name DROP NOT NULL;
ALTER TABLE public.orders ALTER COLUMN product_price DROP NOT NULL;

-- Testimonials system
CREATE TABLE IF NOT EXISTS public.testimonials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    name text NOT NULL,
    comment text NOT NULL,
    rating integer NOT NULL DEFAULT 5,
    is_approved boolean DEFAULT false NOT NULL
);

-- RLS for testimonials
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read approved testimonials" ON public.testimonials;
  DROP POLICY IF EXISTS "Public insert testimonials" ON public.testimonials;
  DROP POLICY IF EXISTS "Admin full access testimonials" ON public.testimonials;
END $$;

CREATE POLICY "Public read approved testimonials" ON public.testimonials FOR SELECT USING (is_approved = true);
CREATE POLICY "Public insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access testimonials" ON public.testimonials FOR ALL USING (public.has_role('admin', auth.uid()));

-- Add stock_status column to products for 3-state display
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_status text DEFAULT 'in_stock';

-- Add promotion system
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_promotion boolean DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS old_price numeric;

-- Site Settings for Dynamic Configuration (Telegram, etc.)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id text PRIMARY KEY DEFAULT 'global',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    telegram_bot_token text,
    telegram_chat_id text
);

-- RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public read access to site_settings" ON public.site_settings;
  DROP POLICY IF EXISTS "Admin full access site_settings" ON public.site_settings;
END $$;

CREATE POLICY "Public read access to site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin full access site_settings" ON public.site_settings FOR ALL USING (public.has_role('admin', auth.uid()));

-- Insert default global settings row if it doesn't exist
INSERT INTO public.site_settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

-- Gallery system
CREATE TABLE IF NOT EXISTS public.gallery_images (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    image_url text NOT NULL,
    display_order integer DEFAULT 0
);

-- Enable RLS for gallery_images
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Allow public read access to gallery_images
CREATE POLICY "Public read access to gallery_images" ON public.gallery_images
FOR SELECT USING (true);

-- Allow authenticated users (admins) to manage gallery_images
CREATE POLICY "Admin manage access to gallery_images" ON public.gallery_images
FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
