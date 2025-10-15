// // detail.js — Quản lý thông tin tài khoản (hiển thị, chỉnh sửa, lưu)
// document.addEventListener("DOMContentLoaded", () => {
//   // 🔒 Kiểm tra đăng nhập
//   const user = JSON.parse(sessionStorage.getItem("user"));
//   if (!user) {
//     alert("⚠️ You must log in first.");
//     window.location.href = "logon.html";
//     return;
//   }

//   // 🧩 Gán các phần tử HTML
//   const nameEl = document.getElementById("name");
//   const emailEl = document.getElementById("email");
//   const phoneEl = document.getElementById("phone");
//   const passwordEl = document.getElementById("password");
//   const hintEl = document.getElementById("hint");
//   const changeBtn = document.getElementById("change-btn");
//   const saveBtn = document.getElementById("save-btn");
//   const logoutBtn = document.getElementById("logout-btn");
//   const backBtn = document.getElementById("back-btn");

//   // 🔍 Hiển thị thông tin hiện tại
//   nameEl.textContent = user.name || "";
//   emailEl.textContent = user.email || "";
//   phoneEl.textContent = user.phone || "";
//   passwordEl.textContent = user.password || "";
//   hintEl.textContent = user.hint || "";

//   // ✏️ Nút "Change" → cho phép chỉnh sửa
//   changeBtn.addEventListener("click", () => {
//     [nameEl, emailEl, phoneEl, passwordEl, hintEl].forEach((el) => {
//       el.contentEditable = true;
//       el.style.borderBottom = "2px solid #0063ff";
//       el.style.outline = "none";
//     });
//     saveBtn.style.display = "inline-block";
//   });

//   // 💾 Nút "Save" → gửi cập nhật lên MongoDB Atlas qua Render
//   saveBtn.addEventListener("click", async () => {
//     const newData = {
//       name: nameEl.textContent.trim(),
//       email: emailEl.textContent.trim(),
//       phone: phoneEl.textContent.trim(),
//       password: passwordEl.textContent.trim(),
//       hint: hintEl.textContent.trim(),
//     };

//     // ⚙️ Lấy đúng ID từ user (_id hoặc id)
//     const userId = user._id || user.id;
//     if (!userId) {
//       alert("❌ Cannot update: user ID missing.");
//       return;
//     }

//     try {
//       const res = await fetch("https://smart-locker-kgnx.onrender.com/update", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ id: userId, ...newData }),
//       });

//       const data = await res.json();
//       if (res.ok && data.user) {
//         alert("✅ Updated successfully!");

//         // 🧠 Cập nhật lại dữ liệu local
//         const updatedUser = { ...user, ...data.user };
//         sessionStorage.setItem("user", JSON.stringify(updatedUser));

//         // 🔒 Khoá lại các ô
//         [nameEl, emailEl, phoneEl, passwordEl, hintEl].forEach((el) => {
//           el.contentEditable = false;
//           el.style.borderBottom = "none";
//         });
//         saveBtn.style.display = "none";
//       } else {
//         alert("❌ " + (data.error || "Update failed"));
//       }
//     } catch (err) {
//       alert("❌ Update failed: " + err.message);
//     }
//   });

//   // 🔙 Nút "Back"
//   backBtn.addEventListener("click", () => {
//     window.location.href = "menu.html";
//   });

//   // 🚪 Nút "Logout"
//   logoutBtn.addEventListener("click", () => {
//     sessionStorage.removeItem("user");
//     alert("🔓 You have been logged out.");
//     window.location.href = "logon.html";
//   });

//   // ❎ (Tuỳ chọn) Xoá session khi đóng tab
//   // window.addEventListener("beforeunload", () => {
//   //   sessionStorage.removeItem("user");
//   // });
// });
// detail.js — Quản lý thông tin tài khoản (hiển thị, chỉnh sửa, lưu)
document.addEventListener("DOMContentLoaded", () => {
  // 🔒 Kiểm tra đăng nhập
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) {
    alert("⚠️ You must log in first.");
    window.location.href = "logon.html";
    return;
  }

  // 🧩 Gán các phần tử HTML
  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const phoneEl = document.getElementById("phone");
  const passwordEl = document.getElementById("password");
  const hintEl = document.getElementById("hint");
  // ✅ THÊM ELEMENT CHO LOCKER CODE
  const lockerCodeEl = document.getElementById("lockerCode");

  const changeBtn = document.getElementById("change-btn");
  const saveBtn = document.getElementById("save-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const backBtn = document.getElementById("back-btn");

  // 🔍 Hiển thị thông tin hiện tại
  nameEl.textContent = user.name || "";
  emailEl.textContent = user.email || "";
  phoneEl.textContent = user.phone || "";
  passwordEl.textContent = user.password || "";
  hintEl.textContent = user.hint || "";
  // ✅ HIỂN THỊ LOCKER CODE
  if (lockerCodeEl) {
    lockerCodeEl.textContent = user.lockerCode || "Chưa thiết lập";
  }

  // ✏️ Nút "Change" → cho phép chỉnh sửa
  changeBtn.addEventListener("click", () => {
    // Thêm lockerCodeEl vào danh sách có thể chỉnh sửa
    const editableElements = [nameEl, emailEl, phoneEl, passwordEl, hintEl];
    if (lockerCodeEl) {
      editableElements.push(lockerCodeEl);
    }

    editableElements.forEach((el) => {
      el.contentEditable = true;
      el.style.borderBottom = "2px solid #0063ff";
      el.style.outline = "none";
    });
    saveBtn.style.display = "inline-block";
  });

  // 💾 Nút "Save" → gửi cập nhật lên MongoDB Atlas qua Render
  saveBtn.addEventListener("click", async () => {
    const newData = {
      name: nameEl.textContent.trim(),
      email: emailEl.textContent.trim(),
      phone: phoneEl.textContent.trim(),
      password: passwordEl.textContent.trim(),
      hint: hintEl.textContent.trim(),
      // ✅ BAO GỒM LOCKER CODE TRONG UPDATE
      lockerCode: lockerCodeEl
        ? lockerCodeEl.textContent.trim()
        : user.lockerCode,
    };

    // ⚙️ Lấy đúng ID từ user (_id hoặc id)
    const userId = user._id || user.id;
    if (!userId) {
      alert("❌ Cannot update: user ID missing.");
      return;
    }

    try {
      const res = await fetch("https://smart-locker-kgnx.onrender.com/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...newData }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        alert("✅ Updated successfully!");

        // 🧠 Cập nhật lại dữ liệu local
        const updatedUser = { ...user, ...data.user };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));

        // 🔒 Khoá lại các ô
        const editableElements = [nameEl, emailEl, phoneEl, passwordEl, hintEl];
        if (lockerCodeEl) {
          editableElements.push(lockerCodeEl);
        }

        editableElements.forEach((el) => {
          el.contentEditable = false;
          el.style.borderBottom = "none";
        });
        saveBtn.style.display = "none";
      } else {
        alert("❌ " + (data.error || "Update failed"));
      }
    } catch (err) {
      alert("❌ Update failed: " + err.message);
    }
  });

  // 🔙 Nút "Back"
  backBtn.addEventListener("click", () => {
    window.location.href = "menu.html";
  });

  // 🚪 Nút "Logout"
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("user");
    alert("🔓 You have been logged out.");
    window.location.href = "logon.html";
  });
});
// ❎ (Tuỳ chọn) Xoá session khi đóng tab
