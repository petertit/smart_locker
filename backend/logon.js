document.addEventListener("DOMContentLoaded", () => {
  // Nếu đã đăng nhập rồi thì chuyển luôn về index
  const existingUser = localStorage.getItem("user");
  if (existingUser) {
    window.location.href = "index.html";
    return;
  }

  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const res = await fetch("https://smart-locker-kgnx.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Đăng nhập thành công!");
        sessionStorage.setItem("user", JSON.stringify(data.user));

        window.location.href = "index.html"; // quay về trang chính
      } else {
        alert("❌ Lỗi: " + data.error);
      }
    } catch (err) {
      alert("❌ Fetch error: " + err.message);
    }
  });
});
