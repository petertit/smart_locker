// backend/scan.js

// backend/scan.js
document.addEventListener("DOMContentLoaded", () => {
  const videoEl = document.querySelector("#cameraPreview");
  const statusEl = document.querySelector("#status");

  // Thay IP này bằng IP thật của Raspberry Pi
  const RASPI_SERVER = "https://smart-locker-kgnx.onrender.com"; // đổi IP thật

  // 🟢 Kiểm tra kết nối RasPi
  async function checkConnection() {
    try {
      const res = await fetch(`${RASPI_SERVER}/status`);
      if (res.ok) {
        statusEl.textContent = "✅ Raspberry Pi Connected";
        statusEl.style.color = "#00ff66";
      } else {
        throw new Error("Not OK");
      }
    } catch (err) {
      statusEl.textContent = "❌ Cannot connect to Raspberry Pi";
      statusEl.style.color = "#ff3333";
    }
  }

  // 🎥 Mở stream video từ RasPi
  function startVideoStream() {
    videoEl.src = `${RASPI_SERVER}/video_feed`;
  }

  // 🔄 Nhận dữ liệu nhận diện khuôn mặt liên tục
  async function pollRecognition() {
    try {
      const res = await fetch(`${RASPI_SERVER}/recognize_stream`);
      if (res.ok) {
        const data = await res.json();
        if (data.name && data.name !== "Unknown") {
          statusEl.textContent = `🔓 Welcome, ${data.name}!`;
          statusEl.style.color = "#00ff66";
        } else {
          statusEl.textContent = "🔒 Face not recognized";
          statusEl.style.color = "#ff3333";
        }
      }
    } catch (err) {
      console.error("Recognition polling error:", err);
    }
    setTimeout(pollRecognition, 2000); // lặp lại mỗi 2 giây
  }

  // 🚀 Khởi động
  checkConnection();
  startVideoStream();
  pollRecognition();
});
