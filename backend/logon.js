document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;

    try {
      const res = await fetch("https://smart-locker-kgnx.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Đăng nhập thành công!");
        localStorage.setItem("user", JSON.stringify(data.user)); // lưu user
        window.location.href = "index.html"; // quay về trang chính
      } else {
        alert("❌ Lỗi: " + data.error);
      }
    } catch (err) {
      alert("❌ Fetch error: " + err.message);
    }
  });
});
