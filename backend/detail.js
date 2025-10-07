document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) {
    alert("You must log in first.");
    window.location.href = "logon.html";
    return;
  }

  const usernameEl = document.getElementById("username");
  const emailEl = document.getElementById("email");
  const passwordEl = document.getElementById("password");
  const changeBtn = document.getElementById("change-btn");
  const saveBtn = document.getElementById("save-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const backBtn = document.getElementById("back-btn");

  usernameEl.textContent = user.username || "";
  emailEl.textContent = user.email || "";
  passwordEl.textContent = user.password || "";

  // Nút Change -> Cho phép chỉnh sửa
  changeBtn.addEventListener("click", () => {
    [usernameEl, emailEl, passwordEl].forEach((el) => {
      el.contentEditable = true;
      el.style.borderBottom = "2px solid #0063ff";
    });
    saveBtn.style.display = "inline-block";
  });

  // Nút Save -> Gửi update về server
  saveBtn.addEventListener("click", async () => {
    const newData = {
      username: usernameEl.textContent.trim(),
      email: emailEl.textContent.trim(),
      password: passwordEl.textContent.trim(),
    };

    try {
      const res = await fetch("https://smart-locker-kgnx.onrender.com/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, ...newData }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Updated successfully!");
        sessionStorage.setItem("user", JSON.stringify({ ...user, ...newData }));
        saveBtn.style.display = "none";
        [usernameEl, emailEl, passwordEl].forEach((el) => {
          el.contentEditable = false;
          el.style.borderBottom = "none";
        });
      } else {
        alert("❌ " + data.error);
      }
    } catch (err) {
      alert("❌ Update failed: " + err.message);
    }
  });

  // Nút Back -> về Menu
  backBtn.addEventListener("click", () => {
    window.location.href = "menu.html";
  });

  // Nút Logout
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("user");
    alert("You have been logged out.");
    window.location.href = "logon.html";
  });

  // Tự động đăng xuất khi tắt tab
  window.addEventListener("beforeunload", () => {
    sessionStorage.removeItem("user");
  });
});
