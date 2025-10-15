document.addEventListener("DOMContentLoaded", () => {
    const lockerGrid = document.getElementById("lockerGrid");
    if (!lockerGrid) return;
    
    const BASE_URL = "http://localhost:4000"; 
    const LOCKER_STATUS_URL = `${BASE_URL}/api/locker/status`; // ✅ sửa endpoint

    const userRaw = sessionStorage.getItem("user");
    const currentUser = userRaw ? JSON.parse(userRaw) : null;
    const userLocker = currentUser ? currentUser.lockerLocation : null;

    if (!currentUser) {
        lockerGrid.innerHTML = "<h2>Vui lòng đăng nhập để xem trạng thái tủ khóa.</h2>";
        return;
    }

    async function fetchLockerStatus() {
        try {
            const res = await fetch(LOCKER_STATUS_URL);
            const data = await res.json();
            
            if (res.ok && data.allLockers) {
                renderLockers(data.allLockers);
            } else {
                lockerGrid.innerHTML = "<h2>❌ Lỗi tải trạng thái tủ khóa.</h2>";
            }
        } catch (err) {
            console.error("Fetch error:", err);
            lockerGrid.innerHTML = "<h2>❌ Lỗi kết nối server API.</h2>";
        }
    }

    function renderLockers(allLockers) {
        lockerGrid.innerHTML = '';
        allLockers.forEach((locker, index) => {
            const gridItem = document.createElement('a');
            const lockerName = locker.location;
            const displayNum = String(index + 1).padStart(2, '0');
            
            gridItem.classList.add('grid-item');
            const overlay = document.createElement('div');
            overlay.classList.add('status-overlay');
            const spanNum = document.createElement('span');
            spanNum.textContent = displayNum;
            gridItem.appendChild(overlay);
            gridItem.appendChild(spanNum);

            let statusText = '';
            if (lockerName === userLocker) {
                gridItem.classList.add('your-locker');
                gridItem.href = "scan.html";
                statusText = locker.currentStatus === 'OPENED' ? 'ĐANG MỞ' : 'ĐANG KHÓA';
                gridItem.addEventListener('click', () => {
                    sessionStorage.setItem('targetLocker', lockerName);
                });
            } else if (locker.isAssigned) {
                gridItem.classList.add('taken');
                gridItem.href = "#"; 
                statusText = 'ĐÃ GÁN / KHÓA';
                gridItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert(`❌ Locker ${lockerName} đã có người đăng ký. Locker của bạn là: ${userLocker}`);
                });
            } else {
                gridItem.classList.add('unassigned');
                gridItem.href = "#"; 
                statusText = 'TRỐNG / CHƯA ĐKÍ';
                gridItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert(`✅ Locker ${lockerName} đang trống. Bạn có thể đăng ký sử dụng.`);
                });
            }

            overlay.innerHTML = `<h1>${statusText}</h1>`;
            lockerGrid.appendChild(gridItem);
        });
    }

    fetchLockerStatus();
});
