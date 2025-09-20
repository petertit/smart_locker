document
  .getElementById("registerForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    // Basic validation
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;
    const captcha = document.getElementById("captcha").checked;

    if (!name || !email || !phone || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!captcha) {
      alert("Please verify that you are not a robot.");
      return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // If all validations pass
    alert("Thank you for registering! We will be in touch soon.");
  });
