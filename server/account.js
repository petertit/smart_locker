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
// account.js — ESM version with fixed user._id → user.id
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Tăng giới hạn payload JSON cho ảnh Base64

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
    // ✅ TRƯỜNG MỚI: Mật khẩu tủ khóa (Locker Code)
    lockerCode: String,
  },
  { collection: "account" }
);

const Account = mongoose.model("Account", accountSchema);

// ===== Register =====
app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, hint } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: "Missing required fields" });

    const exist = await Account.findOne({ email });
    if (exist) return res.status(400).json({ error: "Email already exists" });

    // Khởi tạo lockerCode là null khi đăng ký
    const acc = new Account({
      name,
      email,
      phone,
      password,
      hint,
      lockerCode: null,
    });
    await acc.save();

    res.json({
      message: "✅ Register successful",
      user: {
        ...acc.toObject(),
        id: acc._id.toString(), // ✅ thêm ID chuẩn
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Login =====
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const acc = await Account.findOne({ email, password });
    if (!acc) return res.status(401).json({ error: "Invalid credentials" });

    res.json({
      message: "✅ Login successful",
      user: {
        ...acc.toObject(),
        id: acc._id.toString(), // ✅ thêm ID chuẩn
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Update User (Bao gồm Locker Code) =====
app.post("/update", async (req, res) => {
  try {
    // ✅ Thêm lockerCode vào destructuring
    const { id, name, email, phone, password, hint, lockerCode } = req.body;

    const updated = await Account.findByIdAndUpdate(
      id,
      // ✅ Cập nhật tất cả các trường, bao gồm lockerCode
      { name, email, phone, password, hint, lockerCode },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json({
      message: "✅ Updated successfully",
      user: {
        ...updated.toObject(),
        id: updated._id.toString(), // ✅ đồng nhất ID trả về
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ===== ✅ LOCKER MANAGEMENT ENDPOINTS (NEW) =====

// 1. Lấy trạng thái tất cả tủ khóa
app.get("/lockers/status", async (req, res) => {
  try {
    const lockers = await Locker.find(
      {},
      { lockerId: 1, status: 1, userId: 1, _id: 0 }
    );
    res.json(lockers);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching locker status", error: err.message });
  }
});

// 2. Cập nhật trạng thái tủ khóa (Mở hoặc Khóa)
app.post("/lockers/update", async (req, res) => {
  try {
    const { lockerId, status, userId } = req.body;

    const currentLocker = await Locker.findOne({ lockerId });

    if (!currentLocker) {
      return res
        .status(404)
        .json({ success: false, message: "Locker not found." });
    }

    let newUserId =
      status === "OPEN"
        ? userId
        : currentLocker.status === "OPEN"
        ? currentLocker.userId
        : null;
    if (status === "LOCKED" && currentLocker.userId) {
      // Khi đóng, tủ vẫn thuộc về userId, chỉ đổi trạng thái
      newUserId = currentLocker.userId;
    }
    if (status === "EMPTY") {
      // Khi trống, xóa userId
      newUserId = null;
    }

    // Kiểm tra logic phức tạp
    if (status === "OPEN" && newUserId) {
      // Nếu tủ bị người khác chiếm (LOCKED hoặc OPEN)
      if (
        currentLocker.status !== "EMPTY" &&
        currentLocker.userId &&
        currentLocker.userId !== newUserId
      ) {
        return res
          .status(403)
          .json({
            success: false,
            message: "Tủ đã được đăng ký/sử dụng bởi người khác.",
          });
      }
    }

    // Cập nhật trạng thái và chủ sở hữu
    const updatedLocker = await Locker.findOneAndUpdate(
      { lockerId },
      { status: status, userId: newUserId },
      { new: true }
    );

    res.json({
      success: true,
      message: `Locker ${lockerId} status updated to ${status}`,
      locker: updatedLocker,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Server error during locker update",
        error: err.message,
      });
  }
});
// ===== Bridge tới Raspberry Pi (qua ngrok / localtunnel) =====
const RASPI_URL = process.env.RASPI_URL;

// Endpoint cũ: /raspi/capture (Giữ lại cho tương thích nếu cần)
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

// ✅ ENDPOINT MỚI: Chuyển tiếp lệnh chụp 5 ảnh từ RasPi Cam (Cục bộ)
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

// ✅ ENDPOINT MỚI: Chuyển tiếp mảng ảnh Base64 từ Laptop
app.post("/raspi/capture-remote-batch", async (req, res) => {
  try {
    const r = await fetch(`${RASPI_URL}/capture-remote-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body), // Chuyển tiếp name và images_data (mảng)
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

// ===== Start Server (không đổi) =====
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT} (ESM mode)`)
);
