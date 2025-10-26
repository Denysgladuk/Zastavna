import express from "express";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const {
  PORT = 3000,
  JWT_SECRET = "dev-secret",
  ADMIN_LOGIN = "admin",
  ADMIN_PASSWORD = "admin",
  FRONTEND_ORIGIN = "*"
} = process.env;

const app = express();

// ================= SECURITY =================
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

app.use(cors({ origin: FRONTEND_ORIGIN === "*" ? true : FRONTEND_ORIGIN }));
app.use(express.json({ limit: "10mb" })); // Збільшено для base64 зображень

// ================= STATIC FRONTEND =================
const rootDir = path.join(__dirname, "..");
app.use(express.static(rootDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

app.get("/*", (req, res, next) => {
  if (req.path.endsWith(".html") || req.path === "/" || req.path === "") {
    res.sendFile(path.join(rootDir, req.path));
  } else if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(rootDir, "index.html"));
  } else next();
});

// ================= DATABASE =================
const db = await open({
  filename: path.join(__dirname, "db.sqlite"),
  driver: sqlite3.Database
});

await db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image TEXT,
    is_published INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    comment TEXT,
    status TEXT DEFAULT 'new',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Додати колонку image якщо її немає
try {
  await db.exec(`ALTER TABLE news ADD COLUMN image TEXT;`);
  console.log("✅ Колонку 'image' додано до таблиці news");
} catch (e) {
  // Колонка вже існує
}

// ================= ADMIN SEED =================
const admin = await db.get("SELECT id FROM users WHERE login = ?", ADMIN_LOGIN);
if (!admin) {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await db.run("INSERT INTO users (login, password_hash) VALUES (?, ?)", ADMIN_LOGIN, hash);
  console.log(`✅ Admin user created: ${ADMIN_LOGIN}`);
}

// ================= HELPERS =================
function auth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function ok(res, data) { res.json(data); }
function bad(res, msg = "Bad request", code = 400) { res.status(code).json({ message: msg }); }
function toBool(v) { return v === true || v === "true" || v === 1 || v === "1"; }

// ================= AUTH =================
app.post("/api/auth/login", async (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password) return bad(res, "Login and password required");
  const user = await db.get("SELECT * FROM users WHERE login = ?", login);
  if (!user) return bad(res, "Invalid credentials", 401);
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return bad(res, "Invalid credentials", 401);
  const token = jwt.sign({ uid: user.id, login: user.login }, JWT_SECRET, { expiresIn: "7d" });
  ok(res, { token });
});

// ================= NEWS =================
app.get("/api/news", async (req, res) => {
  const { limit = 50, published = "true" } = req.query;
  const onlyPublished = toBool(published);
  const rows = await db.all(
    `SELECT id, title, content, image, is_published, created_at, updated_at
     FROM news
     ${onlyPublished ? "WHERE is_published = 1" : ""}
     ORDER BY created_at DESC
     LIMIT ?`,
    Number(limit)
  );
  ok(res, rows);
});

app.get("/api/news/:id", async (req, res) => {
  const row = await db.get(
    "SELECT id, title, content, image, is_published, created_at, updated_at FROM news WHERE id = ?",
    req.params.id
  );
  if (!row) return bad(res, "Not found", 404);
  ok(res, row);
});

app.post("/api/news", auth, async (req, res) => {
  const { title, content, image, is_published = true } = req.body || {};
  if (!title || !content) return bad(res, "title and content are required");
  const r = await db.run(
    "INSERT INTO news (title, content, image, is_published) VALUES (?, ?, ?, ?)",
    title, content, image || null, toBool(is_published) ? 1 : 0
  );
  const row = await db.get("SELECT * FROM news WHERE id = ?", r.lastID);
  ok(res, row);
});

app.put("/api/news/:id", auth, async (req, res) => {
  const { title, content, image, is_published } = req.body || {};
  const old = await db.get("SELECT * FROM news WHERE id = ?", req.params.id);
  if (!old) return bad(res, "Not found", 404);
  await db.run(
    `UPDATE news SET title=?, content=?, image=?, is_published=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    title ?? old.title,
    content ?? old.content,
    image !== undefined ? image : old.image,
    is_published === undefined ? old.is_published : (toBool(is_published) ? 1 : 0),
    req.params.id
  );
  const row = await db.get("SELECT * FROM news WHERE id = ?", req.params.id);
  ok(res, row);
});

app.delete("/api/news/:id", auth, async (req, res) => {
  const r = await db.run("DELETE FROM news WHERE id = ?", req.params.id);
  if (!r.changes) return bad(res, "Not found", 404);
  ok(res, { deleted: true });
});

// ================= APPOINTMENTS =================
app.post("/api/appointments", async (req, res) => {
  const { full_name, phone, appointment_date, comment = "" } = req.body || {};
  if (!full_name || !phone || !appointment_date) {
    return bad(res, "full_name, phone, appointment_date are required");
  }
  const r = await db.run(
    "INSERT INTO appointments (full_name, phone, appointment_date, comment) VALUES (?, ?, ?, ?)",
    full_name.trim(), phone.trim(), appointment_date, comment.trim()
  );
  const row = await db.get("SELECT * FROM appointments WHERE id = ?", r.lastID);
  ok(res, row);
});

app.get("/api/appointments", auth, async (req, res) => {
  const { status, limit = 100 } = req.query;
  const rows = await db.all(
    `SELECT * FROM appointments
     ${status ? "WHERE status = ?" : ""}
     ORDER BY created_at DESC
     LIMIT ?`,
    ...(status ? [status, Number(limit)] : [Number(limit)])
  );
  ok(res, rows);
});

app.put("/api/appointments/:id", auth, async (req, res) => {
  const old = await db.get("SELECT * FROM appointments WHERE id = ?", req.params.id);
  if (!old) return bad(res, "Not found", 404);
  const { full_name, phone, appointment_date, comment, status } = req.body || {};
  await db.run(
    `UPDATE appointments
     SET full_name=?, phone=?, appointment_date=?, comment=?, status=?, updated_at=CURRENT_TIMESTAMP
     WHERE id=?`,
    full_name ?? old.full_name,
    phone ?? old.phone,
    appointment_date ?? old.appointment_date,
    comment ?? old.comment,
    status ?? old.status,
    req.params.id
  );
  const row = await db.get("SELECT * FROM appointments WHERE id = ?", req.params.id);
  ok(res, row);
});

app.delete("/api/appointments/:id", auth, async (req, res) => {
  const r = await db.run("DELETE FROM appointments WHERE id = ?", req.params.id);
  if (!r.changes) return bad(res, "Not found", 404);
  ok(res, { deleted: true });
});

// ================= HEALTH =================
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ================= SERVER START =================
app.listen(PORT, () => {
  console.log(`✅ Running on http://localhost:${PORT}`);
});