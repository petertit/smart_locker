// // account.js — ESM version with fixed user._id → user.id
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import fetch from "node-fetch";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json({ limit: "10mb" })); // Tăng giới hạn payload JSON cho ảnh Base64

// // ===== MongoDB Atlas Connection =====
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ Connected to MongoDB Atlas"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // ===== User Schema =====
// const accountSchema = new mongoose.Schema(
//   {
//     name: String,
//     email: { type: String, unique: true },
//     phone: String,
//     password: String,
//     hint: String,
//   },
//   { collection: "account" }
// );

// const Account = mongoose.model("Account", accountSchema);

// // ===== Register =====
// app.post("/register", async (req, res) => {
//   try {
//     const { name, email, phone, password, hint } = req.body;
//     if (!name || !email || !phone || !password)
//       return res.status(400).json({ error: "Missing required fields" });

//     const exist = await Account.findOne({ email });
//     if (exist) return res.status(400).json({ error: "Email already exists" });

//     const acc = new Account({ name, email, phone, password, hint });
//     await acc.save();

//     res.json({
//       message: "✅ Register successful",
//       user: {
//         ...acc.toObject(),
//         id: acc._id.toString(), // ✅ thêm ID chuẩn
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ===== Login =====
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const acc = await Account.findOne({ email, password });
//     if (!acc) return res.status(401).json({ error: "Invalid credentials" });

//     res.json({
//       message: "✅ Login successful",
//       user: {
//         ...acc.toObject(),
//         id: acc._id.toString(), // ✅ thêm ID chuẩn
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ===== Update User =====
// app.post("/update", async (req, res) => {
//   try {
//     const { id, name, email, phone, password, hint } = req.body;
//     const updated = await Account.findByIdAndUpdate(
//       id,
//       { name, email, phone, password, hint },
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ error: "User not found" });

//     res.json({
//       message: "✅ Updated successfully",
//       user: {
//         ...updated.toObject(),
//         id: updated._id.toString(), // ✅ đồng nhất ID trả về
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ===== Bridge tới Raspberry Pi (qua ngrok / localtunnel) =====
// const RASPI_URL = process.env.RASPI_URL;

// // Endpoint cũ: /raspi/capture (Giữ lại cho tương thích nếu cần)
// app.post("/raspi/capture", async (req, res) => {
//   try {
//     const r = await fetch(`${RASPI_URL}/capture`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(req.body),
//     });
//     const data = await r.json();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ ENDPOINT MỚI: Chuyển tiếp lệnh chụp 5 ảnh từ RasPi Cam (Cục bộ)
// app.post("/raspi/capture-batch", async (req, res) => {
//   try {
//     const r = await fetch(`${RASPI_URL}/capture-batch`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(req.body),
//     });
//     const data = await r.json();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ✅ ENDPOINT MỚI: Chuyển tiếp mảng ảnh Base64 từ Laptop
// app.post("/raspi/capture-remote-batch", async (req, res) => {
//   try {
//     const r = await fetch(`${RASPI_URL}/capture-remote-batch`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(req.body), // Chuyển tiếp name và images_data (mảng)
//     });
//     const data = await r.json();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Endpoint cũ: /raspi/recognize (cho RasPi Cam)
// app.get("/raspi/recognize", async (req, res) => {
//   try {
//     const r = await fetch(`${RASPI_URL}/recognize`);
//     const data = await r.json();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Endpoint cũ: /raspi/recognize-remote (cho Laptop Cam)
// app.post("/raspi/recognize-remote", async (req, res) => {
//   try {
//     const r = await fetch(`${RASPI_URL}/recognize-remote`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(req.body),
//     });
//     const data = await r.json();
//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ===== Start Server (không đổi) =====
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () =>
//   console.log(`🚀 Server running on port ${PORT} (ESM mode)`)
// );

// account.js — Render server (ESM) with lockerCode & full RasPi bridge
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ===== MongoDB Atlas Connection =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== User Schema =====
const accountSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    hint: String,
    lockerCode: { type: String, default: "" }, // ✅ thêm lockerCode
  },
  { collection: "account" }
);

const Account = mongoose.model("Account", accountSchema);

// ===== Login =====
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const acc = await Account.findOne({ email, password }).lean();

    if (!acc) return res.status(401).json({ error: "Invalid credentials" });

    // ✅ Thêm bảo vệ lockerCode
    if (!acc.lockerCode) acc.lockerCode = "";

    acc.id = acc._id.toString(); // Cho frontend dễ dùng
    delete acc._id;

    res.json({ message: "✅ Login successful", user: acc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Register =====
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, hint } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: "Thiếu thông tin cần thiết" });

    const exist = await Account.findOne({ email });
    if (exist) return res.status(400).json({ error: "Email đã tồn tại" });

    const acc = new Account({ name, email, phone, password, hint });
    await acc.save();
    res.json({ message: "✅ Đăng ký thành công", user: acc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Update User (bao gồm lockerCode) =====
app.post("/update", async (req, res) => {
  try {
    const { id, name, email, phone, password, hint, lockerCode } = req.body;

    const updated = await Account.findByIdAndUpdate(
      id,
      { name, email, phone, password, hint, lockerCode },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "User not found" });

    // ✅ Thêm dòng này để trả về id thống nhất
    updated.id = updated._id.toString();

    res.json({ message: "✅ Updated successfully", user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/user/:id", async (req, res) => {
  try {
    const user = await Account.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });
    user.id = user._id.toString();
    delete user._id;
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Bridge tới Raspberry Pi (qua ngrok / localtunnel) =====
const RASPI_URL = process.env.RASPI_URL;

// Endpoint cũ: /raspi/status
app.get("/raspi/status", async (req, res) => {
  try {
    const r = await fetch(`${RASPI_URL}/status`);
    const data = await r.json();
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Endpoint cũ: /raspi/capture (Giữ lại cho tương thích)
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

// ✅ ENDPOINT MỚI: Chụp 5 ảnh từ RasPi Cam
app.post("/raspi/capture-batch", async (req, res) => {
  try {
    const r = await fetch(`${RASPI_URL}/capture-batch`, {
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

// ✅ ENDPOINT MỚI: Nhận ảnh từ Laptop (Base64)
app.post("/raspi/capture-remote-batch", async (req, res) => {
  try {
    const r = await fetch(`${RASPI_URL}/capture-remote-batch`, {
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

// Endpoint cũ: /raspi/recognize (cho RasPi Cam)
app.get("/raspi/recognize", async (req, res) => {
  try {
    const r = await fetch(`${RASPI_URL}/recognize`);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint cũ: /raspi/recognize-remote (cho Laptop Cam)
app.post("/raspi/recognize-remote", async (req, res) => {
  try {
    const r = await fetch(`${RASPI_URL}/recognize-remote`, {
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

// ===== Start Server =====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(
    `🚀 Server running on port ${PORT} (lockerCode + RasPi bridge ready)`
  )
);
