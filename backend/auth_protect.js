// auth_protect.js

(function protectPages() {
  // Danh sách các trang KHÔNG cần login
  const openPages = ["index.html", "register.html", "logon.html"];

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
