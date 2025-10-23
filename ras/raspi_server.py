from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import subprocess
import cv2
from picamera2 import Picamera2
from libcamera import controls
import threading
import time
import os
import base64
import numpy as np
import sys
import RPi.GPIO as GPIO # Đã import
import atexit # Đã import

from face_recog_live import recognize_frame
from train_faces import train_dataset

app = Flask(__name__)
CORS(app)

# --- GPIO Setup for Locker ---
RELAY_PIN = 17
ON = GPIO.HIGH # Signal to activate relay (unlock)
OFF = GPIO.LOW  # Signal to deactivate relay (lock)
# Bỏ UNLOCK_DURATION vì không còn dùng pulse

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.setup(RELAY_PIN, GPIO.OUT)
GPIO.output(RELAY_PIN, OFF) # Đảm bảo relay TẮT khi khởi động
print(f"✅ GPIO pin {RELAY_PIN} setup for locker control. Initial state: OFF.")

def cleanup_gpio():
    print("🧹 Cleaning up GPIO...")
    GPIO.cleanup()
atexit.register(cleanup_gpio)
# --- End GPIO Setup ---


# --- Camera Setup (Existing) ---
picam2 = Picamera2()
config = picam2.create_video_configuration(main={"size": (640, 480)})
picam2.configure(config)
picam2.set_controls({ "AwbMode": controls.AwbModeEnum.Auto, "AeEnable": True,"ExposureTime": 20000,"AnalogueGain": 2.0, })
picam2.start()
last_frame = None
lock = threading.Lock()
def update_frame():
    global last_frame
    while True:
        frame = picam2.capture_array()
        with lock: last_frame = frame
        time.sleep(0.05)
thread = threading.Thread(target=update_frame, daemon=True)
thread.start()
# --- End Camera Setup ---

# --- Helper Functions (Existing) ---
def save_frame_and_train(frame_bgr, name, file_suffix=""):
    folder = os.path.join("dataset", name)
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, f"{int(time.time())}_{file_suffix}.jpg")
    cv2.imwrite(file_path, frame_bgr)
    return file_path
# --- End Helper Functions ---


# --- Existing Endpoints (No changes needed here) ---
@app.route("/status")
def status(): return jsonify({"status": "✅ Raspberry Pi camera online"})

@app.route("/video_feed")
def video_feed():
    def generate():
        global last_frame
        while True:
            with lock:
                if last_frame is not None:
                    frame_bgr = cv2.cvtColor(last_frame, cv2.COLOR_RGB2BGR)
                    _, buffer = cv2.imencode(".jpg", frame_bgr)
                    frame = buffer.tobytes()
                    yield (b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")
            time.sleep(0.03)
    return Response(generate(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/capture-batch", methods=["POST"])
def capture_batch():
    try:
        data = request.get_json() or {}
        name = data.get("name", "unknown").replace(" ", "_").lower()
        saved_files = []
        for i in range(5):
            with lock:
                if last_frame is None: return jsonify({"success": False, "error": "Camera chưa sẵn sàng"})
                frame_to_save = last_frame.copy()
            frame_bgr = cv2.cvtColor(frame_to_save, cv2.COLOR_RGB2BGR)
            file_path = save_frame_and_train(frame_bgr, name, f"raspi_{i}")
            saved_files.append(file_path)
            time.sleep(0.5)
        train_dataset()
        return jsonify({"success": True, "saved_files": saved_files, "saved_file": saved_files[0]})
    except Exception as e: return jsonify({"success": False, "error": str(e)})

@app.route("/capture-remote-batch", methods=["POST"])
def capture_remote_batch():
    try:
        data = request.get_json() or {}
        name = data.get("name", "unknown").replace(" ", "_").lower()
        images_data = data.get("images_data", [])
        if len(images_data) != 5: return jsonify({"success": False, "error": f"Không nhận đủ 5 ảnh. Đã nhận {len(images_data)}."})
        saved_files = []
        for i, image_data in enumerate(images_data):
            decoded_data = base64.b64decode(image_data)
            np_arr = np.frombuffer(decoded_data, np.uint8)
            frame_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
            if frame_bgr is None: return jsonify({"success": False, "error": f"Lỗi giải mã ảnh thứ {i}"})
            file_path = save_frame_and_train(frame_bgr, name, f"remote_{i}")
            saved_files.append(file_path)
        train_dataset()
        return jsonify({"success": True, "saved_files": saved_files, "saved_file": saved_files[0]})
    except Exception as e: return jsonify({"success": False, "error": str(e)})

@app.route("/recognize-remote", methods=["POST"])
def recognize_remote():
    try:
        data = request.get_json() or {}
        image_data = data.get("image_data")
        if not image_data: return jsonify({"success": False, "error": "Không có dữ liệu ảnh"})
        decoded_data = base64.b64decode(image_data)
        np_arr = np.frombuffer(decoded_data, np.uint8)
        frame_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame_bgr is None: return jsonify({"success": False, "error": "Không thể giải mã ảnh"})
        detected_name = recognize_frame(frame_bgr)
        return jsonify({"success": detected_name != "Unknown", "name": detected_name})
    except Exception as e: return jsonify({"success": False, "error": str(e)})

@app.route("/recognize", methods=["GET"])
def old_recognize():
    try:
        output = subprocess.check_output(["python3", "face_recog_live.py"], text=True, timeout=15)
        if "Detected:" in output:
            name = output.split("Detected:")[-1].strip()
            return jsonify({"success": True, "name": name})
        return jsonify({"success": False, "error": "Khong nhan dien duoc khuon mat"})
    except Exception as e: return jsonify({"success": False, "error": str(e)})
# --- End Existing Endpoints ---


# --- ✅ SỬA ENDPOINT: /unlock ---
@app.route("/unlock", methods=["POST"])
def unlock_locker():
    """ Bật Relay ON để mở khóa và giữ nguyên trạng thái ON """
    try:
        data = request.get_json() or {}
        locker_id = data.get("lockerId")
        user_email = data.get("user")
        print(f"🔓 Received unlock request for locker: {locker_id} by user: {user_email}. Turning relay ON.")

        # Chỉ bật Relay ON
        GPIO.output(RELAY_PIN, ON)
        print(f"⚡ Relay PIN {RELAY_PIN} is now ON (Unlocked)")

        return jsonify({"success": True, "message": f"Locker {locker_id} unlocked (Relay ON)"})

    except Exception as e:
        print(f"❌ Error during unlock: {str(e)}")
        # Không cần tắt relay vì mục tiêu là giữ ON
        return jsonify({"success": False, "error": str(e)}), 500
# --- End Sửa /unlock ---


# --- ✅ THÊM ENDPOINT MỚI: /lock ---
@app.route("/lock", methods=["POST"])
def lock_locker():
    """ Tắt Relay OFF để khóa tủ """
    try:
        data = request.get_json() or {}
        locker_id = data.get("lockerId") # Lấy lockerId từ request (gửi từ open.js)
        user_email = data.get("user") # Có thể dùng để log nếu cần

        print(f"🔒 Received lock request for locker: {locker_id} by user: {user_email}. Turning relay OFF.")

        # Tắt Relay OFF
        GPIO.output(RELAY_PIN, OFF)
        print(f"⚡ Relay PIN {RELAY_PIN} is now OFF (Locked)")

        return jsonify({"success": True, "message": f"Locker {locker_id} locked (Relay OFF)"})

    except Exception as e:
        print(f"❌ Error during lock: {str(e)}")
        # Đảm bảo relay vẫn OFF nếu có lỗi
        GPIO.output(RELAY_PIN, OFF)
        return jsonify({"success": False, "error": str(e)}), 500
# --- End Thêm /lock ---


# --- Flask App Run ---
if __name__ == "__main__":
    print("🚀 Raspberry Pi server with Locker Control (Hold Open) running on port 5000 ...")
    app.run(host="0.0.0.0", port=5000)
# --- End Flask App Run ---