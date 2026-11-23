const express = require("express");
const cors = require("cors");
const { createRecordsRouter } = require("./routes/records");
const { renderGuide } = require("./guide");

const localFrontendOrigins = "http://localhost:5500,http://127.0.0.1:5500";

function createApp(database, { baseUrl, clientOrigins = localFrontendOrigins } = {}) {
  const app = express();
  const origins = clientOrigins.split(",").map(value => value.trim()).filter(Boolean);
  app.disable("x-powered-by");
  app.disable("etag");
  app.use(cors({ origin: origins }));
  app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  app.use(express.json({ limit: "16kb" }));

  app.get("/", (req, res) => res.type("html").send(renderGuide(baseUrl)));

  app.get("/health", async (req, res) => {
    try {
      await database.first("SELECT COUNT(*) AS count FROM records");
      res.json({ status: "ok", database: "ok" });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(503).json({ message: "Database unavailable." });
    }
  });

  app.use("/api/records", createRecordsRouter(database));

  app.use((req, res) => res.status(404).json({ message: "Route not found." }));

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error instanceof URIError && error.status === 400) {
      return res.status(400).json({ message: "Invalid URL encoding." });
    }
    switch (error.type) {
      case "entity.parse.failed":
        return res.status(400).json({ message: "Request body must contain valid JSON." });
      case "entity.too.large":
        return res.status(400).json({ message: "Request body is too large." });
      case "charset.unsupported":
      case "encoding.unsupported":
        return res.status(400).json({ message: "Send an application/json body encoded as UTF-8." });
      default:
        console.error("Backend request failed:", error);
        return res.status(500).json({ message: "An unexpected server error occurred." });
    }
  });

  return app;
}

module.exports = { createApp };
