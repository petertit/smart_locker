const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: ".env.login" }); // load file .env.login

const app = express();
app.use(cors());
app.use(express.json());

// ===== Kết nối MongoDB theo .env =====
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
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { collection: "account" }
);

const Account = mongoose.model("Account", accountSchema);

// ===== API =====
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exist = await Account.findOne({ email });
    if (exist) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const account = new Account({ username, email, password });
    await account.save();
    res.json({ message: "Register successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email, password });
    if (!account) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({
      message: "Login successful",
      user: { id: account._id, email: account.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
// --- IGNORE ---
