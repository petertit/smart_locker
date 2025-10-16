// pass_lock_login.js — Kiểm tra mã khóa tủ & mở tủ
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) {
    alert("⚠️ Bạn cần đăng nhập trước khi mở tủ!");
    window.location.href = "logon.html";
    return;
  }

  const form = document.getElementById("loginLockerForm");
  const input = document.getElementById("lockerCode");
  const row3 = document.getElementById("row3");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const entered = input.value.trim();

    if (!entered) {
      alert("⚠️ Vui lòng nhập mã khóa tủ!");
      return;
    }

    if (entered === user.lockerCode) {
      row3.textContent = "✅ Mã chính xác — tủ đang mở...";
      row3.style.color = "#00ff66";
      alert("✅ Mở tủ thành công!");

      // 👉 Gửi tín hiệu mở khóa về Raspberry Pi (nếu có endpoint)
      try {
        await fetch("https://smart-locker-kgnx.onrender.com/raspi/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: user.email }),
        });
      } catch (err) {
        console.warn("⚠️ Không thể gửi lệnh mở khóa:", err.message);
      }
    } else {
      row3.textContent = "❌ Mã khóa không đúng!";
      row3.style.color = "#ff3333";
    }

    input.value = "";
  });
});
