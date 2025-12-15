🔐 F-LOCK – Smart Locker System with Face ID & Passcode

      F-LOCK is a Smart Locker System that allows users to register, manage, and unlock lockers remotely via a web interface, combining Face Recognition, Passcode authentication, Raspberry Pi, AI processing, and physical electronic locks.

      The system is designed with a secure multi-layer architecture to support real-world deployment using cloud services and embedded devices.

/----------------------------------------------------------------------------------------------------------------------------------------------------------/
🌍 System Overview

      F-LOCK consists of four main layers:
            Frontend Web Application (GitHub Pages – HTTPS)
            Backend API Server (Render – Node.js – HTTPS)
            Secure Tunnel Bridge (ngrok – HTTPS → HTTP)
            Embedded System (Raspberry Pi – Flask + GPIO + Camera)
            This architecture solves browser security restrictions (HTTPS ↔ HTTP) and allows safe communication with devices inside a local network.

/----------------------------------------------------------------------------------------------------------------------------------------------------------/

🏗️ Architecture Flow
[ User Browser ]
|
| HTTPS
v
[ Frontend Web (GitHub Pages) ]
|
| HTTPS (REST API)
v
[ Backend Server (Render) ]
|
| HTTPS (Server-to-Server)
v
[ ngrok Tunnel ]
|
| HTTP (Local Network)
v
[ Raspberry Pi ]
|
| GPIO
v
[ Electronic Locks (6 Channels) ]

/----------------------------------------------------------------------------------------------------------------------------------------------------------/
🔗 Deployment & Connection Flow
1️⃣ GitHub → Render (Backend Auto Deploy)

      Backend source code is hosted on GitHub
      Render is connected directly to the GitHub repository
      Every git push to the main branch triggers:
            Automatic build
            Automatic deployment
      Technologies:
            GitHub
            Render (Node.js Web Service)

/----------------------------------------------------------------------------------------------------------------------------------------------------------/
2️⃣ Frontend → Backend (HTTPS)

      Frontend is deployed using GitHub Pages
      Frontend never communicates directly with Raspberry Pi
      All requests go through the backend API

      Reason:
            Prevents mixed-content issues
            Centralized security and validation

/----------------------------------------------------------------------------------------------------------------------------------------------------------/

3️⃣ Backend → Raspberry Pi (ngrok Tunnel)

      Raspberry Pi runs a local HTTP Flask server

      ngrok exposes it as a secure public HTTPS endpoint

      Render Backend (HTTPS)
      → https://xxxx.ngrok-free.app
            → Raspberry Pi Flask Server (HTTP :5000)


      Benefits:

            No static IP required
            No router port forwarding
            Easy testing and deployment

/----------------------------------------------------------------------------------------------------------------------------------------------------------/

4️⃣ Raspberry Pi → Hardware

      Raspberry Pi controls 6 independent relay channels
      Each relay controls one electronic locker
      Camera is used for:
      Face registration
      Face recognition
      Image capture & training

/----------------------------------------------------------------------------------------------------------------------------------------------------------/
🌐 Web Application Features
👤 User Features

      User registration
      User login
      Locker registration (Locker 01 – 06)
      Unlock locker via:
            Face ID
            Passcode
            Lock locker
            Unregister locker
            View access history
            Secure logout (auto-lock if locker is open)

/----------------------------------------------------------------------------------------------------------------------------------------------------------/
🔐 Locker Management

Total lockers: 6
Locker states:

      EMPTY – available
      LOCKED – registered and locked
      OPEN – currently open
      Each user can own only one locker at a time

/----------------------------------------------------------------------------------------------------------------------------------------------------------/
🧠 AI & Algorithms

      Face Recognition
      Based on Face Encoding & Matching

Workflow:

      Capture images (Raspberry Pi camera or browser camera)
      Encode facial features
      Store embeddings per user
      Compare embeddings during authentication

Libraries:

      OpenCV
      face_recognition
      NumPy

/----------------------------------------------------------------------------------------------------------------------------------------------------------/

🧑‍💻 Technologies Used
Frontend:

      HTML5
      CSS3
      JavaScript (Vanilla JS)
      GitHub Pages

Backend :

      Node.js
      Express.js
      MongoDB Atlas
      Render Cloud
      RESTful API

Embedded / AI:

      Python
      Flask
      OpenCV
      face_recognition
      RPi.GPIO
      Picamera2

/----------------------------------------------------------------------------------------------------------------------------------------------------------/

🔌 Hardware Components
Component Description :

      Raspberry Pi Central embedded controller
      Camera Module Face recognition input
      6-Channel Relay Controls 6 lockers
      Electronic Locks Physical locking mechanism
      12V Power Supply Power for locks
      GPIO Mapping

Locker ID GPIO Pin :

      01 GPIO 2
      02 GPIO 3
      03 GPIO 4
      04 GPIO 17
      05 GPIO 27
      06 GPIO 22

/----------------------------------------------------------------------------------------------------------------------------------------------------------/

📂 Project Structure
F-LOCK/
├── frontend/ # Web UI (GitHub Pages)
├── server/ # Backend API (Render)
│ ├── account.js
│ ├── package.json
│ └── .env
├── raspi/ # Raspberry Pi (Embedded + AI)
│ ├── raspi_server.py
│ ├── face_recog_live.py
│ ├── train_faces.py
│ └── 6key.py
└── README.md

/----------------------------------------------------------------------------------------------------------------------------------------------------------/
🔒 Security Design

      Frontend cannot directly access Raspberry Pi
      Raspberry Pi only accepts commands from backend
      Easy to extend with:
            API keys
            JWT authentication
            Rate limiting

/----------------------------------------------------------------------------------------------------------------------------------------------------------/
🚀 Future Improvements

      Mobile application
      WebSocket real-time updates
      Admin dashboard
      Video logging during unlock
      Multi-location locker support

/----------------------------------------------------------------------------------------------------------------------------------------------------------/
📧 Contact

Project: F-LOCK – Smart Locker System
Email: trinhquoccuong12.11tpk@gmail.com
