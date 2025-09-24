// register.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.querySelector('input[name="name"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;

    try {
      const res = await fetch(
        "https://smart-locker-kgnx.onrender.com/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, email, password }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Đăng ký thành công!");
        window.location.href = "logon.html"; // chuyển sang login
      } else {
        alert("❌ Lỗi: " + data.error);
      }
    } catch (err) {
      alert("❌ Fetch error: " + err.message);
    }
  });
});

// Hiệu ứng input giữ nguyên
document.querySelectorAll(".input").forEach((inputEl) => {
  inputEl.addEventListener("focus", () => {
    inputEl.parentNode.classList.add("active");
  });
  inputEl.addEventListener("blur", () => {
    if (!inputEl.value) {
      inputEl.parentNode.classList.remove("active");
    }
  });
});
