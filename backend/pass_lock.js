// pass_lock.js — Đăng ký / cập nhật mã khóa tủ
document.addEventListener("DOMContentLoaded", () => {
  const userRaw = sessionStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  // ❌ KHẮC PHỤC LỖI: Kiểm tra xem user có tồn tại và có ID hợp lệ không
  if (!user || (!user.id && !user._id)) {
    alert(
      "⚠️ Vui lòng đăng nhập trước khi thiết lập mã tủ! (User session/ID missing)"
    );
    window.location.href = "logon.html";
    return;
  }

  const form = document.getElementById("lockerRegisterForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const lockerCode = document.getElementById("password").value.trim();
    // Lấy ID chuẩn hóa (Ưu tiên user.id nếu có)
    const userId = user.id || user._id;

    if (!lockerCode) {
      alert("❌ Vui lòng nhập mã tủ!");
      return;
    }

    try {
      // Endpoint /update trên Render Bridge
      const res = await fetch("https://smart-locker-kgnx.onrender.com/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Gửi ID chuẩn hóa
        body: JSON.stringify({ id: userId, lockerCode }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        // Cập nhật session với dữ liệu mới
        sessionStorage.setItem("user", JSON.stringify(data.user));
        alert("✅ Đăng ký mã tủ thành công!");
        window.location.href = "menu.html";
      } else {
        // Thông báo lỗi chi tiết từ server
        alert(
          "❌ Đăng ký thất bại: " +
            (data.error || "Không thể tìm thấy User ID.")
        );
      }
    } catch (err) {
      alert("❌ Lỗi mạng/server: " + err.message);
    }
  });
});
