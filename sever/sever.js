const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Kết nối MongoDB local (theo Compass bạn đang dùng local)
mongoose
  .connect("mongodb://127.0.0.1:27017/smart_box", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB: smart_box"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 🔹 Tạo Schema cho collection account
const accountSchema = new mongoose.Schema(
  {
    username: String,
    password: String,
    email: String,
  },
  { collection: "account" }
); // chỉ định đúng collection "account"

const Account = mongoose.model("Account", accountSchema);

// API test
app.get("/", (req, res) => {
  res.send("Backend server is running with MongoDB!");
});

// API thêm account
app.post("/accounts", async (req, res) => {
  try {
    const account = new Account(req.body);
    await account.save();
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API lấy danh sách account
app.get("/accounts", async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
