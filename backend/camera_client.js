// camera_client.js
(function () {
  const VIDEO_ID = "cameraPreviewVideo";
  const IMG_SELECTOR = ".face_scan";
  const TAKE_BTN_SELECTOR = ".take-btn";
  let stream = null;
  let video = null;
  let canvas = null;

  function createVideoElement() {
    const v = document.createElement("video");
    v.id = VIDEO_ID;
    v.autoplay = true;
    v.playsInline = true;
    v.style.maxWidth = "500px";
    v.style.borderRadius = "12px";
    return v;
  }

  async function startLocalCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      const img = document.querySelector(IMG_SELECTOR);
      if (!img) return;

      const wrapper = img.parentElement;
      const vid = createVideoElement();
      wrapper.replaceChild(vid, img);
      vid.srcObject = stream;

      canvas = document.createElement("canvas");

      const btn = document.querySelector(TAKE_BTN_SELECTOR);
      if (btn) btn.addEventListener("click", captureAndShow);

      window.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
          e.preventDefault();
          captureAndShow();
        }
      });

      return true;
    } catch (err) {
      console.error("CameraClient error:", err);
      return false;
    }
  }

  function captureAndShow() {
    if (!video) video = document.getElementById(VIDEO_ID);
    if (!video || !video.videoWidth) return alert("Camera not ready");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    const vidEl = document.getElementById(VIDEO_ID);
    const wrapper = vidEl.parentElement;
    const img = document.createElement("img");
    img.className = "face_scan";
    img.src = dataUrl;
    img.alt = "Captured Image";
    img.style.width = "500px";
    img.style.height = "auto";
    wrapper.replaceChild(img, vidEl);

    stopCamera();
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  window.CameraClient = {
    init: startLocalCamera,
    capture: captureAndShow,
  };
})();
