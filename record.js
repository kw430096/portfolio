/* jshint esversion: 11, browser: true, laxbreak: true */
/* globals TRIPICK_PLACES, getPlaceById, getPlaceSub, getPlacesByIds, getFavorites, getRecent */
const TRIPS_KEY = "tripick_trips";
const TRIPS_SHOW_MAX = 4;

const DEFAULT_TRIPS = [
  {
    id: "trip-jeju",
    placeId: "jeju",
    title: "제주도 3박 4일",
    start: "2025-07-10",
    end: "2025-07-13",
    tags: ["힐링", "자연", "맛집"],
  },
  {
    id: "trip-tokyo",
    placeId: "tokyo",
    title: "도쿄 맛집 투어",
    start: "2025-05-02",
    end: "2025-05-06",
    tags: ["맛집", "쇼핑", "도시"],
  },
  {
    id: "trip-paris",
    placeId: "paris",
    title: "파리 주말 여행",
    start: "2025-03-20",
    end: "2025-03-23",
    tags: ["문화", "카페", "산책"],
  },
  {
    id: "trip-hawaii",
    placeId: "hawaii",
    title: "하와이 힐링 여행",
    start: "2024-12-24",
    end: "2024-12-30",
    tags: ["바다", "휴식", "사진"],
  },
];

const viewButtons = document.querySelectorAll(".record-btn[data-view]");
const viewTrips = document.getElementById("view-trips");
const viewFavorites = document.getElementById("view-favorites");
const viewRecent = document.getElementById("view-recent");
const tripsGrid = document.getElementById("trips-grid");
const tripsEmpty = document.getElementById("trips-empty");
const tripsMore = document.getElementById("trips-more");
const tripsMoreWrap = document.getElementById("trips-more-wrap");
const favoritesGrid = document.getElementById("favorites-grid");
const recentGrid = document.getElementById("recent-grid");
const favoritesEmpty = document.getElementById("favorites-empty");
const recentEmpty = document.getElementById("recent-empty");
const tripModal = document.getElementById("trip-modal");
const tripForm = document.getElementById("trip-form");
const tripPlace = document.getElementById("trip-place");

let showAllTrips = false;
let currentView = "trips";

function getTrips() {
  try {
    const raw = localStorage.getItem(TRIPS_KEY);
    if (raw === null) {
      saveTrips(DEFAULT_TRIPS);
      return [...DEFAULT_TRIPS];
    }
    return JSON.parse(raw) || [];
  } catch {
    return [...DEFAULT_TRIPS];
  }
}

function saveTrips(trips) {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

function formatDateRange(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";

  const y = s.getFullYear();
  const sm = String(s.getMonth() + 1).padStart(2, "0");
  const sd = String(s.getDate()).padStart(2, "0");
  const em = String(e.getMonth() + 1).padStart(2, "0");
  const ed = String(e.getDate()).padStart(2, "0");

  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${y}.${sm}.${sd} ~ ${ed}`;
  }

  return `${y}.${sm}.${sd} ~ ${em}.${ed}`;
}

function createTripCard(trip) {
  const place = getPlaceById(trip.placeId);
  const card = document.createElement("article");
  card.className = "record-trip-card";
  card.dataset.id = trip.id;

  const img = place ? place.img : "images/jeju.jpg";
  const href = place ? `detail.html?place=${place.id}` : "#";
  const tags = (trip.tags || [])
    .map((tag) => `<span class="record-trip-tag">#${tag}</span>`)
    .join("");

  const hint = place
    ? `<span class="record-trip-hint" aria-hidden="true">${place.nameKo} 여행지 정보 보기 <span class="record-trip-hint-arrow">→</span></span>`
    : "";

  card.innerHTML = `
    <a href="${href}" class="record-trip-link">
      <div class="record-trip-img">
        <img src="${img}" alt="${trip.title}">
        <div class="record-trip-actions">
          <button type="button" class="record-trip-delete" aria-label="여행 기록 삭제" data-delete="${trip.id}">
            🗑️
          </button>
        </div>
        ${hint}
      </div>
      <div class="record-trip-body">
        <p class="record-trip-title">${trip.title}</p>
        <p class="record-trip-date">${formatDateRange(trip.start, trip.end)}</p>
        <div class="record-trip-tags">${tags}</div>
      </div>
    </a>
  `;

  const deleteBtn = card.querySelector("[data-delete]");
  deleteBtn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    deleteTrip(trip.id);
  });

  return card;
}

function createPlaceCard(place) {
  const card = document.createElement("a");
  card.href = `detail.html?place=${place.id}`;
  card.className = "record-place-card";
  card.innerHTML = `
    <div class="record-place-img">
      <img src="${place.img}" alt="${place.nameKo}">
    </div>
    <div class="record-place-body">
      <span class="record-place-name">${place.nameKo}</span>
      <span class="record-place-sub">${getPlaceSub(place)}</span>
    </div>
  `;
  return card;
}

function syncCardGridFillRow(grid, itemCount) {
  if (!grid) return;
  const rowCount = itemCount ? Math.ceil(itemCount / 4) : 0;
  grid.classList.toggle("is-fill-row", rowCount === 1);
}

function deleteTrip(id) {
  const trips = getTrips();
  const trip = trips.find((item) => item.id === id);
  if (!trip) return;

  const confirmed = window.confirm(`「${trip.title}」 여행 기록을 삭제할까요?\n삭제한 기록은 되돌릴 수 없습니다.`);
  if (!confirmed) return;

  const next = trips.filter((item) => item.id !== id);
  saveTrips(next);

  if (!showAllTrips && next.length <= TRIPS_SHOW_MAX) {
    showAllTrips = false;
  } else if (showAllTrips && next.length === 0) {
    showAllTrips = false;
  }

  renderTrips();
  renderStats();
}

function renderTrips() {
  if (!tripsGrid) return;

  const trips = getTrips();
  const visible = showAllTrips ? trips : trips.slice(0, TRIPS_SHOW_MAX);

  tripsGrid.innerHTML = "";
  visible.forEach((trip) => {
    tripsGrid.appendChild(createTripCard(trip));
  });

  syncCardGridFillRow(tripsGrid, visible.length);

  if (tripsEmpty) {
    tripsEmpty.classList.toggle("is-hidden", trips.length > 0);
  }

  if (tripsMoreWrap) {
    const needMore = trips.length > TRIPS_SHOW_MAX;
    tripsMoreWrap.classList.toggle("is-hidden", !needMore);
  }
  if (tripsMore) {
    tripsMore.textContent = showAllTrips
      ? "접기 ↑"
      : "더 많은 여행 기록 보기 →";
  }

  scheduleSyncTripGridHeight();
}

function renderFavorites() {
  if (!favoritesGrid) return;

  const places = getPlacesByIds(getFavorites());
  favoritesGrid.innerHTML = "";
  places.forEach((place) => {
    favoritesGrid.appendChild(createPlaceCard(place));
  });

  if (favoritesEmpty) {
    favoritesEmpty.classList.toggle("is-hidden", places.length > 0);
  }

  syncCardGridFillRow(favoritesGrid, places.length);
  scheduleSyncTripGridHeight();
}

function renderRecent() {
  if (!recentGrid) return;

  const places = getPlacesByIds(getRecent());
  recentGrid.innerHTML = "";
  places.forEach((place) => {
    recentGrid.appendChild(createPlaceCard(place));
  });

  if (recentEmpty) {
    recentEmpty.classList.toggle("is-hidden", places.length > 0);
  }

  syncCardGridFillRow(recentGrid, places.length);
  scheduleSyncTripGridHeight();
}

function renderStats() {
  const trips = getTrips();
  const countries = new Set();
  const cities = new Set();

  trips.forEach((trip) => {
    const place = getPlaceById(trip.placeId);
    if (!place) return;
    countries.add(place.country);
    cities.add(place.nameKo);
  });

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("stat-trips", trips.length);
  setText("stat-countries", countries.size);
  setText("stat-cities", cities.size);
  setText("stat-photos", trips.length * 8);

  scheduleSyncTripGridHeight();
}

let syncTripGridHeightRaf = 0;
let lockedTripGridHeight = 0;

function syncTripGridHeight() {
  const side = document.querySelector(".record-side");
  const layout = document.querySelector(".record-layout");
  if (!side || !layout) return;

  const height = side.offsetHeight;
  if (height > 0) {
    // 사이드와 맞추되, 기본 카드 높이(336px)를 넘지 않게 해 사진 칸이 과하게 늘어나지 않도록 함
    const CARD_HEIGHT_MAX = 336;
    lockedTripGridHeight = Math.min(
      CARD_HEIGHT_MAX,
      Math.max(lockedTripGridHeight, height)
    );
    layout.style.setProperty("--record-trip-card-height", `${lockedTripGridHeight}px`);
  }
}

function scheduleSyncTripGridHeight() {
  cancelAnimationFrame(syncTripGridHeightRaf);
  syncTripGridHeightRaf = requestAnimationFrame(syncTripGridHeight);
}

function showView(viewName) {
  currentView = viewName;

  viewButtons.forEach((btn) => {
    const isTarget = btn.dataset.view === viewName;
    btn.classList.toggle("is-active", isTarget);
    btn.classList.toggle("record-btn-outline", !isTarget);
  });

  if (viewTrips) viewTrips.classList.toggle("is-hidden", viewName !== "trips");
  if (viewFavorites) viewFavorites.classList.toggle("is-hidden", viewName !== "favorites");
  if (viewRecent) viewRecent.classList.toggle("is-hidden", viewName !== "recent");

  if (viewName === "favorites") renderFavorites();
  if (viewName === "recent") renderRecent();
  if (viewName === "trips") scheduleSyncTripGridHeight();

  if (tripsMoreWrap) {
    if (viewName !== "trips") {
      tripsMoreWrap.classList.add("is-hidden");
    } else {
      const needMore = getTrips().length > TRIPS_SHOW_MAX;
      tripsMoreWrap.classList.toggle("is-hidden", !needMore);
    }
  }
}

function fillPlaceOptions() {
  if (!tripPlace || typeof TRIPICK_PLACES === "undefined") return;

  tripPlace.innerHTML = TRIPICK_PLACES.map(
    (place) => `<option value="${place.id}">${place.nameKo} (${place.country})</option>`
  ).join("");
}

function openModal() {
  if (!tripModal) return;
  tripModal.classList.remove("is-hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!tripModal) return;
  tripModal.classList.add("is-hidden");
  document.body.style.overflow = "";
  if (tripForm) tripForm.reset();
}

function handleHash() {
  const hash = window.location.hash.slice(1);

  if (hash === "favorites" || hash === "recent") {
    showView(hash);
    return;
  }

  if (hash === "stats") {
    showView("trips");
    document.getElementById("stats")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  showView("trips");
}

viewButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    const next = currentView === view ? "trips" : view;
    showView(next);
    history.replaceState(null, "", next === "trips" ? "record.html" : `#${next}`);
  });
});

document.getElementById("open-add-trip")?.addEventListener("click", () => {
  showView("trips");
  openModal();
});

document.getElementById("empty-add-trip")?.addEventListener("click", openModal);

tripsMore?.addEventListener("click", () => {
  showAllTrips = !showAllTrips;
  renderTrips();
});

document.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", closeModal);
});

tripForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(tripForm);
  const title = String(data.get("title") || "").trim();
  const placeId = String(data.get("placeId") || "");
  const start = String(data.get("start") || "");
  const end = String(data.get("end") || "");
  const tags = String(data.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 5);

  if (!title || !placeId || !start || !end) return;
  if (new Date(end) < new Date(start)) {
    alert("종료일은 시작일 이후로 선택해 주세요.");
    return;
  }

  const trips = getTrips();
  trips.unshift({
    id: `trip-${Date.now()}`,
    placeId,
    title,
    start,
    end,
    tags: tags.length ? tags : ["여행"],
  });

  saveTrips(trips);
  showAllTrips = false;
  closeModal();
  showView("trips");
  renderTrips();
  renderStats();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

fillPlaceOptions();
renderTrips();
renderFavorites();
renderRecent();
renderStats();
handleHash();
window.addEventListener("hashchange", handleHash);
window.addEventListener("resize", () => {
  lockedTripGridHeight = 0;
  scheduleSyncTripGridHeight();
});
scheduleSyncTripGridHeight();
