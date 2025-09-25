// auth_protect.js
(function protectPages() {
  // Các trang cho phép mở khi chưa login:
  const openPages = ["logon.html", "register.html"];

  // Lấy file name hiện tại (ví dụ "index.html" hoặc "logon.html")
  let current = window.location.pathname.split("/").pop().toLowerCase();
  if (!current) current = "index.html"; // khi đường dẫn là /folder/ (không tên file)

  // Dùng sessionStorage để lưu session (tự xóa khi đóng tab / browser)
  const user = sessionStorage.getItem("user");

  // Nếu chưa login và đang ở trang KHÔNG phải logon/register => chặn
  if (!user && !openPages.includes(current)) {
    alert("⚠️ Please login first!");
    window.location.href = "logon.html";
    return; // dừng script ngay để không báo thêm hoặc redirect vòng lặp
  }

  // Nếu đã login nhưng vẫn mở logon/register => chuyển về index
  if (user && openPages.includes(current)) {
    window.location.href = "index.html";
    return;
  }
})();
