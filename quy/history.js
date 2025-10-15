// lichsu.js - Tải và hiển thị lịch sử Locker
document.addEventListener("DOMContentLoaded", () => {
    const historyList = document.getElementById("historyList");
    const historyLockerName = document.getElementById("historyLockerName");
    
    if (!historyList) return;

    const BASE_URL = "http://localhost:4000"; 

    // Lấy lockerLocation từ URL (được truyền từ scan.html)
    const urlParams = new URLSearchParams(window.location.search);
    const lockerLocation = urlParams.get('locker');

    if (!lockerLocation) {
        historyList.innerHTML = `<li style="text-align: center; color: red;">Không tìm thấy vị trí tủ khóa.</li>`;
        historyLockerName.textContent = 'History Error';
        return;
    }
    
    historyLockerName.textContent = lockerLocation + ' History';

    async function fetchLockerHistory() {
        const HISTORY_URL = `${BASE_URL}/api/locker/history/${lockerLocation}`;
        
        try {
            const res = await fetch(HISTORY_URL);
            const data = await res.json();
            
            if (res.ok && data.history) {
                renderHistory(data.history);
            } else {
                historyList.innerHTML = `<li style="text-align: center; color: red;">❌ Lỗi tải lịch sử tủ khóa.</li>`;
            }
        } catch (err) {
            console.error("Fetch error:", err);
            historyList.innerHTML = `<li style="text-align: center; color: red;">❌ Lỗi kết nối server API.</li>`;
        }
    }

    function renderHistory(history) {
        historyList.innerHTML = '';
        if (history.length === 0) {
            historyList.innerHTML = `<li style="text-align: center; color: #aaa;">Chưa có sự kiện nào được ghi nhận.</li>`;
            return;
        }

        history.forEach(item => {
            const li = document.createElement('li');
            const date = new Date(item.timestamp);
            const formattedDate = date.toLocaleDateString('vi-VN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            
            let actionText = '';
            let color = '';

            switch (item.action) {
                case 'OPENED':
                    actionText = 'ĐÃ MỞ KHÓA';
                    color = '#00aa00'; // Xanh lá
                    break;
                case 'CLOSED':
                    actionText = 'ĐÃ ĐÓNG KHÓA';
                    color = '#cc0000'; // Đỏ
                    break;
                case 'REGISTERED':
                    actionText = 'ĐĂNG KÝ TÀI KHOẢN';
                    color = '#1a73e8'; // Xanh dương
                    break;
                default:
                    actionText = item.action;
                    color = '#aaa';
            }

            li.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 15px;
                margin-bottom: 8px;
                background-color: #1a1a1a;
                border-radius: 8px;
                border-left: 5px solid ${color};
                font-size: 15px;
            `;

            li.innerHTML = `
                <span style="color: ${color}; font-weight: 600;">${actionText}</span>
                <span style="color: #aaa;">${formattedDate}</span>
            `;

            historyList.appendChild(li);
        });
    }

    fetchLockerHistory();
});