// auth_protect.js
(function protectPages() {
  // Chỉ cho phép mở 2 trang này khi chưa login
  const openPages = ["logon.html", "register.html"];

  // Lấy tên file hiện tại
  const current = window.location.pathname.split("/").pop();

  // Nếu trang hiện tại không nằm trong danh sách openPages thì kiểm tra login
  if (!openPages.includes(current)) {
    const user = sessionStorage.getItem("user");
    if (!user) {
      alert("⚠️ Please login first!");
      window.location.href = "logon.html";
    }
  }
})();
