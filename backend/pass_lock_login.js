const RENDER_BRIDGE = "https://smart-locker-kgnx.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginLockerForm");
  const lockerCodeInput = document.getElementById("lockerCode");

  // 1. Kiểm tra trạng thái cần thiết
  const userRaw = sessionStorage.getItem("user");
  const currentUser = userRaw ? JSON.parse(userRaw) : null;
  const lockerId = sessionStorage.getItem("locker_to_open");

  if (!currentUser) {
    // Tùy chọn: Chuyển hướng về trang Open để người dùng chọn tủ lại
    window.location.href = "logon.html";
    alert("⚠️ Vui lòng đăng nhập tài khoản trước.");
    return;
  }

  if (!lockerId) {
    window.location.href = "open.html";
    alert("⚠️ Vui lòng chọn tủ khóa trước khi đăng nhập.");
    return;
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputLockerCode = lockerCodeInput.value.trim();

    // 2. So sánh mã khóa
    // Lấy mã khóa từ session (đã được lưu khi đăng nhập chính hoặc cập nhật từ detail/pass_lock.js)
    const registeredLockerCode = currentUser.lockerCode;

    if (!registeredLockerCode) {
      alert(
        "❌ Lỗi: Tài khoản của bạn chưa đăng ký mã khóa tủ. Vui lòng đăng ký trong trang Detail hoặc Pass Lock."
      );
      return;
    }

    if (inputLockerCode === registeredLockerCode) {
      // 3. Đăng nhập thành công -> Gọi hàm mở tủ (đã định nghĩa trong open.js)

      // Xóa mã khóa khỏi input sau khi xác thực
      lockerCodeInput.value = "";

      if (window.openLockerSuccess) {
        alert(
          `✅ Xác thực mã khóa thành công cho tủ ${lockerId}. Đang mở tủ...`
        );
        // openLockerSuccess sẽ gửi yêu cầu server mở tủ và chuyển hướng về open.html
        window.openLockerSuccess(lockerId);
      } else {
        alert(
          "✅ Xác thực thành công nhưng không tìm thấy hàm mở tủ (open.js chưa load). Vui lòng tải lại trang Open."
        );
      }
    } else {
      alert("❌ Mã khóa tủ không chính xác.");
    }
  });
});
//   // ✅ Cập nhật sessionStorage
//   sessionStorage.setItem("user", JSON.stringify(updatedUser));
