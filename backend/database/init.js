const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  const client = await pool.connect();
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split and execute statements
    await client.query(schema);
    console.log('Database schema created successfully');

    // Update admin password with proper bcrypt hash
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(
      `UPDATE users SET password = $1 WHERE email = 'admin@salon.com'`,
      [hashedPassword]
    );
    console.log('Default admin user created (admin@salon.com / admin123)');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
