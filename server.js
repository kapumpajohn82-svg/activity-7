require("dotenv").config({ quiet: true });
const { createApp } = require("./app");
const { openDatabase } = require("./db");
const { openPostgres } = require("./postgres");

async function start() {
  const { DATABASE_URL, RENDER, RENDER_EXTERNAL_URL } = process.env;
  if ((RENDER === "true" || RENDER_EXTERNAL_URL) && !DATABASE_URL) {
    throw new Error("Set DATABASE_URL to the Internal Database URL from Render Postgres.");
  }

  const port = Number(process.env.PORT || 3000);
  const database = DATABASE_URL
    ? await openPostgres(DATABASE_URL)
    : openDatabase(process.env.DATABASE_PATH);
  const app = createApp(database, {
    baseUrl: process.env.API_BASE_URL || RENDER_EXTERNAL_URL || `http://localhost:${port}`,
    clientOrigins: process.env.CLIENT_ORIGINS
  });
  app.listen(port, "0.0.0.0", () => console.log(`API listening on port ${port}`));
}

start().catch(error => {
  console.error("API startup failed:", error.message);
  process.exitCode = 1;
});
