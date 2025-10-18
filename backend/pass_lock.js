// pass_lock.js — Đăng ký / cập nhật mã khóa tủ
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) {
    alert("⚠️ Vui lòng đăng nhập trước khi thiết lập mã tủ!");
    window.location.href = "logon.html";
    return;
  }

  const form = document.getElementById("lockerRegisterForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const lockerCode = document.getElementById("password").value.trim();

    if (!lockerCode) {
      alert("❌ Vui lòng nhập mã tủ!");
      return;
    }

    try {
      const res = await fetch("https://smart-locker-kgnx.onrender.com/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, lockerCode }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        alert("✅ Đăng ký mã tủ thành công!");
        window.location.href = "menu.html";
      } else {
        alert("❌ " + (data.error || "User not found"));
      }
    } catch (err) {
      alert("❌ Lỗi khi đăng ký mã tủ: " + err.message);
    }
  });
});
