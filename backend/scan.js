// backend/scan.js
document.addEventListener("DOMContentLoaded", () => {
  const videoEl = document.querySelector("#cameraPreview");
  const statusEl = document.querySelector("#status");

  // 🌐 Render server trung gian
  const BRIDGE_SERVER = "https://smart-locker-kgnx.onrender.com/raspi";

  // 🌍 Ngrok RasPi — copy từ terminal ngrok của bạn!
  const RASPI_NGROK = "https://kristen-unwarmable-jesenia.ngrok-free.dev";

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

  // 🎥 Mở video stream từ RasPi qua ngrok
  function startVideoStream() {
    videoEl.src = `${RASPI_NGROK}/video_feed`; // trực tiếp từ RasPi
  }

  // 🔄 Gọi nhận diện khuôn mặt (qua Render → RasPi)
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

  // 🚀 Khởi động
  checkConnection();
  startVideoStream();
  pollRecognition();
});
