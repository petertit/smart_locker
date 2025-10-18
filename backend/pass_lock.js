// pass_lock.js — Đăng ký / cập nhật mã khóa tủ
document.addEventListener("DOMContentLoaded", () => {
  const RENDER_BRIDGE = "https://smart-locker-kgnx.onrender.com";
  const userRaw = sessionStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  // ✅ KHẮC PHỤC LỖI: Kiểm tra session user và user.id
  // Nếu không có user hoặc thiếu ID (từ login), hiển thị lỗi và chuyển hướng
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
    // ✅ Lấy ID chuẩn hóa: ưu tiên user.id (chuẩn hóa từ server)
    const userId = user.id || user._id;

    if (!lockerCode) {
      alert("❌ Vui lòng nhập mã tủ!");
      return;
    }

    try {
      // Endpoint /update trên Render Bridge
      const res = await fetch(`${RENDER_BRIDGE}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Gửi ID chuẩn hóa và mã khóa tủ
        body: JSON.stringify({ id: userId, lockerCode }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        // Cập nhật session với dữ liệu mới (đã có lockerCode)
        sessionStorage.setItem("user", JSON.stringify(data.user));
        alert("✅ Đăng ký mã tủ thành công!");
        window.location.href = "menu.html";
      } else {
        // Thông báo lỗi chi tiết từ server (ví dụ: "User not found")
        alert(
          "❌ Đăng ký thất bại: " +
            (data.error || "Không thể cập nhật User ID.")
        );
      }
    } catch (err) {
      alert("❌ Lỗi mạng/server: " + err.message);
    }
  });
});
