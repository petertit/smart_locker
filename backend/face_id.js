// backend/face_id.js
document.addEventListener("DOMContentLoaded", () => {
  const takeBtn = document.querySelector(".take-btn");
  const videoEl = document.querySelector("#cameraPreview");
  const statusEl = document.querySelector("#status");

  // 🔧 IP của Raspberry Pi server
  const RASPI_SERVER = "http://localhost:5000";
  // đổi IP thật

  async function checkConnection() {
    try {
      const res = await fetch(`${RASPI_SERVER}/status`);
      const data = await res.json();
      if (res.ok && data.status) {
        statusEl.textContent = "✅ Raspberry Pi Connected";
        statusEl.style.color = "#00ff66";
      } else throw new Error();
    } catch {
      statusEl.textContent = "❌ Cannot connect to Raspberry Pi";
      statusEl.style.color = "#ff3333";
    }
  }

  // Hiển thị camera (client-side preview)
  async function startPreview() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = stream;
    } catch (err) {
      console.warn("⚠️ Preview error:", err);
      statusEl.textContent = "⚠️ Local preview not available.";
    }
  }

  // Khi bấm TAKE → gửi yêu cầu RasPi chụp và train
  takeBtn.addEventListener("click", async () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const username = user?.name || user?.username || "unknown";

    statusEl.textContent = "📸 Capturing and training on Raspberry Pi...";
    statusEl.style.color = "#ffaa00";

    try {
      const res = await fetch(`${RASPI_SERVER}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username }),
      });
      const data = await res.json();

      if (data.success) {
        statusEl.textContent = `✅ Image saved & training complete! (${data.saved_file})`;
        statusEl.style.color = "#00ff66";
      } else {
        statusEl.textContent = "❌ " + (data.error || "Failed to capture");
        statusEl.style.color = "#ff3333";
      }
    } catch (err) {
      statusEl.textContent = "❌ Cannot contact Raspberry Pi!";
      statusEl.style.color = "#ff3333";
    }
  });

  checkConnection();
  startPreview();
});
