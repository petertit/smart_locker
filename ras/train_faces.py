import os
import pickle
from imutils import paths
import face_recognition
import cv2
import sys

ENCODING_FILE = "encodings.pickle"

def load_encodings(encoding_file=ENCODING_FILE):
    """Tải dữ liệu khuôn mặt đã mã hóa"""
    try:
        with open(encoding_file, "rb") as f:
            data = pickle.loads(f.read())
        return data.get("encodings", []), data.get("names", [])
    except FileNotFoundError:
        print(f"[❌] Lỗi: Không tìm thấy file {encoding_file}.")
        return [], []
    except Exception as e:
        print(f"[❌] Lỗi khi tải encodings: {e}")
        return [], []

def train_dataset(dataset_path="dataset", encoding_file=ENCODING_FILE):
    print("[🧠] Bắt đầu train khuôn mặt...")
    imagePaths = list(paths.list_images(dataset_path))
    knownEncodings = []
    knownNames = []

    if not imagePaths:
        print("[⚠️] Không tìm thấy ảnh nào trong dataset. Tạo file encodings rỗng.")
        data = {"encodings": [], "names": []}
        with open(encoding_file, "wb") as f:
            f.write(pickle.dumps(data))
        return

    for (i, imagePath) in enumerate(imagePaths):
        name = imagePath.split(os.path.sep)[-2]
        # print(f"[{i+1}/{len(imagePaths)}] {name}") # Bỏ dòng này để giảm output log
        image = cv2.imread(imagePath)
        rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        boxes = face_recognition.face_locations(rgb, model="hog")
        encodings = face_recognition.face_encodings(rgb, boxes)
        for encoding in encodings:
            knownEncodings.append(encoding)
            knownNames.append(name)

    data = {"encodings": knownEncodings, "names": knownNames}
    with open(encoding_file, "wb") as f:
        f.write(pickle.dumps(data))
    print(f"[✅] Train hoàn tất → {encoding_file} ({len(knownEncodings)} khuôn mặt)")

if __name__ == "__main__":
    train_dataset()
