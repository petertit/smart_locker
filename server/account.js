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

// account.js — Render server (ESM) with detailed logging for /raspi/unlock
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ===== MongoDB Atlas Connection (EXISTING) =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===== User Schema (EXISTING) =====
const accountSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    hint: String,
    lockerCode: { type: String, default: null },
    registeredLocker: { type: String, default: null },
  },
  { collection: "account" }
);
const Account = mongoose.model("Account", accountSchema);

// ===== History Schema (EXISTING) =====
const historySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    lockerId: { type: String, default: null },
    action: { type: String, enum: ["REGISTERED", "OPENED", "LOCKED"] },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "history" }
);
const History = mongoose.model("History", historySchema);

// Helper function (EXISTING)
const prepareUser = (acc) => {
  if (!acc) return null;
  const userObj = acc.toObject ? acc.toObject() : acc;
  userObj.id = userObj._id.toString();
  delete userObj._id;
  if (userObj.lockerCode === undefined) userObj.lockerCode = null;
  if (userObj.registeredLocker === undefined) userObj.registeredLocker = null;
  return userObj;
};

// ===== Register (EXISTING) =====
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, hint } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: "Thiếu thông tin cần thiết" });

    const exist = await Account.findOne({ email });
    if (exist) return res.status(400).json({ error: "Email đã tồn tại" });

    const acc = new Account({
      name,
      email,
      phone,
      password,
      hint,
      lockerCode: null,
      registeredLocker: null,
    });
    await acc.save();

    const newHistoryEvent = new History({
      userId: acc._id,
      action: "REGISTERED",
    });
    await newHistoryEvent.save();

    res.json({ message: "✅ Đăng ký thành công", user: prepareUser(acc) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Login (EXISTING) =====
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const acc = await Account.findOne({ email, password }).lean();
    if (!acc) return res.status(401).json({ error: "Sai thông tin đăng nhập" });

    res.json({ message: "✅ Đăng nhập thành công", user: prepareUser(acc) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Update User (EXISTING) =====
app.post("/update", async (req, res) => {
  try {
    const {
      id,
      name,
      email,
      phone,
      password,
      hint,
      lockerCode,
      registeredLocker,
    } = req.body;

    const fieldsToUpdate = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (email !== undefined) fieldsToUpdate.email = email;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (password !== undefined) fieldsToUpdate.password = password;
    if (hint !== undefined) fieldsToUpdate.hint = hint;
    if (lockerCode !== undefined) fieldsToUpdate.lockerCode = lockerCode;
    if (registeredLocker !== undefined)
      fieldsToUpdate.registeredLocker = registeredLocker;

    const updated = await Account.findByIdAndUpdate(
      id,
      { $set: fieldsToUpdate },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json({
      message: "✅ Updated successfully",
      user: prepareUser(updated),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Lấy lại user theo ID (EXISTING) =====
app.get("/user/:id", async (req, res) => {
  try {
    const user = await Account.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ user: prepareUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Locker State Schema and Endpoints (EXISTING) =====
const lockerStateSchema = new mongoose.Schema(
  {
    lockerId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["EMPTY", "LOCKED", "OPEN"],
      default: "EMPTY",
    },
    ownerId: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "locker_states" }
);
const LockerState = mongoose.model("LockerState", lockerStateSchema);

// Endpoint 1: Lấy trạng thái tất cả tủ (EXISTING)
app.get("/lockers/status", async (req, res) => {
  // ... (code không đổi) ...
  try {
    const allLockers = await LockerState.find().lean();
    for (let i = 1; i <= 9; i++) {
      const id = i.toString().padStart(2, "0");
      const exists = allLockers.find((l) => l.lockerId === id);
      if (!exists) {
        await LockerState.updateOne(
          { lockerId: id },
          { $setOnInsert: { lockerId: id, status: "EMPTY", ownerId: null } },
          { upsert: true }
        );
      }
    }
    const finalLockers = await LockerState.find().lean();
    res.json({
      success: true,
      lockers: finalLockers.map((l) => ({
        lockerId: l.lockerId,
        status: l.status,
        ownerId: l.ownerId,
      })),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Lỗi khi tải trạng thái tủ: " + err.message,
    });
  }
});

// Endpoint 2: Cập nhật trạng thái tủ (EXISTING - Ghi log "LOCKED")
app.post("/lockers/update", async (req, res) => {
  try {
    const { lockerId, status, ownerId } = req.body;

    if (status === "LOCKED") {
      const currentState = await LockerState.findOne({ lockerId }).lean();
      if (currentState && currentState.ownerId) {
        const newHistoryEvent = new History({
          userId: currentState.ownerId,
          lockerId: lockerId,
          action: "LOCKED",
        });
        await newHistoryEvent.save();
      }
    }

    const updatedLocker = await LockerState.findOneAndUpdate(
      { lockerId },
      { status, ownerId: ownerId || null, timestamp: new Date() },
      { new: true }
    ).lean();

    if (!updatedLocker) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy tủ: " + lockerId });
    }
    res.json({
      success: true,
      locker: {
        lockerId: updatedLocker.lockerId,
        status: updatedLocker.status,
        ownerId: updatedLocker.ownerId,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Lỗi khi cập nhật trạng thái tủ: " + err.message,
    });
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
// ✅ ✅ ✅ THÊM ĐOẠN MÃ NÀY VÀO ✅ ✅ ✅
// ENDPOINT MỚI: Gửi lệnh mở khóa vật lý
app.post("/raspi/unlock", async (req, res) => {
  try {
    // Chuyển tiếp (forward) request đến RASPI_URL
    const r = await fetch(`${RASPI_URL}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body), // Gửi thông tin (lockerId, user)
    });
    const data = await r.json();
    res.json(data); // Gửi phản hồi từ Pi về lại cho client
  } catch (err) {
    // Nếu Pi bị lỗi hoặc offline, vẫn trả về JSON
    res.status(500).json({ success: false, error: err.message });
  }
});
// ✅ ✅ ✅ KẾT THÚC ĐOẠN MÃ CẦN THÊM ✅ ✅ ✅
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
// ✅ ===== ENDPOINT /raspi/unlock (ĐÃ THÊM LOG DEBUG) =====
app.post("/raspi/unlock", async (req, res) => {
  console.log("--- Received request at /raspi/unlock ---"); // Log khi nhận request
  console.log("Request body:", req.body); // Log nội dung request

  try {
    const { lockerId, user: userEmail } = req.body;

    // Log thông tin nhận được
    console.log(
      `Attempting to log OPENED event for locker ${lockerId}, user email ${userEmail}`
    );

    if (userEmail) {
      console.log("Finding user by email...");
      const user = await Account.findOne({ email: userEmail }).lean();

      if (user) {
        console.log("User found:", user._id); // Log ID của user
        const newHistoryEvent = new History({
          userId: user._id, // Dùng _id (ObjectId)
          lockerId: lockerId,
          action: "OPENED",
        });
        console.log("Attempting to save history event:", newHistoryEvent);
        await newHistoryEvent.save(); // Lưu vào collection 'history'
        console.log("✅ History event saved successfully!"); // Log khi lưu thành công
      } else {
        console.error(
          `❌ History log failed: User not found for email ${userEmail}`
        );
      }
    } else {
      console.error(
        "❌ History log failed: User email not provided in request body"
      );
    }

    // Chuyển tiếp (forward) request đến RASPI_URL
    console.log("Forwarding unlock request to Pi:", RASPI_URL);
    const r = await fetch(`${RASPI_URL}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const data = await r.json();
    console.log("Response from Pi:", data); // Log phản hồi từ Pi
    res.json(data); // Gửi phản hồi từ Pi về lại cho client
  } catch (err) {
    // Log lỗi chi tiết
    console.error("❌ Error in /raspi/unlock endpoint:", err);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    console.log("--- Finished processing /raspi/unlock ---"); // Log khi kết thúc
  }
});

// ===== ENDPOINT LẤY LỊCH SỬ (EXISTING) =====
app.get("/history/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const history = await History.find({ userId: userId }).sort({
      timestamp: -1,
    });
    res.json({ success: true, history: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== Start Server (Không đổi) =====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(
    `🚀 Server running on port ${PORT} (with detailed unlock logging)`
  )
);
