const RENDER_BRIDGE = "https://smart-locker-kgnx.onrender.com";
const LOCKER_COUNT = 9; // Tổng số tủ khóa (01 đến 09)

// Lấy thông tin người dùng đang đăng nhập
const userRaw = sessionStorage.getItem("user");
const currentUser = userRaw ? JSON.parse(userRaw) : null;
const currentUserId = currentUser ? currentUser.id : null;

// Biến lưu trữ trạng thái tủ khóa toàn cục (lockerId -> {status, userId})
let lockerStates = {};

/**
 * Helper: Kiểm tra xem người dùng hiện tại đã đăng ký tủ nào chưa
 * @returns {object | null} Trạng thái của tủ đã đăng ký, hoặc null
 */
function getUserLocker() {
  for (const lockerId in lockerStates) {
    if (lockerStates[lockerId].userId === currentUserId) {
      return { ...lockerStates[lockerId], lockerId: lockerId };
    }
  }
  return null;
}

// 1. Quản lý trạng thái tủ khóa trên MongoDB Atlas
async function fetchLockerStates() {
  try {
    const res = await fetch(`${RENDER_BRIDGE}/lockers/status`);
    if (!res.ok) throw new Error("Failed to fetch locker status");

    const data = await res.json();

    if (!data.lockers || !Array.isArray(data.lockers)) {
      throw new Error("Invalid data structure from server");
    }

    lockerStates = data.lockers.reduce((acc, locker) => {
      acc[locker.lockerId] = {
        status: locker.status,
        userId: locker.ownerId, // Server trả về 'ownerId'
      };
      return acc;
    }, {});

    updateGridUI();
  } catch (err) {
    console.error("Error loading locker states:", err);
    alert("Không thể tải trạng thái tủ khóa: " + err.message);
  }
}

/**
 * Cập nhật trạng thái tủ khóa trên server
 * @param {string} lockerId ID của tủ (ví dụ: "01")
 * @param {'OPEN' | 'LOCKED' | 'EMPTY'} newStatus Trạng thái mới
 * @param {string | null} newOwnerId ID của người sở hữu mới (hoặc null)
 */
async function updateLockerStatus(lockerId, newStatus, newOwnerId) {
  const payload = {
    lockerId: lockerId,
    status: newStatus,
    ownerId: newOwnerId, // Gửi ownerId (chủ sở hữu) rõ ràng
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
        userId: data.locker.ownerId,
      };
      updateGridUI(); // Cập nhật lại giao diện ngay lập tức
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

    // Reset styles và listeners
    item.classList.remove("status-empty", "status-locked", "status-open");
    item.style.border = "none";
    item.style.backgroundColor = "transparent";
    item.onmouseenter = null;
    item.onmouseleave = null;

    // Xóa các nút cũ
    item
      .querySelectorAll(".close-btn, .unregister-btn")
      .forEach((btn) => btn.remove());

    // 🚨 Logic Màu và Trạng Thái
    if (state.status === "EMPTY") {
      // Tủ trống: Viền xanh (mặc định từ CSS)
      item.classList.add("status-empty");
      item.style.border = "";
    } else if (state.status === "LOCKED") {
      // Tủ đã đóng/khóa
      item.classList.add("status-locked");

      if (state.userId === currentUserId) {
        // Tủ của TÔI, đang khóa -> Viền đỏ
        item.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
        item.style.border = "2px solid red";

        // ✅ THÊM NÚT HỦY ĐĂNG KÝ
        const unregisterBtn = document.createElement("button");
        unregisterBtn.textContent = "HỦY ĐĂNG KÝ";
        unregisterBtn.className = "unregister-btn";
        // (Thêm style)
        unregisterBtn.style.position = "absolute";
        unregisterBtn.style.bottom = "10px";
        unregisterBtn.style.left = "50%";
        unregisterBtn.style.transform = "translateX(-50%)";
        unregisterBtn.style.zIndex = "10";
        unregisterBtn.style.padding = "5px 10px";
        unregisterBtn.style.backgroundColor = "#ff6600"; // Màu cam
        unregisterBtn.style.color = "white";
        unregisterBtn.style.border = "none";
        unregisterBtn.style.borderRadius = "5px";
        unregisterBtn.style.cursor = "pointer";
        unregisterBtn.style.visibility = "hidden"; // Ẩn nút
        unregisterBtn.style.opacity = "0";
        unregisterBtn.style.transition = "opacity 0.2s ease";

        unregisterBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleUnregister(lockerId);
        };
        item.appendChild(unregisterBtn);

        // Hiện nút khi di chuột
        item.onmouseenter = () => {
          unregisterBtn.style.visibility = "visible";
          unregisterBtn.style.opacity = "1";
        };
        item.onmouseleave = () => {
          unregisterBtn.style.visibility = "hidden";
          unregisterBtn.style.opacity = "0";
        };
      } else {
        // Tủ của NGƯỜI KHÁC, đang khóa -> Viền đỏ (nhưng mờ hơn)
        item.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
        item.style.border = "2px solid red";
      }
    } else if (state.status === "OPEN") {
      // Tủ đang mở
      if (state.userId === currentUserId) {
        // Tủ của TÔI, đang mở -> Viền xanh lá
        item.classList.add("status-open");
        item.style.backgroundColor = "rgba(0, 255, 0, 0.2)";
        item.style.border = "2px solid green";

        // Thêm nút "Close"
        const closeBtn = document.createElement("button");
        closeBtn.textContent = "CLOSE";
        closeBtn.className = "close-btn";
        // (Style)
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
        closeBtn.style.cursor = "pointer";
        closeBtn.style.visibility = "hidden";
        closeBtn.style.opacity = "0";
        closeBtn.style.transition = "opacity 0.2s ease";

        closeBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleCloseLocker(lockerId);
        };
        item.appendChild(closeBtn);

        // Hiện nút khi di chuột
        item.onmouseenter = () => {
          closeBtn.style.visibility = "visible";
          closeBtn.style.opacity = "1";
        };
        item.onmouseleave = () => {
          closeBtn.style.visibility = "hidden";
          closeBtn.style.opacity = "0";
        };
      } else {
        // Tủ của NGƯỜI KHÁC, đang mở -> Viền cam
        item.classList.add("status-locked");
        item.style.backgroundColor = "rgba(255, 165, 0, 0.4)";
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

    // ✅ KIỂM TRA 1 TỦ/TÀI KHOẢN
    const existingLocker = getUserLocker();
    if (existingLocker) {
      alert(
        `Bạn đã đăng ký tủ ${existingLocker.lockerId}. Vui lòng hủy đăng ký tủ đó trước khi đăng ký tủ mới.`
      );
      return;
    }

    if (confirm(`Tủ ${lockerId} đang trống. Bạn muốn đăng ký và mở tủ?`)) {
      sessionStorage.setItem("locker_to_open", lockerId);
      window.location.href = "./face_log.html";
    }
  } else if (state.userId === currentUserId) {
    // Tủ của tôi:
    if (state.status === "LOCKED") {
      // ✅ SỬA LỖI: Đây là logic mở lại tủ
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
    // ✅ SỬA LỖI: Giữ lại currentUserId khi đóng
    updateLockerStatus(lockerId, "LOCKED", currentUserId);
  }
}

// 5. ✅ Xử lý hủy đăng ký
function handleUnregister(lockerId) {
  if (
    confirm(
      `Bạn có chắc muốn hủy đăng ký tủ ${lockerId}? Hành động này sẽ xóa quyền sở hữu của bạn và tủ sẽ trở nên trống.`
    )
  ) {
    updateLockerStatus(lockerId, "EMPTY", null);
  }
}

// 6. Xử lý đăng xuất (Tự động đóng tủ đang mở)
window.handleLogoutAndLock = function () {
  if (currentUserId) {
    const openUserLockers = [];
    Object.keys(lockerStates).forEach((lockerId) => {
      const state = lockerStates[lockerId];
      if (state.status === "OPEN" && state.userId === currentUserId) {
        // Tự động đóng/khóa tủ (Vẫn giữ quyền sở hữu)
        openUserLockers.push(
          updateLockerStatus(lockerId, "LOCKED", currentUserId)
        );
      }
    });

    if (openUserLockers.length > 0) {
      Promise.all(openUserLockers).then(() => {
        sessionStorage.removeItem("user");
        alert("Đã đóng tủ của bạn. Đăng xuất thành công.");
        window.location.href = "logon.html";
      });
    } else {
      sessionStorage.removeItem("user");
      alert("Đăng xuất thành công.");
      window.location.href = "logon.html";
    }
  } else {
    sessionStorage.removeItem("user");
    window.location.href = "logon.html";
  }
};

// 7. Xử lý mở tủ thành công (Callback)
window.openLockerSuccess = (lockerId) => {
  if (!lockerId) {
    alert("Lỗi: Không tìm thấy lockerId để mở.");
    return;
  }

  // 1. Gửi lệnh MỞ KHÓA VẬT LÝ đến RasPi
  fetch(`${RENDER_BRIDGE}/raspi/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lockerId: lockerId, user: currentUser?.email }),
  })
    .then((res) => res.json())
    .then((unlockData) => {
      if (!unlockData.success && unlockData.error) {
        // Vẫn tiếp tục ngay cả khi Pi lỗi, nhưng báo cho người dùng
        alert("⚠️ Không thể gửi lệnh mở khóa đến Pi: " + unlockData.error);
      }

      // 2. Cập nhật trạng thái DB thành 'OPEN' và GÁN QUYỀN SỞ HỮU
      return updateLockerStatus(lockerId, "OPEN", currentUserId);
    })
    .then((success) => {
      if (success) {
        alert(`🔓 Tủ ${lockerId} đã mở thành công!`);
        // 3. Chuyển hướng về trang Open.html
        window.location.href = "./open.html";
      } else {
        alert(`❌ Không thể cập nhật trạng thái tủ ${lockerId}.`);
      }
    })
    .catch((err) => {
      console.error("Lỗi khi mở khóa:", err);
      alert("❌ Lỗi nghiêm trọng khi gửi lệnh mở khóa: " + err.message);
    });
};

// 8. Khởi chạy
document.addEventListener("DOMContentLoaded", () => {
  // 8.1. Gán sự kiện click cho các tủ
  const gridContainer = document.querySelector(".grid-container");
  if (gridContainer) {
    gridContainer.addEventListener("click", (e) => {
      const item = e.target.closest(".grid-item");
      // Ngăn click vào tủ nếu đang bấm nút (Close/Unregister)
      if (
        item &&
        !e.target.classList.contains("close-btn") &&
        !e.target.classList.contains("unregister-btn")
      ) {
        e.preventDefault();
        handleLockerClick(item.dataset.lockerId);
      }
    });
  }

  // 8.2. Tải trạng thái tủ khóa
  fetchLockerStates();
});
