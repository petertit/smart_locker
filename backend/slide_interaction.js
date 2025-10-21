// backend/slide_interaction.js - Tương tác với slider trên index.html

document.addEventListener("DOMContentLoaded", () => {
  const sliderTrack = document.querySelector(".slider-track");
  if (!sliderTrack) return;

  // Lắng nghe sự kiện click trên toàn bộ track
  sliderTrack.addEventListener("click", (e) => {
    // Tìm slide gần nhất được click (không phải clone)
    const slide = e.target.closest(".slide:not(.clone)");
    if (!slide) return;

    e.preventDefault(); // Ngăn chuyển trang mặc định của thẻ <a>

    const lockerId = slide.dataset.lockerId; // Lấy ID tủ từ slide

    // --- Logic tương tác giống hệt open.js ---
    if (!window.handleLockerClick) {
      console.error("Lỗi: Hàm handleLockerClick (từ open.js) không tồn tại.");
      alert("Lỗi tải chức năng tương tác tủ khóa.");
      return;
    }

    // Gọi hàm xử lý click từ open.js
    window.handleLockerClick(lockerId);
  });

  // Hàm để cập nhật UI của slider (sẽ được gọi bởi open.js)
  window.updateSliderUI = (lockerStates) => {
    const slides = sliderTrack.querySelectorAll(".slide:not(.clone)"); // Chỉ lấy slide thật

    slides.forEach((slide) => {
      const lockerId = slide.dataset.lockerId;
      const state = lockerStates[lockerId] || { status: "EMPTY", userId: null };
      const userRaw = sessionStorage.getItem("user");
      const currentUser = userRaw ? JSON.parse(userRaw) : null;
      const currentUserId = currentUser ? currentUser.id : null;

      // Reset style
      slide.classList.remove("status-empty", "status-locked", "status-open");
      slide.style.border = "3px solid rgba(255, 255, 255, 0.6)"; // Reset viền mặc định
      slide.style.backgroundColor = ""; // Reset nền

      // Xóa nút cũ (nếu có)
      slide.querySelectorAll(".slide-button").forEach((btn) => btn.remove());

      // Áp dụng style dựa trên trạng thái
      if (state.status === "EMPTY") {
        slide.classList.add("status-empty");
        // Giữ viền trắng mặc định
      } else if (state.status === "LOCKED") {
        slide.classList.add("status-locked");
        if (state.userId === currentUserId) {
          // Của tôi, đang khóa
          slide.style.border = "3px solid red";
          addSlideButton(slide, "HỦY ĐĂNG KÝ", "#ff6600", () =>
            handleUnregister(lockerId)
          );
        } else {
          // Của người khác, đang khóa
          slide.style.border = "3px solid red";
          slide.style.opacity = "0.7"; // Làm mờ đi
        }
      } else if (state.status === "OPEN") {
        if (state.userId === currentUserId) {
          // Của tôi, đang mở
          slide.classList.add("status-open");
          slide.style.border = "3px solid lime"; // Xanh lá
          addSlideButton(slide, "ĐÓNG TỦ", "yellow", () =>
            handleCloseLocker(lockerId)
          );
        } else {
          // Của người khác, đang mở
          slide.classList.add("status-locked"); // Vẫn coi là bị khóa
          slide.style.border = "3px solid orange"; // Cam
          slide.style.opacity = "0.7";
        }
      }
    });
  };

  // Hàm phụ trợ để thêm nút vào slide
  function addSlideButton(slide, text, color, onClickHandler) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = "slide-button"; // Class để CSS và xóa
    // Style cơ bản cho nút
    button.style.position = "absolute";
    button.style.bottom = "15px"; // Đặt cao hơn một chút
    button.style.left = "50%";
    button.style.transform = "translateX(-50%)";
    button.style.padding = "6px 12px";
    button.style.fontSize = "14px";
    button.style.backgroundColor = color;
    button.style.color = color === "yellow" ? "black" : "white"; // Chữ đen cho nền vàng
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.zIndex = "5"; // Nổi trên overlay
    button.style.opacity = "0"; // Ẩn ban đầu
    button.style.visibility = "hidden";
    button.style.transition = "opacity 0.2s ease";

    button.onclick = (e) => {
      e.preventDefault(); // Ngăn thẻ <a>
      e.stopPropagation(); // Ngăn sự kiện click vào slide
      onClickHandler();
    };

    slide.appendChild(button);

    // Hiện nút khi hover slide (không phải overlay)
    slide.onmouseenter = () => {
      button.style.visibility = "visible";
      button.style.opacity = "1";
    };
    slide.onmouseleave = () => {
      button.style.visibility = "hidden";
      button.style.opacity = "0";
    };
  }
});
