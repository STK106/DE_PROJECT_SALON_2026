const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const REQUIRED_DB_ENV = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

function getMissingDbEnvVars() {
  return REQUIRED_DB_ENV.filter((key) => {
    const value = process.env[key];
    return !value || !String(value).trim();
  });
}

function printDbEnvCheck() {
  const missingVars = getMissingDbEnvVars();

  if (missingVars.length > 0) {
    console.warn(
      `[seed] Missing DB env vars: ${missingVars.join(', ')}. Falling back to defaults from config/db.js where available.`
    );
  } else {
    console.log('[seed] All DB env vars are present.');
  }

  const resolved = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '5432',
    database: process.env.DB_NAME || 'salon_booking',
    user: process.env.DB_USER || 'postgres',
    passwordSet: Boolean(process.env.DB_PASSWORD && String(process.env.DB_PASSWORD).trim()),
  };

  console.log(
    `[seed] Using DB host=${resolved.host} port=${resolved.port} database=${resolved.database} user=${resolved.user} passwordSet=${resolved.passwordSet}`
  );
}

async function upsertUser(client, user) {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const result = await client.query(
    `
      INSERT INTO users (name, email, password, phone, role, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      ON CONFLICT (email)
      DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        is_active = true,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `,
    [user.name, user.email, passwordHash, user.phone, user.role]
  );

  return result.rows[0].id;
}

async function upsertSalon(client, salon) {
  const existing = await client.query(
    'SELECT id FROM salons WHERE owner_id = $1 AND name = $2 LIMIT 1',
    [salon.ownerId, salon.name]
  );

  if (existing.rows.length > 0) {
    const salonId = existing.rows[0].id;
    await client.query(
      `
        UPDATE salons
        SET description = $1,
            address = $2,
            city = $3,
            state = $4,
            phone = $5,
            email = $6,
            opening_time = $7,
            closing_time = $8,
            working_days = $9,
            is_approved = true,
            is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
      `,
      [
        salon.description,
        salon.address,
        salon.city,
        salon.state,
        salon.phone,
        salon.email,
        salon.openingTime,
        salon.closingTime,
        salon.workingDays,
        salonId,
      ]
    );

    return salonId;
  }

  const inserted = await client.query(
    `
      INSERT INTO salons (
        owner_id,
        name,
        description,
        address,
        city,
        state,
        phone,
        email,
        opening_time,
        closing_time,
        working_days,
        is_approved,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, true)
      RETURNING id
    `,
    [
      salon.ownerId,
      salon.name,
      salon.description,
      salon.address,
      salon.city,
      salon.state,
      salon.phone,
      salon.email,
      salon.openingTime,
      salon.closingTime,
      salon.workingDays,
    ]
  );

  return inserted.rows[0].id;
}

async function upsertService(client, service) {
  const existing = await client.query(
    'SELECT id FROM services WHERE salon_id = $1 AND name = $2 LIMIT 1',
    [service.salonId, service.name]
  );

  if (existing.rows.length > 0) {
    const serviceId = existing.rows[0].id;
    await client.query(
      `
        UPDATE services
        SET description = $1,
            price = $2,
            duration = $3,
            category = $4,
            is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `,
      [
        service.description,
        service.price,
        service.duration,
        service.category,
        serviceId,
      ]
    );

    return serviceId;
  }

  const inserted = await client.query(
    `
      INSERT INTO services (salon_id, name, description, price, duration, category, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id
    `,
    [
      service.salonId,
      service.name,
      service.description,
      service.price,
      service.duration,
      service.category,
    ]
  );

  return inserted.rows[0].id;
}

async function upsertStaff(client, staff) {
  const existing = await client.query(
    'SELECT id FROM staff WHERE salon_id = $1 AND email = $2 LIMIT 1',
    [staff.salonId, staff.email]
  );

  if (existing.rows.length > 0) {
    const staffId = existing.rows[0].id;
    await client.query(
      `
        UPDATE staff
        SET name = $1,
            phone = $2,
            role = $3,
            specialization = $4,
            is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `,
      [staff.name, staff.phone, staff.role, staff.specialization, staffId]
    );

    return staffId;
  }

  const inserted = await client.query(
    `
      INSERT INTO staff (salon_id, name, email, phone, role, specialization, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id
    `,
    [
      staff.salonId,
      staff.name,
      staff.email,
      staff.phone,
      staff.role,
      staff.specialization,
    ]
  );

  return inserted.rows[0].id;
}

async function upsertProduct(client, product) {
  const existing = await client.query(
    'SELECT id FROM products WHERE salon_id = $1 AND name = $2 LIMIT 1',
    [product.salonId, product.name]
  );

  if (existing.rows.length > 0) {
    const productId = existing.rows[0].id;
    await client.query(
      `
        UPDATE products
        SET description = $1,
            price = $2,
            stock = $3,
            category = $4,
            is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
      `,
      [
        product.description,
        product.price,
        product.stock,
        product.category,
        productId,
      ]
    );

    return productId;
  }

  const inserted = await client.query(
    `
      INSERT INTO products (salon_id, name, description, price, stock, category, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id
    `,
    [
      product.salonId,
      product.name,
      product.description,
      product.price,
      product.stock,
      product.category,
    ]
  );

  return inserted.rows[0].id;
}

function dayOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

async function seed() {
  let client;

  try {
    printDbEnvCheck();
    client = await pool.connect();
    await client.query('BEGIN');

    const sampleUsers = [
      {
        name: 'Sample Admin',
        email: 'sample.admin@salon.com',
        password: 'Admin@123',
        phone: '+91-9000001000',
        role: 'admin',
      },
      {
        name: 'Alex Barber',
        email: 'sample.shopkeeper@salon.com',
        password: 'Shopkeeper@123',
        phone: '+91-9000002000',
        role: 'shopkeeper',
      },
      {
        name: 'Maya Owner',
        email: 'sample.shopkeeper2@salon.com',
        password: 'Shopkeeper@123',
        phone: '+91-9000002500',
        role: 'shopkeeper',
      },
      {
        name: 'Priya Customer',
        email: 'sample.user1@salon.com',
        password: 'User@123',
        phone: '+91-9000003000',
        role: 'user',
      },
      {
        name: 'Rohit Customer',
        email: 'sample.user2@salon.com',
        password: 'User@123',
        phone: '+91-9000004000',
        role: 'user',
      },
      {
        name: 'Neha Customer',
        email: 'sample.user3@salon.com',
        password: 'User@123',
        phone: '+91-9000005000',
        role: 'user',
      },
    ];

    const seededUserIds = [];
    for (const user of sampleUsers) {
      seededUserIds.push(await upsertUser(client, user));
    }

    const [, shopkeeperId, shopkeeper2Id, user1Id, user2Id, user3Id] = seededUserIds;

    const salonId = await upsertSalon(client, {
      ownerId: shopkeeperId,
      name: 'Sample Unisex Studio',
      description: 'Seeded salon for API and UI testing.',
      address: '221B MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      phone: '+91-9111111111',
      email: 'sample.studio@salon.com',
      openingTime: '09:00',
      closingTime: '21:00',
      workingDays: 'Mon,Tue,Wed,Thu,Fri,Sat,Sun',
    });

    const salon2Id = await upsertSalon(client, {
      ownerId: shopkeeperId,
      name: 'Downtown Groom Lab',
      description: 'Second seeded salon for multi-salon owner testing.',
      address: '18 Residency Lane',
      city: 'Bengaluru',
      state: 'Karnataka',
      phone: '+91-9444444444',
      email: 'downtown.lab@salon.com',
      openingTime: '10:00',
      closingTime: '20:00',
      workingDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
    });

    const salon3Id = await upsertSalon(client, {
      ownerId: shopkeeper2Id,
      name: 'Glow & Style Lounge',
      description: 'Seeded salon owned by a second shopkeeper.',
      address: '44 Lake View Road',
      city: 'Mysuru',
      state: 'Karnataka',
      phone: '+91-9555555555',
      email: 'glow.style@salon.com',
      openingTime: '09:30',
      closingTime: '19:30',
      workingDays: 'Tue,Wed,Thu,Fri,Sat,Sun',
    });

    const salon4Id = await upsertSalon(client, {
      ownerId: shopkeeper2Id,
      name: 'Urban Cut Collective',
      description: 'Modern grooming space for haircut and beard services.',
      address: '72 Temple Street',
      city: 'Hubballi',
      state: 'Karnataka',
      phone: '+91-9666666666',
      email: 'urban.cut@salon.com',
      openingTime: '08:30',
      closingTime: '18:30',
      workingDays: 'Mon,Tue,Wed,Thu,Fri,Sat',
    });

    const salon5Id = await upsertSalon(client, {
      ownerId: shopkeeperId,
      name: 'Silk Touch Beauty Bar',
      description: 'Beauty and hair care salon seeded for end-to-end testing.',
      address: '9 Park Avenue',
      city: 'Mangaluru',
      state: 'Karnataka',
      phone: '+91-9777777777',
      email: 'silk.touch@salon.com',
      openingTime: '11:00',
      closingTime: '20:30',
      workingDays: 'Wed,Thu,Fri,Sat,Sun',
    });

    const haircutId = await upsertService(client, {
      salonId,
      name: 'Haircut + Wash',
      description: 'Haircut with quick wash and styling.',
      price: 499,
      duration: 45,
      category: 'Hair',
    });

    const beardId = await upsertService(client, {
      salonId,
      name: 'Beard Grooming',
      description: 'Trim, shape, and beard line-up.',
      price: 299,
      duration: 30,
      category: 'Beard',
    });

    const cleanupId = await upsertService(client, {
      salonId,
      name: 'Cleanup Facial',
      description: 'Basic face cleanup and hydration.',
      price: 699,
      duration: 60,
      category: 'Skin',
    });

    await upsertService(client, {
      salonId: salon2Id,
      name: 'Premium Hair Spa',
      description: 'Deep conditioning and scalp nourishment.',
      price: 1199,
      duration: 75,
      category: 'Hair',
    });

    await upsertService(client, {
      salonId: salon2Id,
      name: 'Express Cleanup',
      description: 'Fast skin cleanup for regular maintenance.',
      price: 499,
      duration: 40,
      category: 'Skin',
    });

    await upsertService(client, {
      salonId: salon3Id,
      name: 'Bridal Makeup Trial',
      description: 'Preview bridal look with product matching.',
      price: 2499,
      duration: 90,
      category: 'Makeup',
    });

    await upsertService(client, {
      salonId: salon3Id,
      name: 'Keratin Smoothening',
      description: 'Hair smoothening and frizz reduction treatment.',
      price: 3499,
      duration: 120,
      category: 'Hair',
    });

    await upsertService(client, {
      salonId: salon4Id,
      name: 'Classic Fade Cut',
      description: 'Precision fade with beard edge cleanup.',
      price: 549,
      duration: 45,
      category: 'Hair',
    });

    await upsertService(client, {
      salonId: salon4Id,
      name: 'Royal Shave',
      description: 'Hot towel shave with premium finish.',
      price: 399,
      duration: 30,
      category: 'Beard',
    });

    await upsertService(client, {
      salonId: salon5Id,
      name: 'Hair Coloring',
      description: 'Full hair coloring with consultation.',
      price: 1799,
      duration: 90,
      category: 'Hair',
    });

    await upsertService(client, {
      salonId: salon5Id,
      name: 'Party Makeup',
      description: 'Occasion makeup with styling touch-up.',
      price: 2199,
      duration: 75,
      category: 'Makeup',
    });

    await upsertProduct(client, {
      salonId,
      name: 'Argan Hair Serum',
      description: 'Frizz control serum for daily hair care.',
      price: 799,
      stock: 24,
      category: 'Hair Care',
    });

    await upsertProduct(client, {
      salonId: salon2Id,
      name: 'Scalp Detox Shampoo',
      description: 'Deep cleansing shampoo for oily scalp.',
      price: 649,
      stock: 18,
      category: 'Hair Care',
    });

    await upsertProduct(client, {
      salonId: salon3Id,
      name: 'Hydra Glow Face Mask',
      description: 'Hydrating mask for instant glow.',
      price: 499,
      stock: 30,
      category: 'Skin Care',
    });

    await upsertProduct(client, {
      salonId: salon4Id,
      name: 'Beard Styling Balm',
      description: 'Strong hold beard balm with natural finish.',
      price: 399,
      stock: 22,
      category: 'Beard Care',
    });

    await upsertProduct(client, {
      salonId: salon5Id,
      name: 'Color Protect Conditioner',
      description: 'Conditioner that preserves colored hair.',
      price: 749,
      stock: 16,
      category: 'Hair Care',
    });

    const stylist1Id = await upsertStaff(client, {
      salonId,
      name: 'Sam Stylist',
      email: 'sample.staff1@salon.com',
      phone: '+91-9222222222',
      role: 'Senior Stylist',
      specialization: 'Haircuts and styling',
    });

    const stylist2Id = await upsertStaff(client, {
      salonId,
      name: 'Nina Artist',
      email: 'sample.staff2@salon.com',
      phone: '+91-9333333333',
      role: 'Skin Specialist',
      specialization: 'Facials and skin care',
    });

    await upsertStaff(client, {
      salonId: salon2Id,
      name: 'Rakesh Fade',
      email: 'sample.staff3@salon.com',
      phone: '+91-9440000001',
      role: 'Hair Expert',
      specialization: 'Hair spa and smoothening',
    });

    await upsertStaff(client, {
      salonId: salon2Id,
      name: 'Tina Glow',
      email: 'sample.staff4@salon.com',
      phone: '+91-9440000002',
      role: 'Beauty Therapist',
      specialization: 'Cleanup and skin treatments',
    });

    await upsertStaff(client, {
      salonId: salon3Id,
      name: 'Aisha Makeup',
      email: 'sample.staff5@salon.com',
      phone: '+91-9550000001',
      role: 'Makeup Artist',
      specialization: 'Party and bridal makeup',
    });

    await upsertStaff(client, {
      salonId: salon3Id,
      name: 'Karan Smooth',
      email: 'sample.staff6@salon.com',
      phone: '+91-9550000002',
      role: 'Hair Technician',
      specialization: 'Keratin and hair repair',
    });

    await upsertStaff(client, {
      salonId: salon4Id,
      name: 'Dev Clipper',
      email: 'sample.staff7@salon.com',
      phone: '+91-9660000001',
      role: 'Barber',
      specialization: 'Fade cuts and shaves',
    });

    await upsertStaff(client, {
      salonId: salon4Id,
      name: 'Imran Beard',
      email: 'sample.staff8@salon.com',
      phone: '+91-9660000002',
      role: 'Grooming Specialist',
      specialization: 'Shave and beard styling',
    });

    await upsertStaff(client, {
      salonId: salon5Id,
      name: 'Pooja Colors',
      email: 'sample.staff9@salon.com',
      phone: '+91-9770000001',
      role: 'Color Expert',
      specialization: 'Hair color and highlights',
    });

    await upsertStaff(client, {
      salonId: salon5Id,
      name: 'Riya Glam',
      email: 'sample.staff10@salon.com',
      phone: '+91-9770000002',
      role: 'Makeup Artist',
      specialization: 'Party and occasion makeup',
    });

    await client.query("DELETE FROM bookings WHERE notes LIKE 'Sample seed:%'");
    await client.query("DELETE FROM blocked_slots WHERE reason LIKE 'Sample seed:%'");

    await client.query(
      `
        INSERT INTO bookings (
          user_id, salon_id, service_id, staff_id,
          booking_date, start_time, end_time, status, notes
        )
        VALUES
          ($1, $2, $3, $4, $5, '10:00', '10:45', 'confirmed', 'Sample seed: morning haircut'),
          ($6, $2, $7, $12, $9, '12:00', '12:30', 'pending', 'Sample seed: lunch beard trim'),
          ($1, $2, $10, $8, $11, '15:00', '16:00', 'completed', 'Sample seed: evening cleanup'),
          ($6, $2, $3, null, $13, '16:30', '17:15', 'pending', 'Sample seed: no preference haircut'),
          ($1, $2, $7, $4, $14, '18:00', '18:30', 'confirmed', 'Sample seed: evening beard session')
      `,
      [
        user1Id,
        salonId,
        haircutId,
        stylist1Id,
        dayOffset(1),
        user2Id,
        beardId,
        stylist1Id,
        dayOffset(2),
        cleanupId,
        dayOffset(-1),
        stylist2Id,
        dayOffset(3),
        dayOffset(4),
      ]
    );

    await client.query(
      `
        INSERT INTO blocked_slots (salon_id, blocked_date, start_time, end_time, reason, is_full_day)
        VALUES
          ($1, $2, '13:00', '14:00', 'Sample seed: staff meeting', false),
          ($1, $3, null, null, 'Sample seed: maintenance day', true)
      `,
      [salonId, dayOffset(1), dayOffset(5)]
    );

    await client.query('COMMIT');

    console.log('Sample data seeded successfully.');
    console.log('Test accounts:');
    console.log('  Admin      -> sample.admin@salon.com / Admin@123');
    console.log('  Shopkeeper -> sample.shopkeeper@salon.com / Shopkeeper@123');
    console.log('  Shopkeeper -> sample.shopkeeper2@salon.com / Shopkeeper@123');
    console.log('  Users      -> sample.user1@salon.com / User@123');
    console.log('             -> sample.user2@salon.com / User@123');
    console.log('             -> sample.user3@salon.com / User@123');
    console.log(`Salons created/updated with ids: ${salonId}, ${salon2Id}, ${salon3Id}, ${salon4Id}, ${salon5Id}`);
  } catch (error) {
    if (client) {
      await client.query('ROLLBACK');
    }

    if (error && error.code === '28P01') {
      console.error('[seed] Authentication failed (Postgres error 28P01). Check DB_USER and DB_PASSWORD in backend/.env.');
    }

    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

seed();