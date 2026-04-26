const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const SALON_IMAGE_URLS = [
  '/images/salon-elite.svg',
  '/images/salon-luxe.svg',
  '/images/fallback-salon.svg',
];

const PRODUCT_IMAGE_URLS = [
  '/images/product-default.svg',
  '/images/product-default.svg',
  '/images/product-default.svg',
  '/images/product-default.svg',
  '/images/product-default.svg',
];

async function clearDatabase() {
  const client = await pool.connect();
  try {
    console.log('[seed] Clearing all data...');
    
    // Disable foreign key checks, clear tables, re-enable
    await client.query('TRUNCATE TABLE bookings CASCADE');
    await client.query('TRUNCATE TABLE blocked_slots CASCADE');
    await client.query('TRUNCATE TABLE services CASCADE');
    await client.query('TRUNCATE TABLE staff CASCADE');
    await client.query('TRUNCATE TABLE product_order_items CASCADE');
    await client.query('TRUNCATE TABLE product_orders CASCADE');
    await client.query('TRUNCATE TABLE products CASCADE');
    await client.query('TRUNCATE TABLE salons CASCADE');
    await client.query('TRUNCATE TABLE users CASCADE');
    
    console.log('[seed] Database cleared.');
  } finally {
    client.release();
  }
}

async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // ========== ADMINS & SHOPKEEPERS ==========
    console.log('[seed] Adding admin and shopkeepers...');
    
    const adminHash = await bcrypt.hash('admin123', 10);
    const adminRes = await client.query(
      `INSERT INTO users (name, email, password, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
      ['Admin', 'admin@salon.com', adminHash, '1234567890', 'admin']
    );
    const adminId = adminRes.rows[0].id;
    console.log('✓ Admin created:', adminId);

    // Shopkeeper 1
    const shop1Hash = await bcrypt.hash('shop1234', 10);
    const shop1Res = await client.query(
      `INSERT INTO users (name, email, password, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
      ['Elite Salon Owners', 'elite@salon.com', shop1Hash, '9876543210', 'shopkeeper']
    );
    const shop1Id = shop1Res.rows[0].id;

    // Shopkeeper 2
    const shop2Hash = await bcrypt.hash('shop5678', 10);
    const shop2Res = await client.query(
      `INSERT INTO users (name, email, password, phone, role, is_active)
       VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
      ['Luxe Hair Studios', 'luxe@salon.com', shop2Hash, '8765432109', 'shopkeeper']
    );
    const shop2Id = shop2Res.rows[0].id;

    // ========== CUSTOMERS ==========
    console.log('[seed] Adding customers...');
    
    const customerHashes = await Promise.all([
      bcrypt.hash('customer1', 10),
      bcrypt.hash('customer2', 10),
      bcrypt.hash('customer3', 10),
      bcrypt.hash('customer4', 10),
      bcrypt.hash('customer5', 10),
    ]);

    const customerData = [
      { name: 'Priya Sharma', email: 'priya@user.com', phone: '9111111111', hash: customerHashes[0] },
      { name: 'Ananya Patel', email: 'ananya@user.com', phone: '9222222222', hash: customerHashes[1] },
      { name: 'Sneha Singh', email: 'sneha@user.com', phone: '9333333333', hash: customerHashes[2] },
      { name: 'Zara Khan', email: 'zara@user.com', phone: '9444444444', hash: customerHashes[3] },
      { name: 'Kavya Verma', email: 'kavya@user.com', phone: '9555555555', hash: customerHashes[4] },
    ];

    const customerIds = [];
    for (const customer of customerData) {
      const res = await client.query(
        `INSERT INTO users (name, email, password, phone, role, is_active)
         VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
        [customer.name, customer.email, customer.hash, customer.phone, 'user']
      );
      customerIds.push(res.rows[0].id);
    }
    console.log(`✓ ${customerIds.length} customers created`);

    // ========== SALONS ==========
    console.log('[seed] Adding salons...');
    
    // Salon 1
    const salon1Res = await client.query(
      `INSERT INTO salons (owner_id, name, description, address, city, state, phone, email, 
                           opening_time, closing_time, working_days, images, is_approved, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, true) RETURNING id`,
      [
        shop1Id,
        'Elite Unisex Salon',
        'Premium unisex salon offering cutting-edge hair, beauty, and wellness services. Award-winning stylists with 15+ years experience.',
        '123 Fashion Street, Bandra',
        'Mumbai',
        'Maharashtra',
        '9000000001',
        'elite@salonbooking.com',
        '09:00',
        '21:00',
        'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
        `{${SALON_IMAGE_URLS.slice(0, 2).map(u => `"${u}"`).join(',')}}`,
      ]
    );
    const salon1Id = salon1Res.rows[0].id;
    console.log('✓ Elite Unisex Salon created');

    // Salon 2
    const salon2Res = await client.query(
      `INSERT INTO salons (owner_id, name, description, address, city, state, phone, email,
                           opening_time, closing_time, working_days, images, is_approved, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, true) RETURNING id`,
      [
        shop2Id,
        'Luxe Hair Studios',
        'Exclusive beauty destination specializing in trendy hair colors, treatments, and luxury grooming for men and women.',
        '456 Beauty Lane, Andheri',
        'Mumbai',
        'Maharashtra',
        '9000000002',
        'luxe@salonbooking.com',
        '10:00',
        '22:00',
        'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
        `{${SALON_IMAGE_URLS.slice(1, 3).map(u => `"${u}"`).join(',')}}`,
      ]
    );
    const salon2Id = salon2Res.rows[0].id;
    console.log('✓ Luxe Hair Studios created');

    // ========== STAFF ==========
    console.log('[seed] Adding staff...');
    
    const staffData1 = [
      { name: 'Rajesh Kumar', email: 'rajesh@elite.com', phone: '9100000001', role: 'senior_stylist', spec: 'Hair Coloring & Treatments' },
      { name: 'Meera Saxena', email: 'meera@elite.com', phone: '9100000002', role: 'stylist', spec: 'Cutting & Styling' },
      { name: 'Vikram Singh', email: 'vikram@elite.com', phone: '9100000003', role: 'makeup_artist', spec: 'Bridal & Party Makeup' },
    ];

    for (const staff of staffData1) {
      await client.query(
        `INSERT INTO staff (salon_id, name, email, phone, role, specialization, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [salon1Id, staff.name, staff.email, staff.phone, staff.role, staff.spec]
      );
    }
    console.log(`✓ ${staffData1.length} staff added to Elite Unisex Salon`);

    const staffData2 = [
      { name: 'Aisha Patel', email: 'aisha@luxe.com', phone: '9200000001', role: 'senior_stylist', spec: 'Hair Color & Highlights' },
      { name: 'Samantha Roy', email: 'samantha@luxe.com', phone: '9200000002', role: 'stylist', spec: 'Modern Haircuts' },
    ];

    for (const staff of staffData2) {
      await client.query(
        `INSERT INTO staff (salon_id, name, email, phone, role, specialization, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [salon2Id, staff.name, staff.email, staff.phone, staff.role, staff.spec]
      );
    }
    console.log(`✓ ${staffData2.length} staff added to Luxe Hair Studios`);

    // ========== SERVICES ==========
    console.log('[seed] Adding services...');
    
    const services1 = [
      { name: 'Haircut', description: 'Professional haircut with styling', price: 500, duration: 45, category: 'Hair' },
      { name: 'Hair Color', description: 'Full head coloring with premium colors', price: 1500, duration: 90, category: 'Hair' },
      { name: 'Bridal Makeup', description: 'Complete bridal makeup service', price: 2000, duration: 120, category: 'Makeup' },
      { name: 'Facial', description: 'Deep cleansing and rejuvenating facial', price: 800, duration: 60, category: 'Beauty' },
      { name: 'Waxing', description: 'Full body waxing service', price: 600, duration: 45, category: 'Beauty' },
    ];

    for (const service of services1) {
      await client.query(
        `INSERT INTO services (salon_id, name, description, price, duration, category, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [salon1Id, service.name, service.description, service.price, service.duration, service.category]
      );
    }
    console.log(`✓ ${services1.length} services added to Elite Unisex Salon`);

    const services2 = [
      { name: 'Hair Smoothening', description: 'Keratin hair smoothening treatment', price: 3000, duration: 180, category: 'Hair' },
      { name: 'Hair Spa', description: 'Intensive hair conditioning treatment', price: 1200, duration: 60, category: 'Hair' },
      { name: 'Party Makeup', description: 'Glamorous party makeup', price: 1500, duration: 90, category: 'Makeup' },
      { name: 'Threading', description: 'Eyebrow & facial threading', price: 300, duration: 30, category: 'Beauty' },
    ];

    for (const service of services2) {
      await client.query(
        `INSERT INTO services (salon_id, name, description, price, duration, category, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [salon2Id, service.name, service.description, service.price, service.duration, service.category]
      );
    }
    console.log(`✓ ${services2.length} services added to Luxe Hair Studios`);

    // ========== PRODUCTS ==========
    console.log('[seed] Adding products...');
    
    const products1 = [
      { name: 'Premium Hair Oil', description: 'Nourishing hair oil with coconut & almond extracts', price: 299, stock: 50, image: PRODUCT_IMAGE_URLS[0] },
      { name: 'Shampoo Sulfate-Free', description: 'Gentle shampoo for all hair types', price: 399, stock: 40, image: PRODUCT_IMAGE_URLS[1] },
      { name: 'Hair Conditioner', description: 'Deep conditioning treatment', price: 349, stock: 35, image: PRODUCT_IMAGE_URLS[2] },
      { name: 'Hair Serum', description: 'Frizz-control serum with argan oil', price: 449, stock: 30, image: PRODUCT_IMAGE_URLS[3] },
      { name: 'Hair Mask', description: 'Intensive moisture hair mask', price: 499, stock: 25, image: PRODUCT_IMAGE_URLS[4] },
    ];

    for (const product of products1) {
      await client.query(
        `INSERT INTO products (salon_id, name, description, price, stock, image_urls, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [salon1Id, product.name, product.description, product.price, product.stock, `{${`"${product.image}"`}}`]
      );
    }
    console.log(`✓ ${products1.length} products added to Elite Unisex Salon`);

    const products2 = [
      { name: 'Keratin Smoothening Kit', description: 'Professional keratin treatment kit', price: 1299, stock: 20, image: PRODUCT_IMAGE_URLS[0] },
      { name: 'Color Protection Shampoo', description: 'Protects color-treated hair', price: 499, stock: 35, image: PRODUCT_IMAGE_URLS[1] },
      { name: 'Hair Growth Serum', description: 'Stimulates hair growth naturally', price: 599, stock: 28, image: PRODUCT_IMAGE_URLS[2] },
      { name: 'Hair Brush Set', description: 'Professional salon-grade brush set', price: 899, stock: 15, image: PRODUCT_IMAGE_URLS[3] },
      { name: 'Hair Straightener Spray', description: 'Heat protectant straightening spray', price: 349, stock: 40, image: PRODUCT_IMAGE_URLS[4] },
    ];

    for (const product of products2) {
      await client.query(
        `INSERT INTO products (salon_id, name, description, price, stock, image_urls, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)`,
        [salon2Id, product.name, product.description, product.price, product.stock, `{${`"${product.image}"`}}`]
      );
    }
    console.log(`✓ ${products2.length} products added to Luxe Hair Studios`);

    await client.query('COMMIT');
    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('─ Admin: admin@salon.com / admin123');
    console.log('─ Shopkeeper 1: elite@salon.com / shop1234');
    console.log('─ Shopkeeper 2: luxe@salon.com / shop5678');
    console.log('─ Customers: priya@user.com, ananya@user.com, sneha@user.com, zara@user.com, kavya@user.com (password: customer1-5)');

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await clearDatabase();
    await seedDatabase();
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
