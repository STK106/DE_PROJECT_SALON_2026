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
    ];

    const [, shopkeeperId, user1Id, user2Id] = await Promise.all(
      sampleUsers.map((user) => upsertUser(client, user))
    );

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
          ($1, $2, $10, $8, $11, '15:00', '16:00', 'completed', 'Sample seed: evening cleanup')
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
    console.log('  Users      -> sample.user1@salon.com / User@123');
    console.log('             -> sample.user2@salon.com / User@123');
    console.log(`Salon created/updated with id: ${salonId}`);
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