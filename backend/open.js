const RENDER_BRIDGE = "https://smart-locker-kgnx.onrender.com";
const LOCKER_COUNT = 9;

const userRaw = sessionStorage.getItem("user");
const currentUser = userRaw ? JSON.parse(userRaw) : null;
const currentUserId = currentUser ? currentUser.id : null;

let lockerStates = {};

// ✅ HÀM NÀY GIỮ NGUYÊN
async function updateUserField(field, value) {
  if (!currentUserId) return false;
  try {
    const res = await fetch(`${RENDER_BRIDGE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: currentUserId, [field]: value }),
    });
    const data = await res.json();
    if (res.ok && data.user) {
      sessionStorage.setItem("user", JSON.stringify(data.user));
      Object.assign(currentUser, data.user);
      return true;
    } else {
      alert(`❌ Lỗi cập nhật user: ${data.error || "Unknown error"}`);
      return false;
    }
  } catch (err) {
    alert(`❌ Lỗi mạng khi cập nhật user: ${err.message}`);
    return false;
  }
}

// ✅ SỬA: GỌI THÊM updateSliderUI
async function fetchLockerStates() {
  try {
    const res = await fetch(`${RENDER_BRIDGE}/lockers/status`);
    if (!res.ok) throw new Error("Failed to fetch locker status");
    const data = await res.json();
    if (!data.lockers || !Array.isArray(data.lockers)) {
      throw new Error("Invalid data structure from server");
    }
    lockerStates = data.lockers.reduce((acc, locker) => {
      acc[locker.lockerId] = { status: locker.status, userId: locker.ownerId };
      return acc;
    }, {});

    updateGridUI(); // <-- Cập nhật grid trên open.html (nếu có)
    if (window.updateSliderUI) {
      // <-- GỌI CẬP NHẬT SLIDER
      window.updateSliderUI(lockerStates);
    }
  } catch (err) {
    console.error("Error loading locker states:", err);
    alert("Không thể tải trạng thái tủ khóa: " + err.message);
  }
}

// ✅ SỬA: GỌI THÊM updateSliderUI
async function updateLockerStatus(lockerId, newStatus, newOwnerId) {
  const payload = { lockerId, status: newStatus, ownerId: newOwnerId };
  try {
    const res = await fetch(`${RENDER_BRIDGE}/lockers/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      lockerStates[lockerId] = {
        status: newStatus,
        userId: data.locker.ownerId,
      };
      updateGridUI(); // <-- Cập nhật grid trên open.html (nếu có)
      if (window.updateSliderUI) {
        // <-- GỌI CẬP NHẬT SLIDER
        window.updateSliderUI(lockerStates);
      }
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

// ✅ SỬA: Hàm này chỉ cập nhật grid trên open.html (nếu đang ở trang đó)
function updateGridUI() {
  // Chỉ chạy nếu đang ở trang open.html
  if (window.location.pathname.endsWith("open.html")) {
    const gridItems = document.querySelectorAll(".grid-item");
    if (!gridItems.length) return;

    gridItems.forEach((item) => {
      const lockerId = item.dataset.lockerId;
      const state = lockerStates[lockerId] || { status: "EMPTY", userId: null };
      item.classList.remove("status-empty", "status-locked", "status-open");
      item.style.border = "none";
      item.style.backgroundColor = "transparent";
      item.onmouseenter = null;
      item.onmouseleave = null;
      item
        .querySelectorAll(".close-btn, .unregister-btn")
        .forEach((btn) => btn.remove());

      if (state.status === "EMPTY") {
        item.classList.add("status-empty");
        item.style.border = "";
      } else if (state.status === "LOCKED") {
        item.classList.add("status-locked");
        if (state.userId === currentUserId) {
          item.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
          item.style.border = "2px solid red";
          // Thêm nút hủy cho grid
          const unregisterBtn = document.createElement("button");
          // ... (style và logic nút hủy tương tự slider)
          unregisterBtn.textContent = "HỦY ĐĂNG KÝ";
          unregisterBtn.className = "unregister-btn";
          unregisterBtn.style.position = "absolute";
          unregisterBtn.style.bottom = "10px";
          unregisterBtn.style.left = "50%";
          unregisterBtn.style.transform = "translateX(-50%)";
          unregisterBtn.style.zIndex = "10";
          unregisterBtn.style.padding = "5px 10px";
          unregisterBtn.style.backgroundColor = "#ff6600";
          unregisterBtn.style.color = "white";
          unregisterBtn.style.border = "none";
          unregisterBtn.style.borderRadius = "5px";
          unregisterBtn.style.cursor = "pointer";
          unregisterBtn.style.visibility = "hidden";
          unregisterBtn.style.opacity = "0";
          unregisterBtn.style.transition = "opacity 0.2s ease";
          unregisterBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleUnregister(lockerId);
          };
          item.appendChild(unregisterBtn);
          item.onmouseenter = () => {
            unregisterBtn.style.visibility = "visible";
            unregisterBtn.style.opacity = "1";
          };
          item.onmouseleave = () => {
            unregisterBtn.style.visibility = "hidden";
            unregisterBtn.style.opacity = "0";
          };
        } else {
          item.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
          item.style.border = "2px solid red";
        }
      } else if (state.status === "OPEN") {
        if (state.userId === currentUserId) {
          item.classList.add("status-open");
          item.style.backgroundColor = "rgba(0, 255, 0, 0.2)";
          item.style.border = "2px solid green";
          // Thêm nút đóng cho grid
          const closeBtn = document.createElement("button");
          // ... (style và logic nút đóng tương tự slider)
          closeBtn.textContent = "CLOSE";
          closeBtn.className = "close-btn";
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
          item.onmouseenter = () => {
            closeBtn.style.visibility = "visible";
            closeBtn.style.opacity = "1";
          };
          item.onmouseleave = () => {
            closeBtn.style.visibility = "hidden";
            closeBtn.style.opacity = "0";
          };
        } else {
          item.classList.add("status-locked");
          item.style.backgroundColor = "rgba(255, 165, 0, 0.4)";
          item.style.border = "2px solid orange";
        }
      }
    });
  }
}

// ✅ SỬA: Hàm này giữ nguyên logic, chỉ cần gán vào window
function handleLockerClick(lockerId) {
  if (!currentUserId) {
    alert("Bạn cần đăng nhập để mở tủ.");
    window.location.href = "./logon.html";
    return;
  }
  const state = lockerStates[lockerId] || { status: "EMPTY", userId: null };
  if (state.status === "EMPTY") {
    const userLocker = currentUser.registeredLocker;
    let hasRegisteredLocker = false;
    if (typeof userLocker === "string" && /^\d{2}$/.test(userLocker)) {
      hasRegisteredLocker = true;
    }
    if (hasRegisteredLocker) {
      alert(
        `Bạn đã đăng ký tủ ${userLocker}. Vui lòng hủy đăng ký tủ đó trước khi đăng ký tủ mới.`
      );
      return;
    }
    if (confirm(`Tủ ${lockerId} đang trống. Bạn muốn đăng ký và mở tủ?`)) {
      sessionStorage.setItem("locker_to_open", lockerId);
      window.location.href = "./face_log.html";
    }
  } else if (state.userId === currentUserId) {
    if (state.status === "LOCKED") {
      if (confirm(`Đây là tủ của bạn. Bạn muốn mở khóa tủ ${lockerId}?`)) {
        sessionStorage.setItem("locker_to_open", lockerId);
        window.location.href = "./face_log.html";
      }
    } else {
      alert(`Tủ ${lockerId} của bạn đang mở.`);
    }
  } else {
    alert(
      `Tủ ${lockerId} đang ${
        state.status === "OPEN" ? "được sử dụng" : "đã được đăng ký"
      } bởi người khác.`
    );
  }
}
// ✅ Gán vào window
window.handleLockerClick = handleLockerClick;

// ✅ SỬA: Hàm này giữ nguyên logic, chỉ cần gán vào window
function handleCloseLocker(lockerId) {
  if (confirm(`Bạn có chắc muốn đóng tủ ${lockerId} và khóa nó?`)) {
    updateLockerStatus(lockerId, "LOCKED", currentUserId);
  }
}
// ✅ Gán vào window
window.handleCloseLocker = handleCloseLocker;

// ✅ SỬA: Hàm này giữ nguyên logic, chỉ cần gán vào window
async function handleUnregister(lockerId) {
  if (
    confirm(
      `Bạn có chắc muốn hủy đăng ký tủ ${lockerId}? Hành động này sẽ xóa quyền sở hữu của bạn và tủ sẽ trở nên trống.`
    )
  ) {
    const lockerUpdated = await updateLockerStatus(lockerId, "EMPTY", null);
    if (lockerUpdated) {
      await updateUserField("registeredLocker", null);
      alert(`Đã hủy đăng ký tủ ${lockerId}.`);
    }
  }
}
// ✅ Gán vào window
window.handleUnregister = handleUnregister;

// ✅ HÀM NÀY GIỮ NGUYÊN
window.handleLogoutAndLock = function () {
  if (currentUserId) {
    const openUserLockers = [];
    Object.keys(lockerStates).forEach((lockerId) => {
      const state = lockerStates[lockerId];
      if (state.status === "OPEN" && state.userId === currentUserId) {
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

// ✅ HÀM NÀY GIỮ NGUYÊN
window.openLockerSuccess = (lockerId) => {
  if (!lockerId) {
    alert("Lỗi: Không tìm thấy lockerId để mở.");
    return;
  }
  fetch(`${RENDER_BRIDGE}/raspi/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lockerId: lockerId, user: currentUser?.email }),
  })
    .then((res) => res.json())
    .then((unlockData) => {
      if (!unlockData.success && unlockData.error) {
        alert("⚠️ Không thể gửi lệnh mở khóa đến Pi: " + unlockData.error);
      }
      return updateLockerStatus(lockerId, "OPEN", currentUserId);
    })
    .then(async (lockerUpdated) => {
      if (lockerUpdated) {
        const userLocker = currentUser.registeredLocker;
        if (
          !userLocker ||
          userLocker === "null" ||
          userLocker === "undefined"
        ) {
          await updateUserField("registeredLocker", lockerId);
        }
        alert(`🔓 Tủ ${lockerId} đã mở thành công!`);
        // QUAN TRỌNG: Quay về index.html thay vì open.html
        window.location.href = "./index.html"; // <-- Sửa đích đến
      } else {
        alert(`❌ Không thể cập nhật trạng thái tủ ${lockerId}.`);
      }
    })
    .catch((err) => {
      console.error("Lỗi khi mở khóa:", err);
      alert("❌ Lỗi nghiêm trọng khi gửi lệnh mở khóa: " + err.message);
    });
};

// ✅ SỬA: Chỉ khởi chạy nếu đang ở trang index.html hoặc open.html
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (
    path.endsWith("index.html") ||
    path.endsWith("open.html") ||
    path === "/"
  ) {
    // Gán sự kiện cho grid TRÊN TRANG OPEN.HTML
    if (path.endsWith("open.html")) {
      const gridContainer = document.querySelector(".grid-container");
      if (gridContainer) {
        gridContainer.addEventListener("click", (e) => {
          const item = e.target.closest(".grid-item");
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
    }
    // Luôn tải trạng thái tủ cho cả hai trang
    fetchLockerStates();
  }
});
