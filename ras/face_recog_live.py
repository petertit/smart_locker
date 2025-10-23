# face_recog_live.py - Logic nhận diện cốt lõi (Refactor)
import cv2
import face_recognition
import numpy as np
from picamera2 import Picamera2
import time
import sys
# Giả sử load_encodings được đưa vào train_faces.py
from train_faces import load_encodings 

RECOGNITION_TOLERANCE = 0.6 

def recognize_frame(frame_bgr):
    """
    Hàm nhận diện chính: Nhận một khung hình BGR (OpenCV) và trả về tên.
    Dùng cho cả chế độ Laptop (remote) và RasPi (cục bộ).
    """
    knownEncodings, knownNames = load_encodings()
    detected_name = "Unknown"
    
    if not knownEncodings:
        print("Không có dữ liệu encodings để nhận diện.")
        return "Unknown"

    # Chuyển đổi màu từ BGR sang RGB cho face_recognition
    rgb_frame = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    
    boxes = face_recognition.face_locations(rgb_frame, model="hog")
    encodings = face_recognition.face_encodings(rgb_frame, boxes)

    for encoding in encodings:
        matches = face_recognition.compare_faces(
            knownEncodings, encoding, tolerance=RECOGNITION_TOLERANCE
        )
        name = "Unknown"
        
        if True in matches:
            matchedIdxs = [i for (i, b) in enumerate(matches) if b]
            counts = {}
            for i in matchedIdxs:
                n = knownNames[i]
                counts[n] = counts.get(n, 0) + 1
            name = max(counts, key=counts.get)
        
        if name != "Unknown":
            detected_name = name
            break
            
    return detected_name

def recognize_live_from_raspi_cam():
    """
    Hàm cũ: Dùng camera RasPi trực tiếp, được gọi dưới dạng subprocess.
    """
    print("[👁️] Đang bật nhận diện khuôn mặt RasPi (Live)...")
    picam2 = Picamera2()
    picam2.configure(picam2.create_preview_configuration(main={"format": 'XRGB8888', "size": (640, 480)}))
    picam2.start()
    time.sleep(2) 

    start_time = time.time()
    timeout = 10 
    result_name = "Unknown"

    while time.time() - start_time < timeout:
        frame = picam2.capture_array()
        frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR) 
        
        name = recognize_frame(frame_bgr)
        
        if name != "Unknown":
            result_name = name
            print(f"Detected: {result_name}") 
            break
        
        time.sleep(0.1)

    picam2.close()
    print(f"[✅] Kết quả: {result_name}")
    return result_name

if __name__ == "__main__":
    recognize_live_from_raspi_cam()
# Chạy trực tiếp để kiểm tra