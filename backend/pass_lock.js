// backend/pass_lock.js - Logic đăng ký và cập nhật mật khẩu tủ khóa
document.addEventListener("DOMContentLoaded", () => {
  // 🌐 Địa chỉ Render Bridge (Backend Node.js)
  const RENDER_BRIDGE = "https://smart-locker-kgnx.onrender.com";
  const form = document.getElementById("lockerRegisterForm");
  const statusMessage = document.createElement("p");

  // 🔒 Kiểm tra đăng nhập
  const userRaw = sessionStorage.getItem("user");
  if (!userRaw) {
    alert("⚠️ Bạn phải đăng nhập trước để đăng ký mã khóa.");
    window.location.href = "logon.html";
    return;
  }
  const user = JSON.parse(userRaw);

  // Thêm thông báo trạng thái dưới form
  statusMessage.style.textAlign = "center";
  statusMessage.style.marginTop = "15px";
  statusMessage.style.fontSize = "14px";
  statusMessage.style.color = "#ffaa00";
  form.parentNode.insertBefore(statusMessage, form.nextSibling);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusMessage.textContent = "🔄 Đang đăng ký/cập nhật mã khóa...";
    statusMessage.style.color = "#ffaa00";

    const lockerCode = document.getElementById("password").value.trim();

    if (lockerCode.length < 4) {
      statusMessage.textContent = "❌ Mã khóa phải có ít nhất 4 ký tự.";
      statusMessage.style.color = "#ff3333";
      return;
    }

    // Dữ liệu mới để gửi lên server (chỉ gửi ID và mã khóa)
    const updatePayload = {
      id: user._id || user.id, // Lấy ID chuẩn của user
      lockerCode: lockerCode, // Trường mới
    };

    try {
      // Gửi yêu cầu cập nhật thông qua endpoint /update
      const response = await fetch(`${RENDER_BRIDGE}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (response.ok && result.user) {
        // ✅ Cập nhật sessionStorage thành công
        const updatedUser = { ...user, ...result.user };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));

        statusMessage.textContent = "✅ Đăng ký mã khóa thành công!";
        statusMessage.style.color = "#00ff66";
        alert(
          "Đăng ký mã khóa tủ thành công! Bạn có thể sử dụng mã này để đăng nhập."
        );

        // Chuyển hướng về trang menu hoặc trang chính
        window.location.href = "./menu.html";
      } else {
        statusMessage.textContent = `❌ Lỗi: ${
          result.error || "Cập nhật thất bại."
        }`;
        statusMessage.style.color = "#ff3333";
      }
    } catch (error) {
      statusMessage.textContent = `❌ Lỗi kết nối server: ${error.message}`;
      statusMessage.style.color = "#ff3333";
    }
  });
});
