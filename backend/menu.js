document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const formContainer = document.getElementById("form-container");

  if (user) {
    formContainer.innerHTML = `
      <h1 class="headline">Welcome to SMART BOX</h1>
      <p class="subheadline">${user.username || user.email}</p>
      <div class="button-group">
        <button class="logout-btn">Log Out</button>
      </div>
    `;

    // Xử lý logout
    formContainer.querySelector(".logout-btn").addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "logon.html";
    });
  }
});
