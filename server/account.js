import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config(); // Lấy biến môi trường từ Render (Environment Variables)

const app = express();
app.use(cors());
app.use(express.json());

// ===== Kết nối MongoDB Atlas =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Schema người dùng =====
const accountSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    hint: String,
  },
  { collection: "account" }
);

const Account = mongoose.model("Account", accountSchema);

// ========== AUTH ==========
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, hint } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: "Missing required fields" });

    const exist = await Account.findOne({ email });
    if (exist) return res.status(400).json({ error: "Email already exists" });

    const acc = new Account({ name, email, phone, password, hint });
    await acc.save();
    res.json({ message: "✅ Register successful", user: acc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const acc = await Account.findOne({ email, password });
    if (!acc) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ message: "✅ Login successful", user: acc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Cập nhật thông tin người dùng =====
app.post("/update", async (req, res) => {
  try {
    const { id, name, email, phone, password, hint } = req.body;
    const updated = await Account.findByIdAndUpdate(
      id,
      { name, email, phone, password, hint },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json({ message: "✅ Updated successfully", user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Bridge tới Raspberry Pi (qua ngrok) =====
const RASPI_URL = process.env.RASPI_URL; // ví dụ: https://xxxx.ngrok-free.app

app.get("/raspi/status", async (req, res) => {
  try {
    const r = await fetch(`${RASPI_URL}/status`);
    const data = await r.json();
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/raspi/capture", async (req, res) => {
  try {
    const r = await fetch(`${RASPI_URL}/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/raspi/recognize", async (req, res) => {
  try {
    const r = await fetch(`${RASPI_URL}/recognize`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Start server =====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
