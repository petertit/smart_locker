document.addEventListener("DOMContentLoaded", () => {
  const slides = document.querySelectorAll(".slide");
  const prev = document.querySelector(".prev");
  const next = document.querySelector(".next");
  let index = 0;

  function showSlide(i) {
    slides.forEach((s, idx) => {
      s.classList.toggle("active", idx === i);
    });
  }

  prev.addEventListener("click", () => {
    index = (index - 1 + slides.length) % slides.length;
    showSlide(index);
  });

  next.addEventListener("click", () => {
    index = (index + 1) % slides.length;
    showSlide(index);
  });

  // hiển thị slide đầu tiên
  showSlide(index);
});
