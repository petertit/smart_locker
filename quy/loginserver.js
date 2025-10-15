// ========================== LOGIN SERVER (PASSWORD ONLY) ==========================
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

// ------------------ CẤU HÌNH BẢO MẬT & CORS ------------------
app.use(
  cors({
    origin: ["http://127.0.0.1:5501", "http://localhost:5501"],
    credentials: true,
  })
);
app.use(express.json());
app.use(helmet());

// ------------------ KẾT NỐI MONGODB ------------------
mongoose
  .connect("mongodb://127.0.0.1:27017/account", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ------------------ DANH SÁCH LOCKER ------------------
const ALL_LOCKERS = [
  "Locker 01",
  "Locker 02",
  "Locker 03",
  "Locker 04",
  "Locker 05",
  "Locker 06",
  "Locker 07",
  "Locker 08",
  "Locker 09",
];

// ------------------ SCHEMAS ------------------
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  hintPassword: String,
  lockerLocation: { type: String, unique: true },
  currentStatus: { type: String, default: "CLOSED" }, // OPENED or CLOSED
});

const historySchema = new mongoose.Schema({
  email: String,
  locker: String,
  action: String, // REGISTERED, OPENED, CLOSED
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const LockerHistory = mongoose.model("LockerHistory", historySchema);

// ======================================================================
// 1️⃣ API LẤY DANH SÁCH LOCKER TRỐNG
// ======================================================================
app.get("/api/available-lockers", async (req, res) => {
  try {
    const used = (await User.find({}, { lockerLocation: 1, _id: 0 })).map(
      (u) => u.lockerLocation
    );
    const available = ALL_LOCKERS.filter((l) => !used.includes(l));
    res.json({ availableLockers: available });
  } catch (err) {
    console.error("[ERROR] /available-lockers:", err);
    res.status(500).json({ error: "Server error fetching lockers" });
  }
});

// ======================================================================
// 2️⃣ API ĐĂNG KÝ NGƯỜI DÙNG
// ======================================================================
app.post("/register", async (req, res) => {
  try {
    const { name, email, lockerLocation, password, hintPassword } = req.body;

    if (!name || !email || !password || !lockerLocation)
      return res.status(400).json({ error: "⚠️ Thiếu thông tin bắt buộc" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ error: "Email đã được đăng ký!" });

    const lockerTaken = await User.findOne({ lockerLocation });
    if (lockerTaken)
      return res.status(400).json({ error: "Locker đã có người dùng!" });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      lockerLocation,
      password: hashed,
      hintPassword,
    });

    await LockerHistory.create({
      email,
      locker: lockerLocation,
      action: "REGISTERED",
    });

    console.log(`✅ Registered: ${email} | Locker: ${lockerLocation}`);
    res.json({ success: true, message: "Đăng ký thành công!" });
  } catch (err) {
    console.error("[ERROR] /register:", err);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// ======================================================================
// 3️⃣ API ĐĂNG NHẬP
// ======================================================================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email không tồn tại!" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Sai mật khẩu!" });

    res.json({ success: true, user });
  } catch (err) {
    console.error("[ERROR] /login:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================================================
// 4️⃣ API CẬP NHẬT TRẠNG THÁI MỞ/ĐÓNG
// ======================================================================
app.post("/api/locker/status", async (req, res) => {
  try {
    const { email, action } = req.body;
    if (!email || !action)
      return res.status(400).json({ error: "Thiếu email hoặc action" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User không tồn tại" });

    user.currentStatus = action;
    await user.save();

    await LockerHistory.create({
      email,
      locker: user.lockerLocation,
      action,
    });

    console.log(`📦 Locker ${user.lockerLocation} ${action} by ${email}`);
    res.json({ success: true, message: `Locker ${action}` });
  } catch (err) {
    console.error("[ERROR] /api/locker/status:", err);
    res.status(500).json({ error: "Server error updating locker status" });
  }
});

// ======================================================================
// 5️⃣ API KIỂM TRA MẬT KHẨU ĐỂ MỞ TỦ
// ======================================================================
app.post("/api/locker/verify-password", async (req, res) => {
  try {
    const { email, locker, password } = req.body;
    const user = await User.findOne({ email, lockerLocation: locker });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu sai!" });

    // ✅ Cập nhật trạng thái mở
    user.currentStatus = "OPENED";
    await user.save();

    await LockerHistory.create({ email, locker, action: "OPENED" });

    res.json({ success: true, message: "Mật khẩu đúng, tủ đã mở!" });
  } catch (err) {
    console.error("[ERROR] /api/locker/verify-password:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ======================================================================
// 6️⃣ API LẤY TOÀN BỘ TRẠNG THÁI CỦA MỌI LOCKER (CHO open_locker.js)
// ======================================================================
app.get("/api/locker/status", async (req, res) => {
  try {
    const users = await User.find({});
    const allLockers = ALL_LOCKERS.map((locker) => {
      const user = users.find((u) => u.lockerLocation === locker);
      if (user) {
        return {
          location: locker,
          email: user.email,
          currentStatus: user.currentStatus,
          isAssigned: true,
        };
      } else {
        return {
          location: locker,
          currentStatus: "UNASSIGNED",
          isAssigned: false,
        };
      }
    });
    res.json({ allLockers });
  } catch (err) {
    console.error("[ERROR] /api/locker/status:", err);
    res.status(500).json({ error: "Server error fetching status" });
  }
});

// ======================================================================
// 7️⃣ API LỊCH SỬ LOCKER
// ======================================================================
app.get("/api/locker/history/:locker", async (req, res) => {
  try {
    const { locker } = req.params;
    const history = await LockerHistory.find({ locker }).sort({ timestamp: -1 });
    res.json({ history });
  } catch (err) {
    console.error("[ERROR] /api/locker/history:", err);
    res.status(500).json({ error: "Server error fetching history" });
  }
});

// ======================================================================
// 🚀 START SERVER
// ======================================================================
app.listen(4000, () =>
  console.log("🚀 Locker Server running on http://127.0.0.1:4000")
);
