// camera_pi.js
(function () {
  const IMG_SELECTOR = ".face_scan";
  const TAKE_BTN_SELECTOR = ".take-btn";
  const PI_CAPTURE_URL = "http://192.168.1.50:5000/capture"; // Thay IP thật của Pi

  async function requestPiCapture() {
    try {
      const res = await fetch(PI_CAPTURE_URL, { method: "POST" });
      const j = await res.json();
      if (!j.image) throw new Error("No image returned");

      const img = document.querySelector(IMG_SELECTOR);
      if (img) img.src = j.image;
    } catch (err) {
      console.error("CameraPi error:", err);
      alert("Không thể kết nối Raspberry Pi: " + err.message);
    }
  }

  function bindControls() {
    const btn = document.querySelector(TAKE_BTN_SELECTOR);
    if (btn) btn.addEventListener("click", requestPiCapture);
    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        requestPiCapture();
      }
    });
  }

  window.CameraPi = {
    init: bindControls,
    capture: requestPiCapture,
  };
})();
