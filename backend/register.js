// register.js - with full form fields and captcha
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  // --- CAPTCHA LOGIC ---
  const canvas = document.getElementById("captchaCanvas");
  const refreshBtn = document.getElementById("refreshCaptcha");
  const audioBtn = document.getElementById("audioCaptcha");
  const captchaInput = document.getElementById("captchaInput");
  const ctx = canvas.getContext("2d");

  const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let currentCaptcha = "";

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateCaptcha(length = 5) {
    let s = "";
    for (let i = 0; i < length; i++) {
      s += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    return s;
  }

  function drawCaptcha(text) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, "#0b0b0b");
    g.addColorStop(1, "#121212");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${randomInt(50, 120)},${randomInt(
        50,
        120
      )},${randomInt(50, 120)},${Math.random() * 0.6})`;
      ctx.beginPath();
      ctx.arc(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 2 + 0.8,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    const charCount = text.length;
    const baseSize = Math.min(48, canvas.width / (charCount + 1));
    for (let i = 0; i < charCount; i++) {
      const ch = text[i];
      const fontSize = baseSize + randomInt(-6, 6);
      ctx.font = `${fontSize}px "Epilogue", sans-serif`;
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(${randomInt(180, 255)},${randomInt(
        180,
        255
      )},${randomInt(180, 255)},${0.95})`;
      const x = (canvas.width / (charCount + 1)) * (i + 1);
      const y = canvas.height / 2 + randomInt(-6, 6);
      ctx.save();
      const angle = (randomInt(-20, 20) * Math.PI) / 180;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(ch, -fontSize / 2 + randomInt(-4, 4), 0);
      ctx.restore();
    }
  }

  function refreshCaptcha() {
    currentCaptcha = generateCaptcha(5);
    drawCaptcha(currentCaptcha);
    captchaInput.value = "";
  }

  function speakCaptcha() {
    if (!("speechSynthesis" in window)) {
      alert("Your browser does not support speech synthesis.");
      return;
    }
    const utter = new SpeechSynthesisUtterance(
      currentCaptcha.split("").join(" ")
    );
    utter.rate = 0.9;
    utter.pitch = 1.0;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }

  refreshBtn.addEventListener("click", refreshCaptcha);
  audioBtn.addEventListener("click", speakCaptcha);
  refreshCaptcha();

  // --- FORM SUBMIT ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userCaptcha = (captchaInput.value || "").trim().toUpperCase();
    if (!userCaptcha) {
      alert("Please enter the captcha code.");
      return;
    }
    if (userCaptcha !== currentCaptcha.toUpperCase()) {
      alert("Captcha is incorrect. Please try again.");
      refreshCaptcha();
      return;
    }

    // Lấy dữ liệu form
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
    const hint = document.getElementById("hint").value.trim();

    try {
      const res = await fetch(
        "https://smart-locker-kgnx.onrender.com/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, password, hint }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Registration successful!");
        window.location.href = "logon.html";
      } else {
        alert("❌ " + (data.error || "Register failed"));
        refreshCaptcha();
      }
    } catch (err) {
      alert("❌ Fetch error: " + err.message);
      refreshCaptcha();
    }
  });
});
