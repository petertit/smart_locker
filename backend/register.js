// register.js - with simple client-side captcha
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  // --- CAPTCHA LOGIC ---
  const canvas = document.getElementById("captchaCanvas");
  const refreshBtn = document.getElementById("refreshCaptcha");
  const audioBtn = document.getElementById("audioCaptcha");
  const captchaInput = document.getElementById("captchaInput");
  const ctx = canvas.getContext("2d");

  // characters to use (avoid ambiguous ones)
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
    // clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background gradient
    const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    g.addColorStop(0, "#0b0b0b");
    g.addColorStop(1, "#121212");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw noise dots
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

    // draw skewed text
    const charCount = text.length;
    const baseSize = Math.min(48, canvas.width / (charCount + 1));
    for (let i = 0; i < charCount; i++) {
      const ch = text[i];
      const fontSize = baseSize + randomInt(-6, 6);
      ctx.font = `${fontSize}px "Epilogue", sans-serif`;
      ctx.textBaseline = "middle";
      // random color for each char
      ctx.fillStyle = `rgba(${randomInt(180, 255)},${randomInt(
        180,
        255
      )},${randomInt(180, 255)},${0.95})`;
      // position per char
      const x = (canvas.width / (charCount + 1)) * (i + 1);
      const y = canvas.height / 2 + randomInt(-6, 6);
      // save and rotate slightly
      ctx.save();
      const angle = (randomInt(-20, 20) * Math.PI) / 180;
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(ch, -fontSize / 2 + randomInt(-4, 4), 0);
      ctx.restore();
    }

    // draw more line noise
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(${randomInt(60, 120)},${randomInt(
        60,
        120
      )},${randomInt(60, 120)},0.6)`;
      ctx.beginPath();
      ctx.moveTo(randomInt(0, canvas.width / 3), randomInt(0, canvas.height));
      ctx.quadraticCurveTo(
        canvas.width / 2,
        randomInt(0, canvas.height),
        randomInt(canvas.width / 2, canvas.width),
        randomInt(0, canvas.height)
      );
      ctx.stroke();
    }
  }

  function refreshCaptcha() {
    currentCaptcha = generateCaptcha(5);
    drawCaptcha(currentCaptcha);
    // clear input
    captchaInput.value = "";
  }

  // audio: read the code aloud (basic)
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

  // generate first one
  refreshCaptcha();

  // --- FORM SUBMIT ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate captcha (case-insensitive)
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

    // get fields
    const name = document.querySelector('input[name="name"]').value.trim();
    const email = document.querySelector('input[name="email"]').value.trim();
    const password = document.querySelector('input[name="password"]').value;

    try {
      const res = await fetch(
        "https://smart-locker-kgnx.onrender.com/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: name, email, password }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert("✅ Đăng ký thành công!");
        window.location.href = "logon.html"; // chuyển sang login
      } else {
        alert("❌ " + (data.error || "Register failed"));
        // refresh captcha after failure to avoid brute force
        refreshCaptcha();
      }
    } catch (err) {
      alert("❌ Fetch error: " + err.message);
      refreshCaptcha();
    }
  });

  // (Optional) keep old input-focus effect if you had inputs with .input class
  document.querySelectorAll("input").forEach((inputEl) => {
    inputEl.addEventListener("focus", () => {
      inputEl.parentNode.classList.add("active");
    });
    inputEl.addEventListener("blur", () => {
      if (!inputEl.value) {
        inputEl.parentNode.classList.remove("active");
      }
    });
  });
});
