document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) {
    alert("You must log in first.");
    window.location.href = "logon.html";
    return;
  }

  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const passwordEl = document.getElementById("password");
  const hintEl = document.getElementById("hint");
  const changeBtn = document.getElementById("change-btn");
  const saveBtn = document.getElementById("save-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const backBtn = document.getElementById("back-btn");

  // Hiển thị thông tin
  nameEl.textContent = user.name || "";
  emailEl.textContent = user.email || "";
  phoneEl.textContent = user.phone || "";
  passwordEl.textContent = user.password || "";
  hintEl.textContent = user.hint || "";

  // Nút Change
  changeBtn.addEventListener("click", () => {
    [nameEl, emailEl, phoneEl, passwordEl, hintEl].forEach((el) => {
      el.contentEditable = true;
      el.style.borderBottom = "2px solid #0063ff";
    });
    saveBtn.style.display = "inline-block";
  });

  // Nút Save
  saveBtn.addEventListener("click", async () => {
    const newData = {
      name: nameEl.textContent.trim(),
      email: emailEl.textContent.trim(),
      phone: phoneEl.textContent.trim(),
      password: passwordEl.textContent.trim(),
      hint: hintEl.textContent.trim(),
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
        [nameEl, emailEl, phoneEl, passwordEl, hintEl].forEach((el) => {
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

  // Nút Back
  backBtn.addEventListener("click", () => {
    window.location.href = "menu.html";
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("user");
    alert("You have been logged out.");
    window.location.href = "logon.html";
  });

  // Auto logout on tab close
  // window.addEventListener("beforeunload", () => {
  //   sessionStorage.removeItem("user");
  // });
});
