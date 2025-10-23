// backend/scan.js - Dual Mode with Debugging
document.addEventListener("DOMContentLoaded", () => {
  // ✅ DEBUG: Check immediately if openLockerSuccess exists when DOM loads
  console.log(
    "scan.js DOMContentLoaded: window.openLockerSuccess is:",
    typeof window.openLockerSuccess,
    window.openLockerSuccess
  );

  const cameraWrapper = document.querySelector(".face-scan-wrapper");
  const statusEl = document.querySelector("#status");
  const BRIDGE_SERVER = "https://smart-locker-kgnx.onrender.com/raspi";
  const RASPI_NGROK = "https://adelaida-gymnogynous-gnostically.ngrok-free.dev";
  const LOCAL_IP_CHECK = ["localhost", "127.0.0.1", "192.168."];

  const userRaw = sessionStorage.getItem("user");
  const currentUser = userRaw ? JSON.parse(userRaw) : null;
  const currentUserId = currentUser ? currentUser.id : null;

  let mediaStream = null;
  let isRasPiMode = false;
  let recognitionInterval = null;

  if (!currentUser) {
    alert("Lỗi: Không tìm thấy thông tin người dùng. Đang quay lại...");
    window.location.href = "logon.html";
    return;
  }

  // --- Functions (setupCameraInterface, startLaptopCamera, pollRecognition) ---
  // These functions remain the same as the previous correct version
  function setupCameraInterface() {
    const currentUrl = window.location.href;
    const isLocal =
      LOCAL_IP_CHECK.some((ip) => currentUrl.includes(ip)) ||
      currentUrl.includes(RASPI_NGROK);
    const oldEl = document.querySelector("#cameraPreview, #laptopCamera"); // Select both possible elements
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
      /* ... error handling ... */
    }
  }

  async function pollRecognition() {
    if (recognitionInterval) {
      clearTimeout(recognitionInterval);
      recognitionInterval = null;
    } // Clear previous timer if any

    let endpoint = `${BRIDGE_SERVER}/recognize`;
    let method = "GET";
    let payload = {};

    // Prepare request based on mode
    if (!isRasPiMode) {
      // Laptop Mode
      if (
        !mediaStream ||
        !document.querySelector("#laptopCamera")?.videoWidth
      ) {
        console.log("Laptop camera stream not ready, retrying poll...");
        recognitionInterval = setTimeout(pollRecognition, 2000); // Retry sooner if stream isn't ready
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
      statusEl.textContent = "🔄 Sending frame...";
      statusEl.style.color = "#ffaa00";
    } else {
      // RasPi Mode
      statusEl.textContent = "🔄 Requesting recognition...";
      statusEl.style.color = "#ffaa00";
    }

    // Send request
    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify(payload) : undefined,
      });
      const data = await res.json();
      handleRecognitionResult(data); // Process result
    } catch (err) {
      console.error("Recognition polling error:", err);
      statusEl.textContent = "⚠️ Lỗi kết nối nhận diện";
      statusEl.style.color = "#ffaa00";
      // Retry after 3 seconds on network error
      recognitionInterval = setTimeout(pollRecognition, 3000);
    }
  }
  // --- End unchanged functions ---

  // 4. Xử lý kết quả nhận diện (ADDED DEBUG LOGS)
  function handleRecognitionResult(data) {
    console.log("Recognition result received:", data); // Log the raw result

    // Check if recognition was successful AND matches the current user
    if (
      data.success &&
      data.name &&
      currentUser &&
      data.name.toLowerCase() === currentUser.name.toLowerCase()
    ) {
      statusEl.textContent = `🔓 Welcome, ${data.name}! Đang xử lý mở khóa...`;
      statusEl.style.color = "#00ff66";

      // Stop further polling immediately
      if (recognitionInterval) clearTimeout(recognitionInterval);
      recognitionInterval = null;

      // ✅ DEBUG: Check for lockerId and openLockerSuccess HERE
      const lockerId = sessionStorage.getItem("locker_to_open");
      console.log("Inside handleRecognitionResult - lockerId:", lockerId);
      console.log(
        "Inside handleRecognitionResult - window.openLockerSuccess:",
        typeof window.openLockerSuccess
      );

      // Check AGAIN if both exist before calling
      if (lockerId && typeof window.openLockerSuccess === "function") {
        console.log(
          `Calling window.openLockerSuccess with lockerId: ${lockerId}`
        );
        window.openLockerSuccess(lockerId); // Call the function from open.js
      } else {
        // This is the error you are seeing
        console.error(
          "Error: Missing lockerId in sessionStorage OR window.openLockerSuccess is not a function."
        );
        alert(
          "Lỗi: Đã nhận diện thành công nhưng không tìm thấy lockerId hoặc hàm openLockerSuccess."
        );
      }
    } else {
      // Recognition failed or didn't match
      statusEl.textContent = "🔒 Không nhận diện được. Đang thử lại...";
      statusEl.style.color = "#ff3330"; // Red for failure
      // Continue polling after a delay
      if (!recognitionInterval) {
        // Prevent multiple timers if already set
        recognitionInterval = setTimeout(pollRecognition, 2000); // Try again sooner
      }
    }
  }

  // --- Initialization ---
  setupCameraInterface(); // Start the process
});
