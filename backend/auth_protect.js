// auth_protect.js
(function protectPages() {
  const openPages = ["logon.html", "register.html"];

  let current = window.location.pathname.split("/").pop().toLowerCase();
  if (!current) current = "index.html";

  const user = sessionStorage.getItem("user");

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
