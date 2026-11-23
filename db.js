const { DatabaseSync } = require("node:sqlite");
const { mkdirSync, readFileSync } = require("node:fs");
const { dirname, join, resolve } = require("node:path");

function openDatabase(filename = join(__dirname, "data", "records.sqlite")) {
  const location = filename === ":memory:" ? filename : resolve(filename);
  if (location !== ":memory:") {
    mkdirSync(dirname(location), { recursive: true });
  }
  const connection = new DatabaseSync(location);
  connection.exec("PRAGMA busy_timeout = 5000");
  connection.exec("BEGIN IMMEDIATE");
  try {
    connection.exec(readFileSync(join(__dirname, "schema.sql"), "utf8"));
    connection.exec(readFileSync(join(__dirname, "seed.sql"), "utf8"));
    connection.exec("COMMIT");
  } catch (error) {
    connection.exec("ROLLBACK");
    connection.close();
    throw error;
  }
  return {
    async all(sql, ...params) {
      return connection.prepare(sql).all(...params);
    },
    async first(sql, ...params) {
      return connection.prepare(sql).get(...params);
    }
  };
}

module.exports = { openDatabase };
