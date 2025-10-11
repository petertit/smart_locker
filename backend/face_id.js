// backend/face_id.js
document.addEventListener("DOMContentLoaded", () => {
  const takeBtn = document.querySelector(".take-btn");
  const cameraImg = document.querySelector("#cameraPreview");
  const statusEl = document.querySelector("#status");

  // 🌐 Render trung gian (backend)
  const BRIDGE_SERVER = "https://smart-locker-kgnx.onrender.com/raspi";

  // 🌍 Địa chỉ ngrok RasPi (chạy ngrok http 5000 để lấy link mới)
  const RASPI_NGROK = "https://kristen-unwarmable-jesenia.ngrok-free.dev";

  // 🟢 Kiểm tra kết nối RasPi qua Render
  async function checkConnection() {
    try {
      const res = await fetch(`${BRIDGE_SERVER}/status`);
      const data = await res.json();
      if (res.ok && data.status) {
        statusEl.textContent = "✅ Connected to Raspberry Pi";
        statusEl.style.color = "#00ff66";
      } else throw new Error();
    } catch {
      statusEl.textContent = "❌ Cannot connect to Raspberry Pi";
      statusEl.style.color = "#ff3333";
    }
  }

  // 🎥 Hiển thị camera RasPi (MJPEG stream)
  function startRasPiPreview() {
    cameraImg.src = `${RASPI_NGROK}/video_feed`; // dùng <img> để load MJPEG
    cameraImg.style.display = "block";
    cameraImg.style.width = "640px";
    cameraImg.style.height = "480px";
    cameraImg.style.borderRadius = "10px";
    cameraImg.style.border = "2px solid #1a73e8";
    statusEl.textContent = "🎥 Live stream from Raspberry Pi";
    statusEl.style.color = "#00ffff";
  }

  // 📸 Khi bấm TAKE → gửi yêu cầu RasPi chụp & train
  takeBtn.addEventListener("click", async () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const username = user?.name || user?.username || "unknown";

    statusEl.textContent = "📸 Capturing photo from Raspberry Pi...";
    statusEl.style.color = "#ffaa00";

    try {
      const res = await fetch(`${BRIDGE_SERVER}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username }),
      });
      const data = await res.json();

      if (data.success) {
        statusEl.textContent = `✅ Photo captured & training done (${data.saved_file})`;
        statusEl.style.color = "#00ff66";
      } else {
        statusEl.textContent = "❌ " + (data.error || "Failed to capture");
        statusEl.style.color = "#ff3333";
      }
    } catch (err) {
      console.error("Fetch error:", err);
      statusEl.textContent = "❌ Cannot contact Raspberry Pi!";
      statusEl.style.color = "#ff3333";
    }
  });

  // 🚀 Khởi động
  checkConnection();
  startRasPiPreview();
});
