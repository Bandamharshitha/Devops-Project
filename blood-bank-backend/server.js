const express = require("express");
const mysql = require("mysql2");
const app = express();
const PORT = process.env.PORT || 5000;

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "example",
  database: process.env.DB_NAME || "bloodbank"
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
  console.log("✅ Connected to MySQL Database");
});

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Blood Bank Backend Running!");
});

app.get("/donors", (req, res) => {
  db.query("SELECT * FROM donors", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
