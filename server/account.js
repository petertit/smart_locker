const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: ".env.login" }); // load file .env.login

const app = express();
app.use(cors());
app.use(express.json());

// ===== Kết nối MongoDB =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`✅ Connected to MongoDB: ${process.env.MONGO_URI}`))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== Schema & Model =====
const accountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    hint: { type: String },
  },
  { collection: "account" }
);

const Account = mongoose.model("Account", accountSchema);

// ======= API: Register =======
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, hint } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const exist = await Account.findOne({ email });
    if (exist) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const account = new Account({ name, email, phone, password, hint });
    await account.save();

    res.json({ message: "✅ Register successful", user: account });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======= API: Login =======
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email, password });

    if (!account) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    res.json({
      message: "✅ Login successful",
      user: {
        id: account._id,
        name: account.name,
        email: account.email,
        phone: account.phone,
        password: account.password,
        hint: account.hint,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======= API: Update user info =======
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
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ======= Khởi động server =======
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
// --- IGNORE ---
// ====== RasPi Bridge ======
import fetch from "node-fetch";

const RASPI_URL = "http://192.168.1.6:5000"; // địa chỉ nội bộ của RasPi trong mạng LAN

// Kiểm tra kết nối RasPi
app.get("/bridge/status", async (req, res) => {
  try {
    const response = await fetch(`${RASPI_URL}/status`);
    const data = await response.json();
    res.json({ ok: true, from: "RasPi", data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Gửi lệnh chụp ảnh và train
app.post("/bridge/capture", async (req, res) => {
  try {
    const { name } = req.body;
    const response = await fetch(`${RASPI_URL}/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Gửi yêu cầu nhận diện
app.get("/bridge/recognize", async (req, res) => {
  try {
    const response = await fetch(`${RASPI_URL}/recognize`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -- training data --

app.post("/api/upload-train", async (req, res) => {
  try {
    const { timestamp, model } = req.body;
    const TrainModel = mongoose.model(
      "TrainModel",
      new mongoose.Schema({
        timestamp: String,
        model: String,
      }),
      "train_models"
    );

    const saved = await new TrainModel({ timestamp, model }).save();
    res.json({ message: "Train model saved", id: saved._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/latest-train", async (req, res) => {
  const TrainModel = mongoose.model(
    "TrainModel",
    new mongoose.Schema({
      timestamp: String,
      model: String,
    }),
    "train_models"
  );

  const latest = await TrainModel.findOne().sort({ timestamp: -1 });
  if (!latest) return res.status(404).json({ error: "No model found" });
  res.json(latest);
});
