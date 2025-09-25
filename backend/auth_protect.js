(function protectPages() {
  // Các trang không cần login
  const openPages = ["logon.html", "register.html"];

  // Lấy tên file hiện tại
  const current = window.location.pathname.split("/").pop();

  // Lấy user trong sessionStorage
  const user = sessionStorage.getItem("user");

  // Nếu chưa login và đang ở trang KHÔNG NẰM trong openPages
  if (!user && !openPages.includes(current)) {
    alert("⚠️ Please login first!");
    window.location.href = "logon.html";
    return; // Dừng hẳn script, tránh chạy tiếp
  }

  // Nếu đã login mà vẫn ở logon/register → đưa về index
  if (user && openPages.includes(current)) {
    window.location.href = "index.html";
    return;
  }
})();
