// pg.js - PostgreSQL setup for Render.com service
require('dotenv').config();
const { Client } = require('pg');

// Use Render's DATABASE_URL if available, else fallback to .env variables
const connectionString = process.env.DATABASE_URL || undefined;
//const connectionString = undefined;


const client = new Client(
  connectionString
    ? { connectionString, ssl: { rejectUnauthorized: false } }
    : {
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: process.env.PG_PORT,
      }
);

async function connectPg() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL (Render/Local)');
  } catch (err) {
    console.error('PostgreSQL connection error:', err.stack);
    throw err;
  }
}

module.exports = {
  client,
  connectPg,
};
