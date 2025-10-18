// --------------------------------------------------------------------------------------------------------------
// backend/scan.js - Dual Mode: Laptop (WebRTC) <-> RasPi (MJPEG)

document.addEventListener("DOMContentLoaded", () => {
  // ✅ CÁC BIẾN BẠN NÊU ĐANG Ở ĐÂY
  const cameraWrapper = document.querySelector(".face-scan-wrapper");
  const statusEl = document.querySelector("#status");
  const BRIDGE_SERVER = "https://smart-locker-kgnx.onrender.com/raspi";
  const RASPI_NGROK = "https://adelaida-gymnogynous-gnostically.ngrok-free.dev";
  const LOCAL_IP_CHECK = ["localhost", "127.0.0.1", "192.168."];

  // Lấy thông tin người dùng (Đã sửa ở lần trước)
  const userRaw = sessionStorage.getItem("user");
  const currentUser = userRaw ? JSON.parse(userRaw) : null;
  const currentUserId = currentUser ? currentUser.id : null;

  let mediaStream = null;
  let isRasPiMode = false;
  let recognitionInterval = null;

  // Kiểm tra xem người dùng có tồn tại không
  if (!currentUser) {
    alert("Lỗi: Không tìm thấy thông tin người dùng. Đang quay lại...");
    window.location.href = "logon.html";
    return;
  }

  // 1. Thiết lập giao diện và chế độ Camera
  function setupCameraInterface() {
    const currentUrl = window.location.href;
    const isLocal =
      LOCAL_IP_CHECK.some((ip) => currentUrl.includes(ip)) ||
      currentUrl.includes(RASPI_NGROK);

    const oldEl = document.querySelector("#cameraPreview");
    if (oldEl) oldEl.remove();

    if (isLocal) {
      isRasPiMode = true;
      console.log("Mode: Raspberry Pi Camera (Local/Ngrok)");

      const img = document.createElement("img");
      img.id = "cameraPreview";
      img.alt = "Raspberry Pi Camera Preview";
      img.src = `${currentUrl.split(":")[0]}://127.0.0.1:5000/video_feed`;
      img.style.maxWidth = "90%";
      img.style.borderRadius = "12px";
      cameraWrapper.appendChild(img);
      statusEl.textContent = "🎥 Live stream from Raspberry Pi";
      statusEl.style.color = "#00ffff";

      pollRecognition();
    } else {
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
    // Nếu đã tìm thấy, dừng lại
    if (recognitionInterval) {
      clearTimeout(recognitionInterval);
      recognitionInterval = null;
    }

    let endpoint = `${BRIDGE_SERVER}/recognize`;
    let method = "GET";
    let payload = {};

    if (!isRasPiMode) {
      // CHẾ ĐỘ LAPTOP
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

      endpoint = `${BRIDGE_SERVER}/recognize-remote`;
      method = "POST";
      payload = { image_data: base64Image };
      statusEl.textContent = "🔄 Sending frame for recognition...";
      statusEl.style.color = "#ffaa00";
    } else {
      // CHẾ ĐỘ RASPI
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
      // Xử lý kết quả
      handleRecognitionResult(data);
    } catch (err) {
      console.error("Recognition polling error:", err);
      statusEl.textContent = "⚠️ Recognition error: Bridge/RasPi issue";
      statusEl.style.color = "#ffaa00";
      // Thử lại sau 3 giây nếu lỗi mạng
      recognitionInterval = setTimeout(pollRecognition, 3000);
    }
  }

  // 4. Xử lý kết quả nhận diện
  function handleRecognitionResult(data) {
    // Logic so sánh tên người dùng đã chính xác
    if (
      data.success &&
      data.name &&
      data.name.toLowerCase() === currentUser.name.toLowerCase()
    ) {
      statusEl.textContent = `🔓 Welcome, ${data.name}! Đang mở khóa...`;
      statusEl.style.color = "#00ff66";

      // Dừng vòng lặp nhận diện
      if (recognitionInterval) clearTimeout(recognitionInterval);

      const lockerId = sessionStorage.getItem("locker_to_open");
      if (lockerId && window.openLockerSuccess) {
        // Gọi hàm thành công (Hàm này sẽ xử lý mở Pi và chuyển hướng)
        window.openLockerSuccess(lockerId);
      } else {
        alert(
          "Lỗi: Đã nhận diện thành công nhưng không tìm thấy lockerId hoặc hàm openLockerSuccess."
        );
      }
    } else {
      // Nhận diện thất bại hoặc là người lạ (Unknown)
      statusEl.textContent = "🔒 Face not recognized. Trying again...";
      statusEl.style.color = "#ff3333";
      // Lặp lại sau 3 giây
      recognitionInterval = setTimeout(pollRecognition, 3000);
    }
  }

  setupCameraInterface();
});
