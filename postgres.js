const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { Pool } = require("pg");

// The shared routes use SQLite-style positional parameters.
function postgresSql(sql) {
  let index = 0;
  return sql.replaceAll("?", () => "$" + ++index);
}

async function openPostgres(connectionString) {
  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
  pool.on("error", error => console.error("Postgres connection error:", error.code || error.name));
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Serialize initialization so concurrent starts cannot insert the sample tickets twice.
      await client.query("SELECT pg_advisory_xact_lock(72125117)");
      await client.query(readFileSync(join(__dirname, "schema-postgres.sql"), "utf8"));
      await client.query(readFileSync(join(__dirname, "seed-postgres.sql"), "utf8"));
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    await pool.end();
    throw error;
  }

  return {
    async all(sql, ...params) {
      return (await pool.query(postgresSql(sql), params)).rows;
    },
    async first(sql, ...params) {
      return (await pool.query(postgresSql(sql), params)).rows[0];
    }
  };
}

module.exports = { openPostgres };
