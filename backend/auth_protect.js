(function protectPages() {
  const openPages = ["logon.html", "register.html"];
  const current = window.location.pathname.split("/").pop();
  const user = sessionStorage.getItem("user"); // đổi localStorage -> sessionStorage

  if (!user && !openPages.includes(current)) {
    // Nếu chưa login mà vào trang khác → bắt login
    alert("⚠️ Please login first!");
    window.location.href = "logon.html";
  }

  if (user && openPages.includes(current)) {
    // Nếu đã login mà vẫn vào logon/register → chuyển sang index
    window.location.href = "index.html";
  }
})();
