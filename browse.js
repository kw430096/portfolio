/* jshint esversion: 11, browser: true, laxbreak: true */
/* globals TRIPICK_PLACES, getBrowsePlaces, isFavorite, toggleFavorite, getPlaceSub */
const grid = document.getElementById("browse-grid");
const searchInput = document.getElementById("browse-search");
const searchBtn = document.getElementById("browse-search-btn");
const emptyMsg = document.getElementById("browse-empty");
const filterBtns = document.querySelectorAll(".browse-filter-btn");

let currentFilter = "all";
let currentQuery = "";

function createBrowseCard(place) {
  const wrap = document.createElement("article");
  wrap.className = "browse-card-wrap";

  const likeBtn = document.createElement("button");
  likeBtn.type = "button";
  likeBtn.className = "browse-like";
  likeBtn.dataset.id = place.id;
  likeBtn.setAttribute("aria-label", "찜하기");
  likeBtn.textContent = isFavorite(place.id) ? "❤️" : "🤍";

  if (isFavorite(place.id)) {
    likeBtn.classList.add("is-active");
  }

  likeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleFavorite(place.id);
    likeBtn.textContent = added ? "❤️" : "🤍";
    likeBtn.classList.toggle("is-active", added);
  });

  const card = document.createElement("a");
  card.href = `detail.html?place=${place.id}`;
  card.className = "browse-card";
  card.dataset.id = place.id;
  card.innerHTML = `
    <div class="browse-card-img">
      <img src="${place.img}" alt="${place.nameKo}">
    </div>
    <div class="browse-card-body">
      <span class="place-name">${place.name}</span>
      <span class="place-sub">${getPlaceSub(place)}</span>
      <span class="browse-card-tag">#${place.tag || "여행"}</span>
    </div>
  `;

  wrap.appendChild(likeBtn);
  wrap.appendChild(card);
  return wrap;
}

function renderCards() {
  if (!grid) return;

  const query = currentQuery.trim().toLowerCase();
  const places = typeof getBrowsePlaces === "function" ? getBrowsePlaces() : TRIPICK_PLACES;

  const filtered = places.filter((place) => {
    const matchFilter =
      currentFilter === "all" || place.region === currentFilter;

    const matchSearch =
      query === "" ||
      place.name.toLowerCase().includes(query) ||
      place.nameKo.includes(query) ||
      place.country.includes(query) ||
      (place.tag && place.tag.includes(query)) ||
      place.search.some((word) => word.toLowerCase().includes(query));

    return matchFilter && matchSearch;
  });

  grid.innerHTML = "";

  filtered.forEach((place) => {
    grid.appendChild(createBrowseCard(place));
  });

  if (emptyMsg) {
    emptyMsg.classList.toggle("is-hidden", filtered.length > 0);
  }
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((item) => item.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentFilter = btn.dataset.filter;
    renderCards();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", () => {
    currentQuery = searchInput.value;
    renderCards();
  });
}

if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    currentQuery = searchInput.value;
    renderCards();
    searchInput.focus();
  });
}

renderCards();
