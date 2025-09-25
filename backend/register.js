// register.js

// register.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.querySelector('input[name="name"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
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
        window.location.href = "logon.html"; // chuyển sang login
      } else {
        alert("❌ " + (data.error || "Register failed"));
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
