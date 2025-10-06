// camera_loader.js
(async function () {
  const takeBtn = document.querySelector(".take-btn");
  const faceImg = document.querySelector(".face_scan");

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    if (window.CameraClient && typeof window.CameraClient.init === "function") {
      await window.CameraClient.init();
      console.log("✅ Using local browser camera (CameraClient)");
    } else {
      console.warn("⚠️ CameraClient not loaded");
    }
  } else {
    if (window.CameraPi && typeof window.CameraPi.init === "function") {
      window.CameraPi.init();
      console.log("✅ Using Raspberry Pi camera (CameraPi)");
    } else {
      console.warn("⚠️ CameraPi not loaded or API unavailable");
    }
  }
})();
