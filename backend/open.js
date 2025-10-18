const RENDER_BRIDGE = "https://smart-locker-kgnx.onrender.com";
const LOCKER_COUNT = 9; // Tổng số tủ khóa (01 đến 09)

// Lấy thông tin người dùng đang đăng nhập
const userRaw = sessionStorage.getItem("user");
const currentUser = userRaw ? JSON.parse(userRaw) : null;
// ✅ SỬA LỖI: Đã chuẩn hóa ID, chỉ cần dùng user.id
const currentUserId = currentUser ? currentUser.id : null;

// Biến lưu trữ trạng thái tủ khóa toàn cục (lockerId -> {status, userId})
let lockerStates = {};

// 1. Quản lý trạng thái tủ khóa trên MongoDB Atlas
async function fetchLockerStates() {
  try {
    const res = await fetch(`${RENDER_BRIDGE}/lockers/status`);
    if (!res.ok) throw new Error("Failed to fetch locker status");

    const data = await res.json(); // data là { success: true, lockers: [...] }

    // ✅ SỬA LỖI 1: Phải truy cập data.lockers (là mảng)
    if (!data.lockers || !Array.isArray(data.lockers)) {
      throw new Error("Invalid data structure from server");
    }

    lockerStates = data.lockers.reduce((acc, locker) => {
      acc[locker.lockerId] = {
        status: locker.status,
        // ✅ SỬA LỖI 2: Server trả về 'ownerId', không phải 'userId'
        userId: locker.ownerId,
      };
      return acc;
    }, {});

    updateGridUI();
  } catch (err) {
    console.error("Error loading locker states:", err);
    // Thêm chi tiết lỗi vào alert
    alert("Không thể tải trạng thái tủ khóa: " + err.message);
  }
}

async function updateLockerStatus(lockerId, newStatus) {
  if (!currentUserId) return;

  // Khi đóng tủ (LOCKED), ta không cần gửi ownerId nữa (server sẽ tự gán null)
  // Khi mở tủ (OPEN), ta gán ownerId là mình
  const ownerId = newStatus === "OPEN" ? currentUserId : null;

  const payload = {
    lockerId: lockerId,
    status: newStatus,
    ownerId: ownerId,
  };

  try {
    const res = await fetch(`${RENDER_BRIDGE}/lockers/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      // Cập nhật trạng thái cục bộ
      lockerStates[lockerId] = {
        status: newStatus,
        userId: data.locker.ownerId, // Server trả về ownerId
      };
      updateGridUI();
      return true;
    } else {
      alert(`❌ Lỗi: ${data.error || "Không thể cập nhật trạng thái tủ."}`);
      return false;
    }
  } catch (err) {
    alert("❌ Lỗi kết nối khi cập nhật tủ.");
    return false;
  }
}

// 2. Cập nhật giao diện (UI) dựa trên trạng thái tủ khóa
function updateGridUI() {
  const gridItems = document.querySelectorAll(".grid-item");

  gridItems.forEach((item) => {
    const lockerId = item.dataset.lockerId;
    const state = lockerStates[lockerId] || { status: "EMPTY", userId: null };

    // Xóa tất cả trạng thái màu cũ
    item.classList.remove("status-empty", "status-locked", "status-open");
    item.style.border = "none";
    item.style.backgroundColor = "transparent"; // Reset nền

    // Xóa nút Close cũ (nếu có)
    const existingCloseBtn = item.querySelector(".close-btn");
    if (existingCloseBtn) existingCloseBtn.remove();

    // 🚨 Logic Màu và Trạng Thái
    if (state.status === "EMPTY") {
      // Tủ trống: Không màu, sẵn sàng đăng ký
      item.classList.add("status-empty");
      // Giữ viền xanh mặc định (từ CSS)
      item.style.border = ""; // Xóa border inline để CSS áp dụng
    } else if (state.status === "LOCKED") {
      // Tủ đã đóng: Màu đỏ, đã có người đăng ký
      item.classList.add("status-locked");
      item.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
      item.style.border = "2px solid red";
    } else if (state.status === "OPEN") {
      // Tủ đang mở:
      // Nếu là người dùng đang mở tủ này
      if (state.userId === currentUserId) {
        item.classList.add("status-open");
        item.style.backgroundColor = "rgba(0, 255, 0, 0.2)";
        item.style.border = "2px solid green";

        // Thêm nút Đóng tủ
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "CLOSE";
        closeBtn.className = "close-btn"; // (Bạn cần thêm style cho .close-btn trong CSS)
        closeBtn.style.position = "absolute";
        closeBtn.style.bottom = "10px";
        closeBtn.style.left = "50%";
        closeBtn.style.transform = "translateX(-50%)";
        closeBtn.style.zIndex = "10";
        closeBtn.style.padding = "5px 10px";
        closeBtn.style.backgroundColor = "yellow";
        closeBtn.style.color = "black";
        closeBtn.style.border = "none";
        closeBtn.style.borderRadius = "5px";
        closeBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation(); // Ngăn sự kiện click vào tủ
          handleCloseLocker(lockerId);
        };
        item.appendChild(closeBtn);
      } else {
        // Tủ đang mở bởi người khác: hiện đỏ (bị chiếm)
        item.classList.add("status-locked");
        item.style.backgroundColor = "rgba(255, 165, 0, 0.4)"; // Cam (Đang bị chiếm)
        item.style.border = "2px solid orange";
      }
    }
  });
}

// 3. Xử lý sự kiện khi click vào tủ
function handleLockerClick(lockerId) {
  if (!currentUserId) {
    alert("Bạn cần đăng nhập để mở tủ.");
    window.location.href = "./logon.html";
    return;
  }

  const state = lockerStates[lockerId] || { status: "EMPTY", userId: null };

  if (state.status === "EMPTY") {
    // Tủ trống: Yêu cầu đăng ký
    if (confirm(`Tủ ${lockerId} đang trống. Bạn muốn đăng ký và mở tủ?`)) {
      // Lưu số tủ vào sessionStorage và chuyển đến trang chọn phương thức đăng nhập
      sessionStorage.setItem("locker_to_open", lockerId);
      window.location.href = "./face_log.html"; // Chuyển đến trang chọn phương thức ID/Pass
    }
  } else if (state.userId === currentUserId) {
    // Tủ của tôi:
    if (state.status === "LOCKED") {
      // Tủ của tôi, đang khóa -> Hỏi mở
      if (confirm(`Đây là tủ của bạn. Bạn muốn mở khóa tủ ${lockerId}?`)) {
        sessionStorage.setItem("locker_to_open", lockerId);
        window.location.href = "./face_log.html";
      }
    } else {
      // Tủ của tôi, đang mở -> không làm gì (nút CLOSE đã có)
      alert(`Tủ ${lockerId} của bạn đang mở.`);
    }
  } else {
    // Tủ đã có người khác đăng ký/chiếm
    alert(
      `Tủ ${lockerId} đang ${
        state.status === "OPEN" ? "được sử dụng" : "đã được đăng ký"
      } bởi người khác.`
    );
  }
}

// 4. Xử lý đóng tủ
function handleCloseLocker(lockerId) {
  if (confirm(`Bạn có chắc muốn đóng tủ ${lockerId} và khóa nó?`)) {
    updateLockerStatus(lockerId, "LOCKED");
  }
}

// 5. Xử lý đăng xuất (Tự động đóng tủ đang mở)
// Đổi tên hàm để auth_protect.js có thể gọi
window.handleLogoutAndLock = function () {
  if (currentUserId) {
    const openUserLockers = [];
    Object.keys(lockerStates).forEach((lockerId) => {
      const state = lockerStates[lockerId];
      if (state.status === "OPEN" && state.userId === currentUserId) {
        openUserLockers.push(updateLockerStatus(lockerId, "LOCKED"));
      }
    });

    if (openUserLockers.length > 0) {
      // Đợi tất cả các tủ đóng lại
      Promise.all(openUserLockers).then(() => {
        sessionStorage.removeItem("user");
        alert("Đã đóng tủ của bạn. Đăng xuất thành công.");
        window.location.href = "logon.html";
      });
    } else {
      // Không có tủ nào đang mở, đăng xuất ngay
      sessionStorage.removeItem("user");
      alert("Đăng xuất thành công.");
      window.location.href = "logon.html";
    }
  } else {
    // Trường hợp không có user (dù không nên xảy ra)
    sessionStorage.removeItem("user");
    window.location.href = "logon.html";
  }
};

// 6. Xử lý mở tủ thành công (Callback từ pass_lock_login.js / scan.js)
window.openLockerSuccess = (lockerId) => {
  // 1. Cập nhật trạng thái tủ trên server thành 'OPEN'
  updateLockerStatus(lockerId, "OPEN").then((success) => {
    if (success) {
      alert(`🔓 Tủ ${lockerId} đã mở thành công!`);
      // 2. Chuyển hướng về trang Open.html để thấy trạng thái mới
      window.location.href = "./open.html";
    } else {
      alert(`❌ Không thể mở tủ ${lockerId}. Vui lòng thử lại.`);
    }
  });
};

// 7. Khởi chạy
document.addEventListener("DOMContentLoaded", () => {
  // 7.1. Gán sự kiện click cho các tủ
  const gridContainer = document.querySelector(".grid-container");
  if (gridContainer) {
    gridContainer.addEventListener("click", (e) => {
      const item = e.target.closest(".grid-item");
      // Ngăn click nếu đang bấm nút close
      if (item && !e.target.classList.contains("close-btn")) {
        e.preventDefault();
        handleLockerClick(item.dataset.lockerId);
      }
    });
  }

  // 7.2. Tải trạng thái tủ khóa
  fetchLockerStates();
});
