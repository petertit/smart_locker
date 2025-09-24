document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Login successful!");
        sessionStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "index.html";
      } else {
        alert("❌ " + data.error);
      }
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  });

// ===== Bảo vệ các trang =====
(function protectPages() {
  const openPages = ["index.html", "register.html", "logon.html"];
  const current = window.location.pathname.split("/").pop();
  if (!openPages.includes(current)) {
    const user = sessionStorage.getItem("user");
    if (!user) {
      alert("⚠️ Please login first!");
      window.location.href = "logon.html";
    }
  }
})();
