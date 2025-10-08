// js/face_id.js
document.addEventListener("DOMContentLoaded", () => {
  const takeBtn = document.querySelector(".take-btn");
  const videoEl = document.querySelector("#cameraPreview");
  const statusEl = document.querySelector("#status");

  const RASPI_SERVER = "http://raspi.local:5000"; // hoặc IP thật của RasPi

  // Kiểm tra kết nối đến Raspberry
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

  // Yêu cầu RasPi bật camera preview
  async function startPreview() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = stream;
    } catch (err) {
      console.error("Cannot access local camera:", err);
    }
  }

  // Khi bấm nút Take → RasPi chụp ảnh và train
  takeBtn.addEventListener("click", async () => {
    statusEl.textContent = "📸 Capturing...";
    try {
      const res = await fetch(`${RASPI_SERVER}/capture`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        statusEl.textContent = "✅ Image captured & training started!";
      } else {
        statusEl.textContent = "⚠️ Failed: " + (data.error || "Unknown error");
      }
    } catch (err) {
      statusEl.textContent = "❌ Cannot contact Raspberry Pi!";
    }
  });

  // Khi mở trang
  checkConnection();
  startPreview();
});
