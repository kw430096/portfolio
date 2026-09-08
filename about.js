/* jshint esversion: 11, browser: true, laxbreak: true */
const track = document.getElementById("review-track");
const prevBtn = document.getElementById("review-prev");
const nextBtn = document.getElementById("review-next");
const cards = track ? track.querySelectorAll(".about-review-card") : [];

let index = 0;

function getPerView() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function maxIndex() {
  return Math.max(0, cards.length - getPerView());
}

function updateReviews() {
  if (!track || !cards.length) return;

  index = Math.max(0, Math.min(index, maxIndex()));
  const card = cards[0];
  const gap = parseFloat(getComputedStyle(track).gap) || 16;
  const step = card.offsetWidth + gap;
  track.style.transform = `translateX(-${index * step}px)`;

  if (prevBtn) prevBtn.disabled = index <= 0;
  if (nextBtn) nextBtn.disabled = index >= maxIndex();
}

prevBtn?.addEventListener("click", () => {
  index -= 1;
  updateReviews();
});

nextBtn?.addEventListener("click", () => {
  index += 1;
  updateReviews();
});

window.addEventListener("resize", updateReviews);
updateReviews();
