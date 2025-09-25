// menu.js
document.addEventListener("DOMContentLoaded", () => {
  const userRaw = sessionStorage.getItem("user");
  const formContainer = document.querySelector(".form-container");
  if (!formContainer) return;

  if (userRaw) {
    const user = JSON.parse(userRaw);
    formContainer.innerHTML = `
      <h1 class="headline">Welcome to SMART BOX</h1>
      <p class="subheadline">${user.username || user.email}</p>
      <div class="button-group">
        <button id="logout-btn" class="logout-btn">Log Out</button>
      </div>
    `;

    document.getElementById("logout-btn").addEventListener("click", () => {
      sessionStorage.removeItem("user");
      window.location.href = "logon.html";
    });
  }
});
