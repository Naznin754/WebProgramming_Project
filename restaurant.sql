CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'waiter', 'chef', 'customer')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INT UNIQUE NOT NULL,
  capacity INT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved'))
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price NUMERIC(8,2) NOT NULL,
  category VARCHAR(50),
  prep_time_minutes INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT FALSE
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id),
  waiter_id UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'placed'
    CHECK (status IN ('placed', 'in_kitchen', 'ready', 'served', 'paid')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INT NOT NULL DEFAULT 1,
  notes TEXT
);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES users(id),
  clock_in TIMESTAMP NOT NULL DEFAULT NOW(),
  clock_out TIMESTAMP
);