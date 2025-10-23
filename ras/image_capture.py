import os
import sys
import time
from datetime import datetime
from picamera2 import Picamera2
from PIL import Image

def create_folder(name):
    folder = os.path.join("dataset", name)
    os.makedirs(folder, exist_ok=True)
    return folder

def capture_image(person_name):
    print(f"[📸] Đang chụp ảnh cho: {person_name}")
    picam2 = Picamera2()
    picam2.start()
    time.sleep(2)  # đợi camera khởi động

    folder = create_folder(person_name)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = os.path.join(folder, f"{person_name}_{timestamp}.jpg")

    frame = picam2.capture_array()
    img = Image.fromarray(frame)
    if img.mode != "RGB":
        img = img.convert("RGB")
    img.save(filepath)

    picam2.close()
    print(f"[✅] Ảnh đã lưu: {filepath}")
    return filepath

if __name__ == "__main__":
    if len(sys.argv) > 1:
        name = sys.argv[1]
    else:
        name = input("Nhập tên: ").strip() or "unknown"
    capture_image(name)
