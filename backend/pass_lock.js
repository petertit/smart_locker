// pass_lock.js — Đăng ký hoặc cập nhật mã khóa tủ (lockerCode)
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) {
    alert("⚠️ Bạn cần đăng nhập trước khi đặt mã khóa tủ!");
    window.location.href = "logon.html";
    return;
  }

  const form = document.getElementById("lockerRegisterForm");
  const input = document.getElementById("password");
  const row3 = document.getElementById("row3");

  // Hiển thị mã cũ (nếu có)
  if (user.lockerCode) {
    row3.textContent = `🔒 Mã hiện tại: ${user.lockerCode}`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newCode = input.value.trim();
    if (!newCode) {
      alert("⚠️ Vui lòng nhập mã khóa tủ!");
      return;
    }

    try {
      const res = await fetch("https://smart-locker-kgnx.onrender.com/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user._id || user.id,
          lockerCode: newCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        sessionStorage.setItem("user", JSON.stringify(data.user));
        row3.textContent = `✅ Mã khóa tủ đã lưu: ${newCode}`;
        alert("✅ Đăng ký mã khóa tủ thành công!");
        input.value = "";
      } else {
        alert("❌ " + (data.error || "Không thể lưu mã khóa tủ"));
      }
    } catch (err) {
      alert("❌ Lỗi kết nối: " + err.message);
    }
  });
});
