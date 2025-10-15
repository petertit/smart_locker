const RENDER_BRIDGE = "https://smart-locker-kgnx.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginLockerForm");
  const lockerCodeInput = document.getElementById("lockerCode");

  // 1. Kiểm tra trạng thái cần thiết
  const userRaw = sessionStorage.getItem("user");
  const currentUser = userRaw ? JSON.parse(userRaw) : null;
  const lockerId = sessionStorage.getItem("locker_to_open");

  if (!currentUser) {
    alert("⚠️ Vui lòng đăng nhập tài khoản trước.");
    window.location.href = "logon.html";
    return;
  }

  if (!lockerId) {
    alert("⚠️ Vui lòng chọn tủ khóa trước khi đăng nhập.");
    window.location.href = "open.html";
    return;
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputLockerCode = lockerCodeInput.value.trim();

    // 2. So sánh mã khóa
    const registeredLockerCode = currentUser.lockerCode;

    if (!registeredLockerCode) {
      alert(
        "❌ Lỗi: Tài khoản của bạn chưa đăng ký mã khóa tủ. Vui lòng đăng ký trong trang Detail hoặc Pass Lock."
      );
      return;
    }

    if (inputLockerCode === registeredLockerCode) {
      // 3. Đăng nhập thành công -> Gọi hàm mở tủ (đã định nghĩa trong open.js)
      if (window.openLockerSuccess) {
        alert(
          `✅ Xác thực mã khóa thành công cho tủ ${lockerId}. Đang mở tủ...`
        );
        // openLockerSuccess sẽ cập nhật trạng thái trên server và chuyển hướng
        window.openLockerSuccess(lockerId);
      } else {
        alert(
          "✅ Xác thực thành công nhưng không tìm thấy hàm mở tủ (open.js chưa load)."
        );
      }
    } else {
      alert("❌ Mã khóa tủ không chính xác.");
    }
  });
});
