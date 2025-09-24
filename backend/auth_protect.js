// auth_protect.js
(function protectPages() {
  const openPages = ["logon.html", "register.html"];
  const current = window.location.pathname.split("/").pop();

  if (!openPages.includes(current)) {
    const user = localStorage.getItem("user"); // đổi sessionStorage -> localStorage
    if (!user) {
      alert("⚠️ Please login first!");
      window.location.href = "logon.html";
    }
  }
})();
