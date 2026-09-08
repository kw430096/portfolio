/* jshint esversion: 11, browser: true, laxbreak: true, loopfunc: true */
/* globals getPlaceById, PLACE_DETAILS, isFavorite, toggleFavorite, addRecent, getPlaceSub */
const page = document.getElementById("detail-page");
const emptyPage = document.getElementById("detail-empty");
const heroImg = document.getElementById("detail-img");
const crumbName = document.getElementById("detail-crumb-name");
const tagEl = document.getElementById("detail-tag");
const nameEl = document.getElementById("detail-name");
const subEl = document.getElementById("detail-sub");
const heroDescEl = document.getElementById("detail-hero-desc");
const mapBtn = document.getElementById("detail-map");
const likeBtn = document.getElementById("detail-like");
const introEl = document.getElementById("detail-intro");
const seasonEl = document.getElementById("detail-season");
const costEl = document.getElementById("detail-cost");
const daysEl = document.getElementById("detail-days");
const flightEl = document.getElementById("detail-flight");
const spotsEl = document.getElementById("detail-spots");
const enjoyEl = document.getElementById("detail-enjoy");
const enjoyLabel = document.getElementById("detail-enjoy-label");
const tipsEl = document.getElementById("detail-tips");
const slidePrev = document.getElementById("slide-prev");
const slideNext = document.getElementById("slide-next");
const slideDots = document.getElementById("slide-dots");

const placeId = new URLSearchParams(window.location.search).get("place");
const place = getPlaceById(placeId);
const info = place ? PLACE_DETAILS[place.id] : null;

function setImg(imgEl, src, alt, fallback) {
  if (!imgEl) return;
  imgEl.src = src;
  imgEl.alt = alt;
  imgEl.onerror = () => {
    if (fallback && imgEl.src !== fallback) {
      imgEl.src = fallback;
    }
  };
}

function updateLikeBtn() {
  if (!likeBtn || !place) return;
  const liked = isFavorite(place.id);
  likeBtn.classList.toggle("is-active", liked);
  likeBtn.innerHTML = liked
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5 4.5 12.8C2.8 11 2.8 8 4.5 6.2 6.2 4.4 9 4.4 10.7 6.2L12 7.6l1.3-1.4c1.7-1.8 4.5-1.8 6.2 0 1.7 1.8 1.7 4.8 0 6.6L12 20.5Z"/></svg>찜 완료`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20.5 4.5 12.8C2.8 11 2.8 8 4.5 6.2 6.2 4.4 9 4.4 10.7 6.2L12 7.6l1.3-1.4c1.7-1.8 4.5-1.8 6.2 0 1.7 1.8 1.7 4.8 0 6.6L12 20.5Z" stroke="currentColor" stroke-width="2"/></svg>찜하기`;
}

let slideIndex = 0;
let slideCount = 0;

function slideStep() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 900) return 2;
  return 3;
}

function slidePages() {
  const step = slideStep();
  return Math.max(1, Math.ceil(slideCount / step));
}

function renderSlideDots() {
  if (!slideDots) return;
  const pages = slidePages();
  slideDots.innerHTML = "";

  for (let i = 0; i < pages; i += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slide-dot";
    dot.setAttribute("aria-label", `${i + 1}번째`);
    if (i === slideIndex) dot.classList.add("is-active");
    dot.addEventListener("click", () => {
      slideIndex = i;
      updateSlide();
    });
    slideDots.appendChild(dot);
  }
}

function updateSlide() {
  if (!spotsEl) return;
  const step = slideStep();
  const maxIndex = slidePages() - 1;
  slideIndex = Math.max(0, Math.min(slideIndex, maxIndex));
  const card = spotsEl.querySelector(".slide-card");
  const gap = card ? parseFloat(getComputedStyle(spotsEl).gap) || 20 : 20;
  const cardWidth = card ? card.offsetWidth + gap : 0;
  spotsEl.style.transform = `translateX(-${slideIndex * step * cardWidth}px)`;
  renderSlideDots();

  if (slidePrev) slidePrev.disabled = slideIndex === 0;
  if (slideNext) slideNext.disabled = slideIndex >= maxIndex;
}

function renderSpots(spots, fallbackImg) {
  if (!spotsEl) return;
  spotsEl.innerHTML = "";
  slideCount = spots.length;

  spots.forEach((spot) => {
    const li = document.createElement("li");
    li.className = "slide-card";
    li.innerHTML = `
      <div class="slide-card-img">
        ${spot.best ? '<span class="slide-badge">BEST</span>' : ""}
        <img src="${spot.img}" alt="${spot.name}">
      </div>
      <p class="slide-card-name">${spot.name}</p>
      <p class="slide-card-desc">${spot.desc}</p>
    `;
    const img = li.querySelector("img");
    setImg(img, spot.img, spot.name, fallbackImg);
    spotsEl.appendChild(li);
  });

  slideIndex = 0;
  requestAnimationFrame(updateSlide);
}

function renderEnjoy(items, fallbackImg) {
  if (!enjoyEl) return;
  enjoyEl.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = "enjoy-card";
    li.innerHTML = `
      <div class="enjoy-card-img">
        <img src="${item.img}" alt="${item.name}">
      </div>
      <p class="enjoy-card-name">${item.name}</p>
      <p class="enjoy-card-desc">${item.desc}</p>
    `;
    const img = li.querySelector("img");
    setImg(img, item.img, item.name, fallbackImg);
    enjoyEl.appendChild(li);
  });
}

function renderTips(tips) {
  if (!tipsEl) return;
  tipsEl.innerHTML = "";

  tips.forEach((tip) => {
    const li = document.createElement("li");
    li.className = "tip-item";
    li.innerHTML = `
      <span class="tip-check" aria-hidden="true">✓</span>
      <div>
        <p class="tip-title">${tip.title}</p>
        <p class="tip-text">${tip.text}</p>
      </div>
    `;
    tipsEl.appendChild(li);
  });
}

if (!place || !info) {
  if (page) page.classList.add("is-hidden");
  if (emptyPage) emptyPage.classList.remove("is-hidden");
} else {
  addRecent(place.id);
  document.title = `${place.name} — TRIPICK`;

  setImg(heroImg, place.img, place.nameKo, place.img);

  if (crumbName) crumbName.textContent = place.nameKo;
  if (tagEl) tagEl.textContent = info.tag;
  if (nameEl) nameEl.textContent = place.name;
  if (subEl) subEl.textContent = getPlaceSub(place);
  if (heroDescEl) heroDescEl.textContent = info.heroDesc;
  if (introEl) introEl.textContent = info.intro;
  if (seasonEl) seasonEl.textContent = info.season;
  if (costEl) costEl.textContent = info.cost;
  if (daysEl) daysEl.textContent = info.days;
  if (flightEl) flightEl.textContent = info.flight;
  if (enjoyLabel) enjoyLabel.textContent = `${place.nameKo}에서 즐기기`;

  if (mapBtn) {
    mapBtn.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.nameKo)}`;
  }

  updateLikeBtn();

  if (likeBtn) {
    likeBtn.addEventListener("click", () => {
      toggleFavorite(place.id);
      updateLikeBtn();
    });
  }

  renderSpots(info.spots, place.img);
  renderEnjoy(info.enjoy, place.img);
  renderTips(info.tips);

  if (slidePrev) {
    slidePrev.addEventListener("click", () => {
      slideIndex -= 1;
      updateSlide();
    });
  }

  if (slideNext) {
    slideNext.addEventListener("click", () => {
      slideIndex += 1;
      updateSlide();
    });
  }

  window.addEventListener("resize", () => {
    updateSlide();
  });
}
