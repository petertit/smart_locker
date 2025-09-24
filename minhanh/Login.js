import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import bg from "../assets/images/hinhnen.png";
import Particles from "./Particles"; // import component hạt

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin
      ? "http://localhost:4000/api/login"
      : "http://localhost:4000/api/register";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        if (isLogin && data.message?.includes("Login successful")) {
          navigate("/status");
        }
      } else {
        alert(data.error || "Có lỗi xảy ra!");
      }
    } catch (err) {
      alert("Lỗi kết nối server!");
      console.error(err);
    }
  };

  return (
    <div className="login-container" style={{ backgroundImage: `url(${bg})` }}>
      <Particles />  {/* nền hạt bay */}
      <div className={`login-box ${isLogin ? "login-mode" : "register-mode"}`}>
        <h1>{isLogin ? "Đăng Nhập" : "Đăng Ký"}</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>Email</label>
          </div>
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <label>Mật khẩu</label>
          </div>
          <button type="submit" className="fancy-btn">
            {isLogin ? "Đăng Nhập" : "Đăng Ký"}
          </button>
        </form>
        <p className="toggle" onClick={() => setIsLogin(!isLogin)}>
          {isLogin
            ? "Chưa có tài khoản? Đăng ký ngay!"
            : "Đã có tài khoản? Đăng nhập"}
        </p>
      </div>
    </div>
  );
}

export default Login;
