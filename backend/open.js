const RENDER_BRIDGE = "https://smart-locker-kgnx.onrender.com";
const LOCKER_COUNT = 9; // Tổng số tủ khóa (01 đến 09)

// Lấy thông tin người dùng đang đăng nhập
const userRaw = sessionStorage.getItem("user");
const currentUser = userRaw ? JSON.parse(userRaw) : null;
const currentUserId = currentUser ? currentUser._id || currentUser.id : null;

// Biến lưu trữ trạng thái tủ khóa toàn cục (lockerId -> {status, userId})
let lockerStates = {};

// 1. Quản lý trạng thái tủ khóa trên MongoDB Atlas
// Để đơn giản, chúng ta sẽ tạo các endpoint mới trên Render Bridge (account.js)

async function fetchLockerStates() {
  try {
    const res = await fetch(`${RENDER_BRIDGE}/lockers/status`);
    if (!res.ok) throw new Error("Failed to fetch locker status");

    const data = await res.json();
    lockerStates = data.reduce((acc, locker) => {
      acc[locker.lockerId] = {
        status: locker.status,
        userId: locker.userId,
      };
      return acc;
    }, {});

    updateGridUI();
  } catch (err) {
    console.error("Error loading locker states:", err);
    alert("Không thể tải trạng thái tủ khóa.");
  }
}

async function updateLockerStatus(lockerId, newStatus) {
  if (!currentUserId) return;

  const payload = {
    lockerId: lockerId,
    status: newStatus,
    userId: newStatus === "OPEN" ? currentUserId : null, // Chỉ gán userId khi mở
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
        userId: data.locker.userId,
      };
      updateGridUI();
      return true;
    } else {
      alert(`❌ Lỗi: ${data.message || "Không thể cập nhật trạng thái tủ."}`);
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

    // Xóa nút Close cũ (nếu có)
    const existingCloseBtn = item.querySelector(".close-btn");
    if (existingCloseBtn) existingCloseBtn.remove();

    // 🚨 Logic Màu và Trạng Thái
    if (state.status === "EMPTY") {
      // Tủ trống: Không màu, sẵn sàng đăng ký
      item.classList.add("status-empty");
      item.style.backgroundColor = "transparent";
    } else if (state.status === "LOCKED") {
      // Tủ đã đóng: Màu đỏ, đã có người đăng ký
      item.classList.add("status-locked");
      item.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
      item.style.border = "2px solid red";
    } else if (state.status === "OPEN") {
      // Tủ đang mở: Màu xanh lá cây (chỉ hiện cho chủ nhân)

      // Nếu là người dùng đang mở tủ này
      if (state.userId === currentUserId) {
        item.classList.add("status-open");
        item.style.backgroundColor = "rgba(0, 255, 0, 0.2)";
        item.style.border = "2px solid green";

        // Thêm nút Đóng tủ
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "CLOSE";
        closeBtn.className = "close-btn";
        closeBtn.onclick = (e) => {
          e.preventDefault();
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
    // Tủ của tôi: Tủ đã mở, không làm gì (nút CLOSE đã có)
    alert(`Tủ ${lockerId} của bạn đang mở.`);
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
function handleLogout() {
  if (currentUserId) {
    Object.keys(lockerStates).forEach((lockerId) => {
      const state = lockerStates[lockerId];
      if (state.status === "OPEN" && state.userId === currentUserId) {
        // Tự động đóng/khóa tủ
        updateLockerStatus(lockerId, "LOCKED");
        console.log(`Tự động đóng tủ ${lockerId} khi đăng xuất.`);
      }
    });

    // Sau khi đóng tủ (chờ 1s)
    setTimeout(() => {
      sessionStorage.removeItem("user");
      alert("Đã đóng tủ của bạn. Đăng xuất thành công.");
      window.location.href = "logon.html";
    }, 1000);
    return true;
  }
  return false;
}

// Gắn sự kiện Logout vào nút logout (nếu có trên trang nào đó)
document.addEventListener("click", (e) => {
  if (e.target.id === "logout-btn") {
    handleLogout();
  }
});

// 6. Xử lý mở tủ thành công (Callback từ pass_lock_login.js / scan.js)
// Hàm này được gọi từ các trang đăng nhập/scan
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
      if (item) {
        e.preventDefault();
        handleLockerClick(item.dataset.lockerId);
      }
    });
  }

  // 7.2. Tải trạng thái tủ khóa
  fetchLockerStates();

  // 7.3. Tự động đóng tủ khi người dùng logout (đã gán sự kiện click ở trên)
  // Cần thêm logic tự đóng tủ khi sử dụng auth_protect.js hoặc menu.js để logout
});
