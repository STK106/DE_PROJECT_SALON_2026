CREATE TABLE IF NOT EXISTS product_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  salon_id UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  order_status VARCHAR(30) NOT NULL DEFAULT 'pending_payment'
    CHECK (order_status IN ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed')),
  payment_status VARCHAR(20) NOT NULL DEFAULT 'created'
    CHECK (payment_status IN ('created', 'paid', 'failed', 'refunded')),
  shipping_name VARCHAR(150) NOT NULL,
  shipping_phone VARCHAR(30) NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(10,2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_orders_user ON product_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_salon ON product_orders(salon_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_status ON product_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_product_orders_payment_status ON product_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_product_order_items_order ON product_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_order_items_product ON product_order_items(product_id);

DROP TRIGGER IF EXISTS trg_product_orders_updated_at ON product_orders;
CREATE TRIGGER trg_product_orders_updated_at
BEFORE UPDATE ON product_orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
