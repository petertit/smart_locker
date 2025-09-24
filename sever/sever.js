const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/myDatabase",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

// Tạo Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
});
const User = mongoose.model("User", UserSchema);

// API test
app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// API thêm user
app.post("/users", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

// API lấy danh sách user
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
