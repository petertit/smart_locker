// auth_protect.js
(function protectPages() {
  const openPages = ["logon.html", "register.html"];

  let current = window.location.pathname.split("/").pop().toLowerCase();
  if (!current) current = "index.html";

  const user = sessionStorage.getItem("user");
  // 🚨 Ngắt kết nối đăng xuất mặc định trên các nút
  document.querySelectorAll("#logout-btn").forEach((btn) => {
    // Gán sự kiện click vào hàm handleLogoutAndLock toàn cục
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      // Kiểm tra xem hàm có tồn tại không (chỉ có trong open.js)
      if (window.handleLogoutAndLock) {
        window.handleLogoutAndLock();
      } else {
        // Fallback (Nếu không load open.js, ví dụ trên trang menu)
        sessionStorage.removeItem("user");
        window.location.href = "logon.html";
      }
    });
  });

  if (!user && !openPages.includes(current)) {
    alert("⚠️ Please login first!");
    window.location.href = "logon.html";
    return; // dừng script ngay để không báo thêm hoặc redirect vòng lặp
  }

  if (user && openPages.includes(current)) {
    window.location.href = "index.html";
    return;
  }
})();
