// // backend/scan.js
// document.addEventListener("DOMContentLoaded", () => {
//   const videoEl = document.querySelector("#cameraPreview");
//   const statusEl = document.querySelector("#status");

//   // 🌐 Render bridge (trung gian GitHub Pages <-> RasPi)
//   const BRIDGE_SERVER = "https://smart-locker-kgnx.onrender.com/raspi";

//   // 🌍 Ngrok link RasPi (sao chép từ terminal ngrok)
//   const RASPI_NGROK = "https://superbenevolent-maya-preroyally.ngrok-free.dev";

//   // 🟢 Kiểm tra kết nối Render Bridge
//   async function checkConnection() {
//     try {
//       const res = await fetch(`${BRIDGE_SERVER}/status`);
//       if (res.ok) {
//         statusEl.textContent = "✅ Connected to Render Bridge";
//         statusEl.style.color = "#00ff66";
//       } else throw new Error("Not OK");
//     } catch {
//       statusEl.textContent = "❌ Cannot connect to Render Bridge";
//       statusEl.style.color = "#ff3333";
//     }
//   }

//   // 🎥 Mở video stream trực tiếp từ RasPi
//   function startVideoStream() {
//     videoEl.src = `${RASPI_NGROK}/video_feed`; // MJPEG stream
//   }

//   // 🔄 Nhận diện khuôn mặt định kỳ
//   async function pollRecognition() {
//     try {
//       const res = await fetch(`${BRIDGE_SERVER}/recognize`);
//       const data = await res.json();
//       if (data.success && data.name && data.name !== "Unknown") {
//         statusEl.textContent = `🔓 Welcome, ${data.name}!`;
//         statusEl.style.color = "#00ff66";
//       } else {
//         statusEl.textContent = "🔒 Face not recognized";
//         statusEl.style.color = "#ff3333";
//       }
//     } catch (err) {
//       console.error("Recognition polling error:", err);
//       statusEl.textContent = "⚠️ Recognition error";
//       statusEl.style.color = "#ffaa00";
//     }

//     setTimeout(pollRecognition, 3000);
//   }

//   // 🚀 Khởi chạy
//   checkConnection();
//   startVideoStream();
//   pollRecognition();
// });
// --------------------------------------------------------------------------------------------------------------
// backend/scan.js - Dual Mode: Laptop (WebRTC) <-> RasPi (MJPEG)

document.addEventListener("DOMContentLoaded", () => {
  const cameraWrapper = document.querySelector(".face-scan-wrapper");
  const statusEl = document.querySelector("#status");
  const BRIDGE_SERVER = "https://smart-locker-kgnx.onrender.com/raspi";
  const RASPI_NGROK = "https://superbenevolent-maya-preroyally.ngrok-free.dev"; // ✅ Đã thêm lại Ngrok URL
  const LOCAL_IP_CHECK = ["localhost", "127.0.0.1", "192.168."];

  let mediaStream = null;
  let isRasPiMode = false;
  let recognitionInterval = null;

  // 1. Thiết lập giao diện và chế độ Camera
  function setupCameraInterface() {
    const currentUrl = window.location.href;
    // Thêm kiểm tra RASPI_NGROK vào isLocal để phân biệt RasPi chạy qua Ngrok
    const isLocal =
      LOCAL_IP_CHECK.some((ip) => currentUrl.includes(ip)) ||
      currentUrl.includes(RASPI_NGROK);

    const oldEl = document.querySelector("#cameraPreview");
    if (oldEl) oldEl.remove();

    // ✅ CHẾ ĐỘ RASPI (Chạy cục bộ trên RasPi hoặc qua Ngrok)
    if (isLocal) {
      isRasPiMode = true;
      console.log("Mode: Raspberry Pi Camera (Local/Ngrok)");

      const img = document.createElement("img");
      img.id = "cameraPreview";
      img.alt = "Raspberry Pi Camera Preview";
      // Dùng 127.0.0.1:5000 cho RasPi Server chạy cục bộ
      img.src = `${currentUrl.split(":")[0]}://127.0.0.1:5000/video_feed`;
      img.style.maxWidth = "90%";
      img.style.borderRadius = "12px";
      cameraWrapper.appendChild(img);
      statusEl.textContent = "🎥 Live stream from Raspberry Pi";
      statusEl.style.color = "#00ffff";

      pollRecognition(); // Bắt đầu nhận diện RasPi
    }
    // ✅ CHẾ ĐỘ LAPTOP (Chạy trên máy tính từ xa)
    else {
      isRasPiMode = false;
      console.log("Mode: Laptop Camera (Remote)");

      const video = document.createElement("video");
      video.id = "laptopCamera";
      video.autoplay = true;
      video.style.maxWidth = "90%";
      video.style.borderRadius = "12px";
      cameraWrapper.appendChild(video);
      startLaptopCamera(video);
    }
  }

  // 2. Kích hoạt camera Laptop (WebRTC)
  async function startLaptopCamera(videoEl) {
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoEl.srcObject = mediaStream;
      statusEl.textContent = "🎥 Live stream from Laptop Camera";
      statusEl.style.color = "#00ffff";
      videoEl.onloadedmetadata = () => {
        pollRecognition();
      };
    } catch (err) {
      console.error("Lỗi truy cập camera:", err);
      statusEl.textContent =
        "❌ Cannot access Laptop Camera. Check permissions.";
      statusEl.style.color = "#ff3333";
    }
  }

  // 3. Logic Nhận diện khuôn mặt định kỳ
  async function pollRecognition() {
    let endpoint = `${BRIDGE_SERVER}/recognize`; // Endpoint RasPi (GET)
    let method = "GET";
    let payload = {};

    if (!isRasPiMode) {
      // CHẾ ĐỘ LAPTOP: Chụp ảnh WebRTC và gửi Base64
      if (!mediaStream) {
        recognitionInterval = setTimeout(pollRecognition, 3000);
        return;
      }

      const videoEl = document.querySelector("#laptopCamera");
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];

      endpoint = `${BRIDGE_SERVER}/recognize-remote`; // Endpoint Remote Recognize (POST)
      method = "POST";
      payload = { image_data: base64Image };
      statusEl.textContent = "🔄 Sending frame for recognition...";
      statusEl.style.color = "#ffaa00";
    } else {
      // CHẾ ĐỘ RASPI: Gửi lệnh RasPi tự nhận diện (dùng endpoint GET)
      statusEl.textContent = "🔄 Requesting face recognition from RasPi...";
      statusEl.style.color = "#ffaa00";
    }

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify(payload) : undefined,
      });
      const data = await res.json();
      handleRecognitionResult(data);
    } catch (err) {
      console.error("Recognition polling error:", err);
      statusEl.textContent = "⚠️ Recognition error: Bridge/RasPi issue";
      statusEl.style.color = "#ffaa00";
    }

    // Lặp lại sau 3 giây
    recognitionInterval = setTimeout(pollRecognition, 3000);
  }

  // 4. Xử lý kết quả nhận diện
  function handleRecognitionResult(data) {
    if (data.success && data.name && data.name !== "Unknown") {
      statusEl.textContent = `🔓 Welcome, ${data.name}!`;
      statusEl.style.color = "#00ff66";
    } else {
      statusEl.textContent = "🔒 Face not recognized";
      statusEl.style.color = "#ff3333";
    }
  }

  setupCameraInterface();
});
