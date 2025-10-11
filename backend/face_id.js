// backend/face_id.js
document.addEventListener("DOMContentLoaded", () => {
  const takeBtn = document.querySelector(".take-btn");
  const videoEl = document.querySelector("#cameraPreview");
  const statusEl = document.querySelector("#status");

  // 🌐 Server trung gian (Render)
  const BRIDGE_SERVER = "https://smart-locker-kgnx.onrender.com/raspi";

  // 🌍 Link ngrok RasPi của bạn (lấy từ terminal ngrok trên RasPi)
  const RASPI_NGROK = "https://kristen-unwarmable-jesenia.ngrok-free.dev";

  // 🟢 Kiểm tra kết nối RasPi qua Render
  async function checkConnection() {
    try {
      const res = await fetch(`${BRIDGE_SERVER}/status`);
      const data = await res.json();
      if (res.ok && data.status) {
        statusEl.textContent = "✅ Connected to Raspberry Pi";
        statusEl.style.color = "#00ff66";
      } else throw new Error("Not OK");
    } catch {
      statusEl.textContent = "❌ Cannot connect to Raspberry Pi";
      statusEl.style.color = "#ff3333";
    }
  }

  // 🎥 Hiển thị video stream trực tiếp từ camera RasPi (qua ngrok)
  function startRasPiPreview() {
    videoEl.src = `${RASPI_NGROK}/video_feed`;
    videoEl.style.display = "block";
    statusEl.textContent = "🎥 Live view from Raspberry Pi";
    statusEl.style.color = "#00ffff";
  }

  // 📸 Khi bấm TAKE → Gửi yêu cầu RasPi chụp ảnh & train
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

  // 🚀 Khi trang tải
  checkConnection();
  startRasPiPreview();
});
