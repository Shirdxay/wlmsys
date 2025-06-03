require('dotenv').config();
const { Client } = require('pg');

/**
 * Creates and returns a new PostgreSQL client instance using environment variables and optional overrides.
 *
 * @param {Object} [configOverrides={}] - Optional configuration properties to override the default environment-based settings.
 * @param {string} [configOverrides.user] - Database user name.
 * @param {string} [configOverrides.host] - Database host.
 * @param {string} [configOverrides.database] - Database name.
 * @param {string} [configOverrides.password] - Database password.
 * @param {number} [configOverrides.port] - Database port.
 * @returns {Client} A new instance of the PostgreSQL Client.
 */
function createPgClient(configOverrides = {}) {
  const client = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ...configOverrides,
  });
  return client;
}

/**
 * Connects the provided PostgreSQL client instance.
 *
 * @param {Client} client - The PostgreSQL client to connect.
 * @returns {Promise<void>} Resolves when the connection is successful.
 * @throws Will throw an error if the connection fails.
 */
async function connectPgClient(client) {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL');
    } catch (err) {
        console.error('Connection error', err.stack);
        throw err;
    }
}

module.exports = {
  createPgClient,
  connectPgClient,
};
