// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- DB config: change password/user as needed ---
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Navyaswamy",   // <-- replace with your MySQL password
  database: "bloodbank"
});

// Connect to database
db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

// Helper: convert DB row to frontend-friendly format
function rowToHospital(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    contact: row.contact,
    distance: row.distance,
    city: row.city,
    state: row.state,
    availability: {
      "A+":  { units: row.a_plus || 0, lastUpdated: row.last_updated ? row.last_updated.toISOString().split('T')[0] : null },
      "A-":  { units: row.a_minus || 0, lastUpdated: row.last_updated ? row.last_updated.toISOString().split('T')[0] : null },
      "B+":  { units: row.b_plus || 0, lastUpdated: row.last_updated ? row.last_updated.toISOString().split('T')[0] : null },
      "B-":  { units: row.b_minus || 0, lastUpdated: row.last_updated ? row.last_updated.toISOString().split('T')[0] : null },
      "O+":  { units: row.o_plus || 0, lastUpdated: row.last_updated ? row.last_updated.toISOString().split('T')[0] : null },
      "O-":  { units: row.o_minus || 0, lastUpdated: row.last_updated ? row.last_updated.toISOString().split('T')[0] : null },
      "AB+": { units: row.ab_plus || 0, lastUpdated: row.last_updated ? row.last_updated.toISOString().split('T')[0] : null },
      "AB-": { units: row.ab_minus || 0, lastUpdated: row.last_updated ? row.last_updated.toISOString().split('T')[0] : null }
    }
  };
}

// Convert blood type (A+, O-, etc.) -> DB column name (a_plus, o_minus, ...)
function bloodTypeToColumn(bt) {
  if (!bt) return null;
  return bt.replace('+','_plus').replace('-','_minus').toLowerCase();
}

// GET /api/find-blood?location=Hyderabad&bloodType=A+
app.get("/api/find-blood", (req, res) => {
  const location = req.query.location;
  const bloodType = req.query.bloodType;

  if (!location) {
    return res.status(400).json({ error: "location query param is required" });
  }

  let sql = "SELECT * FROM hospitals WHERE city = ?";
  const params = [location];

  if (bloodType) {
    const col = bloodTypeToColumn(bloodType);
    const allowedCols = ["a_plus","a_minus","b_plus","b_minus","o_plus","o_minus","ab_plus","ab_minus"];
    if (allowedCols.includes(col)) {
      sql += ` AND ${col} > 0`;
    }
  }

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("DB query err:", err);
      return res.status(500).json({ error: "DB query failed" });
    }
    const hospitals = rows.map(rowToHospital);
    res.json(hospitals);
  });
});

// POST /api/admin/add-hospital
app.post("/api/admin/add-hospital", (req, res) => {
  const body = req.body;
  const sql = `INSERT INTO hospitals
    (name, city, state, address, contact, distance,
     a_plus, a_minus, b_plus, b_minus, o_plus, o_minus, ab_plus, ab_minus, last_updated)
    VALUES (?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    body.name, body.city, body.state, body.address || "", body.contact || "", body.distance || "",
    body.a_plus || 0, body.a_minus || 0, body.b_plus || 0, body.b_minus || 0,
    body.o_plus || 0, body.o_minus || 0, body.ab_plus || 0, body.ab_minus || 0,
    new Date()
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Insert err:", err);
      return res.status(500).json({ error: "Insert failed" });
    }
    res.json({ message: "Hospital added", id: result.insertId });
  });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
