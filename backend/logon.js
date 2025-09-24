document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("https://smart-locker-kgnx.onrender.com/logon", {
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
