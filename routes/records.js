const { Router } = require("express");

const fields = [
  ["title", "Title", 3, 80],
  ["category", "Category", 2, 40],
  ["description", "Description", 5, 300]
];
const statuses = ["Pending", "In progress", "Completed"];

function createRecordsRouter(database) {
  const router = Router();

  router.param("id", (req, res, next, value) => {
    const id = Number(value);
    if (!/^[0-9]+$/.test(value) || !Number.isSafeInteger(id) || id < 1) {
      return res.status(400).json({ message: "ID must be a positive whole number." });
    }
    req.recordId = id;
    next();
  });

  function validateRecord(req, res, next) {
    const values = [];
    for (const [name, label, min, max] of fields) {
      const text = req.body?.[name];
      const value = typeof text === "string" ? text.trim() : "";
      const length = Array.from(value).length;
      if (length < min || length > max || value.includes("\0")) {
        return res.status(400).json({ message: `${label} must have ${min} to ${max} characters of text.` });
      }
      values.push(value);
    }
    const status = req.body?.status;
    if (typeof status !== "string" || !statuses.includes(status.trim())) {
      return res.status(400).json({ message: "Status must be Pending, In progress, or Completed." });
    }
    req.recordValues = [...values, status.trim()];
    next();
  }

  function missingRecord(res) {
    return res.status(404).json({ message: "Record not found." });
  }

  router.get("/", async (req, res) => {
    res.json(await database.all("SELECT id, title, category, description, status FROM records ORDER BY id"));
  });

  router.get("/:id", async (req, res) => {
    const record = await database.first("SELECT * FROM records WHERE id = ?", req.recordId);
    return record ? res.json(record) : missingRecord(res);
  });

  router.post("/", validateRecord, async (req, res) => {
    const record = await database.first(
      "INSERT INTO records (title, category, description, status) VALUES (?, ?, ?, ?) RETURNING *",
      ...req.recordValues
    );
    res.location(`/api/records/${record.id}`).status(201).json(record);
  });

  router.put("/:id", validateRecord, async (req, res) => {
    const record = await database.first(
      "UPDATE records SET title = ?, category = ?, description = ?, status = ? WHERE id = ? RETURNING *",
      ...req.recordValues,
      req.recordId
    );
    return record ? res.json(record) : missingRecord(res);
  });

  router.delete("/:id", async (req, res) => {
    const record = await database.first("DELETE FROM records WHERE id = ? RETURNING id", req.recordId);
    return record ? res.json({ message: "Record deleted." }) : missingRecord(res);
  });

  return router;
}

module.exports = { createRecordsRouter };
