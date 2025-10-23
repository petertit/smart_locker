const RENDER_BRIDGE = "https://smart-locker-kgnx.onrender.com";
const LOCKER_COUNT = 9;

const userRaw = sessionStorage.getItem("user");
const currentUser = userRaw ? JSON.parse(userRaw) : null;
const currentUserId = currentUser ? currentUser.id : null;

let lockerStates = {};

// ✅ HÀM GỬI LỆNH KHÓA ĐẾN PI (THÔNG QUA BRIDGE)
async function sendLockCommand(lockerId) {
  try {
    console.log(`Sending lock command for locker ${lockerId}`);
    const res = await fetch(`${RENDER_BRIDGE}/raspi/lock`, {
      // <-- Gọi endpoint /raspi/lock trên Bridge
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Gửi kèm lockerId và email (Pi có thể dùng để log)
      body: JSON.stringify({ lockerId: lockerId, user: currentUser?.email }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      console.log(`Lock command for ${lockerId} successful.`);
      return true;
    } else {
      console.error(
        `Lock command failed for ${lockerId}:`,
        data.error || "Unknown error"
      );
      alert(
        `⚠️ Không thể gửi lệnh khóa đến tủ ${lockerId}: ${
          data.error || "Lỗi không xác định"
        }`
      );
      return false;
    }
  } catch (err) {
    console.error(`Network error sending lock command for ${lockerId}:`, err);
    alert(`❌ Lỗi mạng khi gửi lệnh khóa cho tủ ${lockerId}.`);
    return false;
  }
}

// --- Các hàm khác (updateUserField, fetchLockerStates, updateLockerStatus, updateGridUI, handleLockerClick) giữ nguyên ---
async function updateUserField(field, value) {
  /* ... giữ nguyên ... */
}
async function fetchLockerStates() {
  /* ... giữ nguyên ... */
}
async function updateLockerStatus(lockerId, newStatus, newOwnerId) {
  /* ... giữ nguyên ... */
}
function updateGridUI() {
  /* ... giữ nguyên ... */
}
function handleLockerClick(lockerId) {
  /* ... giữ nguyên ... */
}
// --- Hết phần giữ nguyên ---

// ✅ SỬA: Hàm này gọi sendLockCommand và updateLockerStatus
async function handleCloseLocker(lockerId) {
  if (confirm(`Bạn có chắc muốn đóng tủ ${lockerId} và khóa nó?`)) {
    // 1. Gửi lệnh khóa vật lý đến Pi
    const lockSent = await sendLockCommand(lockerId);

    // 2. Chỉ cập nhật DB nếu lệnh gửi thành công (hoặc bạn có thể bỏ qua bước check này nếu muốn DB luôn cập nhật)
    if (lockSent) {
      // Cập nhật trạng thái DB thành LOCKED (vẫn giữ ownerId)
      await updateLockerStatus(lockerId, "LOCKED", currentUserId);
      alert(`Đã khóa tủ ${lockerId}.`);
    } else {
      alert(`Không thể khóa tủ ${lockerId} do lỗi gửi lệnh.`);
    }
  }
}
// Gán vào window (giữ nguyên)
window.handleCloseLocker = handleCloseLocker;

// ✅ HÀM NÀY GIỮ NGUYÊN LOGIC
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
// Gán vào window (giữ nguyên)
window.handleUnregister = handleUnregister;

// ✅ SỬA: Hàm này gọi sendLockCommand cho từng tủ trước khi logout
window.handleLogoutAndLock = function () {
  if (currentUserId) {
    const lockPromises = []; // Mảng chứa các promise gửi lệnh khóa

    // Tìm các tủ đang mở của người dùng
    Object.keys(lockerStates).forEach((lockerId) => {
      const state = lockerStates[lockerId];
      if (state.status === "OPEN" && state.userId === currentUserId) {
        // Thêm promise gửi lệnh khóa vào mảng
        lockPromises.push(sendLockCommand(lockerId));
        // Cập nhật trạng thái DB thành LOCKED song song
        updateLockerStatus(lockerId, "LOCKED", currentUserId);
      }
    });

    if (lockPromises.length > 0) {
      console.log(
        `Attempting to lock ${lockPromises.length} open locker(s) before logout...`
      );
      // Đợi tất cả các lệnh khóa được gửi đi (thành công hoặc thất bại)
      Promise.allSettled(lockPromises).then((results) => {
        // Kiểm tra xem có lỗi nào không (chỉ để thông báo)
        const failedLocks = results.filter(
          (r) =>
            r.status === "rejected" || (r.status === "fulfilled" && !r.value)
        );
        if (failedLocks.length > 0) {
          alert(
            `⚠️ Có lỗi xảy ra khi cố gắng khóa ${failedLocks.length} tủ trước khi đăng xuất. Vui lòng kiểm tra lại.`
          );
        } else {
          alert("Đã khóa các tủ đang mở của bạn.");
        }
        // Luôn thực hiện đăng xuất
        sessionStorage.removeItem("user");
        alert("Đăng xuất thành công.");
        window.location.href = "logon.html";
      });
    } else {
      // Không có tủ nào đang mở, đăng xuất ngay
      sessionStorage.removeItem("user");
      alert("Đăng xuất thành công.");
      window.location.href = "logon.html";
    }
  } else {
    // Trường hợp không có user
    sessionStorage.removeItem("user");
    window.location.href = "logon.html";
  }
};

// ✅ HÀM NÀY GIỮ NGUYÊN (Vẫn gọi /raspi/unlock để BẬT relay)
window.openLockerSuccess = (lockerId) => {
  if (!lockerId) {
    alert("Lỗi: Không tìm thấy lockerId để mở.");
    return;
  }
  // 1. Gửi lệnh BẬT relay đến Pi (thông qua Bridge)
  fetch(`${RENDER_BRIDGE}/raspi/unlock`, {
    /* ... body ... */
  })
    .then((res) => res.json())
    .then((unlockData) => {
      if (!unlockData.success && unlockData.error) {
        alert("⚠️ Không thể gửi lệnh mở khóa đến Pi: " + unlockData.error);
      }
      // 2. Cập nhật DB thành OPEN và gán quyền sở hữu
      return updateLockerStatus(lockerId, "OPEN", currentUserId);
    })
    .then(async (lockerUpdated) => {
      if (lockerUpdated) {
        // 3. Lưu tủ vào tài khoản user (nếu chưa có)
        const userLocker = currentUser.registeredLocker;
        if (
          !userLocker ||
          userLocker === "null" ||
          userLocker === "undefined"
        ) {
          await updateUserField("registeredLocker", lockerId);
        }
        alert(`🔓 Tủ ${lockerId} đã mở thành công! (Relay đang BẬT)`);
        // 4. Chuyển hướng về index.html
        window.location.href = "./index.html";
      } else {
        alert(`❌ Không thể cập nhật trạng thái tủ ${lockerId}.`);
      }
    })
    .catch((err) => {
      /* ... xử lý lỗi ... */
    });
};

// ✅ HÀM NÀY GIỮ NGUYÊN
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (
    path.endsWith("index.html") ||
    path.endsWith("open.html") ||
    path === "/"
  ) {
    if (path.endsWith("open.html")) {
      /* ... gán sự kiện cho grid ... */
    }
    fetchLockerStates();
  }
});
