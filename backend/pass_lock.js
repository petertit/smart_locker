// backend/pass_lock.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("lockerRegisterForm");

  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) {
    alert("⚠️ Bạn cần đăng nhập trước khi đăng ký mã tủ!");
    window.location.href = "logon.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const lockerCode = document.getElementById("password").value.trim();
    if (!lockerCode) {
      alert("⚠️ Vui lòng nhập mã tủ!");
      return;
    }

    try {
      const res = await fetch("https://smart-locker-kgnx.onrender.com/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user._id || user.id, // ✅ Gửi ID người dùng
          lockerCode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        alert("✅ Mã khóa tủ đã lưu thành công!");

        // ✅ Cập nhật sessionStorage để giữ lại lockerCode
        sessionStorage.setItem("user", JSON.stringify({ ...user, lockerCode }));

        window.location.href = "menu.html";
      } else {
        alert("❌ " + (data.error || "Lưu thất bại"));
      }
    } catch (err) {
      alert("❌ Lỗi kết nối: " + err.message);
    }
  });
});
// backend/pass_lock.js
