// backend/scan.js
document.addEventListener("DOMContentLoaded", () => {
  const videoEl = document.querySelector("#cameraPreview");
  const statusEl = document.querySelector("#status");

  // 🌐 Render bridge (trung gian GitHub Pages <-> RasPi)
  const BRIDGE_SERVER = "https://smart-locker-kgnx.onrender.com/raspi";

  // 🌍 Ngrok link RasPi (sao chép từ terminal ngrok)
  const RASPI_NGROK = "https://superbenevolent-maya-preroyally.ngrok-free";

  // 🟢 Kiểm tra kết nối Render Bridge
  async function checkConnection() {
    try {
      const res = await fetch(`${BRIDGE_SERVER}/status`);
      if (res.ok) {
        statusEl.textContent = "✅ Connected to Render Bridge";
        statusEl.style.color = "#00ff66";
      } else throw new Error("Not OK");
    } catch {
      statusEl.textContent = "❌ Cannot connect to Render Bridge";
      statusEl.style.color = "#ff3333";
    }
  }

  // 🎥 Mở video stream trực tiếp từ RasPi
  function startVideoStream() {
    videoEl.src = `${RASPI_NGROK}/video_feed`; // MJPEG stream
  }

  // 🔄 Nhận diện khuôn mặt định kỳ
  async function pollRecognition() {
    try {
      const res = await fetch(`${BRIDGE_SERVER}/recognize`);
      const data = await res.json();
      if (data.success && data.name && data.name !== "Unknown") {
        statusEl.textContent = `🔓 Welcome, ${data.name}!`;
        statusEl.style.color = "#00ff66";
      } else {
        statusEl.textContent = "🔒 Face not recognized";
        statusEl.style.color = "#ff3333";
      }
    } catch (err) {
      console.error("Recognition polling error:", err);
      statusEl.textContent = "⚠️ Recognition error";
      statusEl.style.color = "#ffaa00";
    }

    setTimeout(pollRecognition, 3000);
  }

  // 🚀 Khởi chạy
  checkConnection();
  startVideoStream();
  pollRecognition();
});
