document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const captcha = document.getElementById("captcha").checked;

    if (!name || !email || !password || !captcha) {
      alert("⚠️ Please fill all required fields and verify captcha.");
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Register successful! Please log in.");
        window.location.href = "logon.html";
      } else {
        alert("❌ " + data.error);
      }
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  });

// Giữ hiệu ứng ban đầu cho input
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
