// backend/pass_lock_login.js - Logic đăng nhập bằng mật khẩu tủ khóa
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginLockerForm");
  const statusMessage = document.createElement("p");

  // 🔒 Kiểm tra đăng nhập
  const userRaw = sessionStorage.getItem("user");
  if (!userRaw) {
    alert("⚠️ Bạn phải đăng nhập tài khoản chính trước.");
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
    statusMessage.textContent = "🔄 Đang kiểm tra mã khóa...";
    statusMessage.style.color = "#ffaa00";

    const inputCode = document.getElementById("lockerCode").value.trim();

    // 1. Kiểm tra xem người dùng đã đăng ký lockerCode chưa
    if (!user.lockerCode) {
      statusMessage.textContent =
        "❌ Bạn chưa đăng ký mã khóa tủ. Vui lòng đăng ký trước.";
      statusMessage.style.color = "#ff3333";
      alert("Bạn chưa đăng ký mã khóa tủ.");
      return;
    }

    // 2. So sánh mã khóa nhập vào với mã khóa đã lưu trong session
    if (inputCode === user.lockerCode) {
      statusMessage.textContent = `✅ Đã mở tủ khóa thành công cho ${user.name}!`;
      statusMessage.style.color = "#00ff66";

      // 💡 Ở đây bạn có thể thêm logic gửi lệnh mở tủ đến Raspberry Pi
      // Ví dụ: await fetch(`${RENDER_BRIDGE}/raspi/open_locker`, { method: 'POST' });

      alert("Đã mở tủ khóa thành công!");
      // Chuyển hướng người dùng về trang mở tủ chính
      window.location.href = "./open.html";
    } else {
      statusMessage.textContent = "❌ Mã khóa không đúng. Vui lòng thử lại.";
      statusMessage.style.color = "#ff3333";
    }
  });
});
