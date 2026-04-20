const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const MIGRATION_TABLE = 'schema_migrations';

function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

async function ensureMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(client) {
  const result = await client.query(`SELECT filename FROM ${MIGRATION_TABLE}`);
  return new Set(result.rows.map((row) => row.filename));
}

async function applyMigration(client, filename) {
  const migrationPath = path.join(MIGRATIONS_DIR, filename);
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  await client.query('BEGIN');
  try {
    await client.query(migrationSql);
    await client.query(
      `INSERT INTO ${MIGRATION_TABLE} (filename) VALUES ($1)`,
      [filename]
    );
    await client.query('COMMIT');
    console.log(`Applied migration: ${filename}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function initDatabase() {
  const client = await pool.connect();
  try {
    const migrationFiles = getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('No database migrations found');
      return;
    }

    await ensureMigrationTable(client);
    const appliedMigrations = await getAppliedMigrations(client);

    for (const filename of migrationFiles) {
      if (appliedMigrations.has(filename)) {
        continue;
      }

      await applyMigration(client, filename);
    }

    console.log('Database migrations completed successfully');
  } catch (err) {
    console.error('Database initialization error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
