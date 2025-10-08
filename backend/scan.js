// js/scan.js
document.addEventListener("DOMContentLoaded", () => {
  const videoEl = document.querySelector("#cameraPreview");
  const detectBtn = document.querySelector(".detect-btn");
  const resultEl = document.querySelector("#result");

  const RASPI_SERVER = "http://raspi.local:5000"; // hoặc IP thật của RasPi

  async function startPreview() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = stream;
    } catch (err) {
      console.error("Cannot access local camera:", err);
    }
  }

  detectBtn.addEventListener("click", async () => {
    resultEl.textContent = "🔍 Recognizing...";
    try {
      const res = await fetch(`${RASPI_SERVER}/recognize`);
      const data = await res.json();
      if (data.success) {
        resultEl.textContent = `✅ Recognized: ${data.name}`;
      } else {
        resultEl.textContent = "⚠️ No face recognized.";
      }
    } catch (err) {
      resultEl.textContent = "❌ Connection to Raspberry Pi failed.";
    }
  });

  startPreview();
});
