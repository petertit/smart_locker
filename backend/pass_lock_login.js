// pass_lock_login.js — Kiểm tra mã khóa tủ & mở tủ
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) {
    alert("⚠️ Bạn cần đăng nhập trước khi mở tủ!");
    window.location.href = "logon.html";
    return;
  }

  const form = document.getElementById("loginLockerForm");
  const input = document.getElementById("lockerCode");
  const row3 = document.getElementById("row3");

  // Lấy lockerId mà người dùng đã chọn ở trang open.html
  const lockerId = sessionStorage.getItem("locker_to_open");
  if (!lockerId) {
    alert("Lỗi: Không tìm thấy tủ nào đang chờ mở. Đang quay lại...");
    window.location.href = "open.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const entered = input.value.trim();

    if (!entered) {
      alert("⚠️ Vui lòng nhập mã khóa tủ!");
      return;
    }

    // So sánh mã đã nhập với mã của người dùng
    if (entered === user.lockerCode) {
      row3.textContent = "✅ Mã chính xác — Đang gửi lệnh mở tủ...";
      row3.style.color = "#00ff66";

      // ✅ SỬA LỖI: Gọi hàm thành công chung (Hàm này sẽ xử lý mở Pi và chuyển hướng)
      if (window.openLockerSuccess) {
        window.openLockerSuccess(lockerId);
      } else {
        alert("Lỗi: Không tìm thấy hàm openLockerSuccess. Không thể mở tủ.");
      }
    } else {
      row3.textContent = "❌ Mã khóa không đúng!";
      row3.style.color = "#ff3333";
    }

    input.value = "";
  });
});
