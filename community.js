/* jshint esversion: 11, browser: true, laxbreak: true */
/* globals COMM_NOTICE, DEFAULT_POSTS, HOT_ITEMS, BOARD_CATS, COMM_NEXT_ID_KEY, COMM_DEFAULT_THUMB,
   getUserPosts, saveUserPosts, compressImageFile, postHref, escapeHtml, formatCount, viewCount, likeCount */
const boardList = document.getElementById("comm-board-list");
const hotList = document.getElementById("comm-hot-list");
const writeBtn = document.getElementById("comm-write-btn");
const composePanel = document.getElementById("comm-compose");
const composeClose = document.getElementById("comm-compose-close");
const composeCancel = document.getElementById("comm-compose-cancel");
const writeForm = document.getElementById("comm-write-form");
const tabButtons = document.querySelectorAll(".comm-tab");
const writePhotoInput = document.getElementById("comm-write-photo");
const writePhotoClear = document.getElementById("comm-write-photo-clear");
const writePhotoPreview = document.getElementById("comm-write-photo-preview");
const writePhotoImg = document.getElementById("comm-write-photo-img");

let activeFilter = "all";
let searchField = "title";
let searchQuery = "";
let writeImageDataUrl = "";

const BLANK_IMG = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const boardEmpty = document.getElementById("comm-board-empty");
const boardSearchForm = document.getElementById("comm-board-search");

function setWritePhotoPreview(dataUrl) {
  writeImageDataUrl = dataUrl || "";
  if (writePhotoImg) writePhotoImg.src = writeImageDataUrl || BLANK_IMG;
  writePhotoPreview?.classList.toggle("is-hidden", !writeImageDataUrl);
  writePhotoClear?.classList.toggle("is-hidden", !writeImageDataUrl);
}

function clearWritePhoto() {
  setWritePhotoPreview("");
  if (writePhotoInput) writePhotoInput.value = "";
}

writePhotoInput?.addEventListener("change", async () => {
  const file = writePhotoInput.files && writePhotoInput.files[0];
  if (!file) return;
  try {
    const dataUrl = await compressImageFile(file);
    setWritePhotoPreview(dataUrl);
  } catch (err) {
    clearWritePhoto();
    alert(err.message || "사진을 추가하지 못했어요.");
  }
});

writePhotoClear?.addEventListener("click", () => {
  clearWritePhoto();
});

function getNextId() {
  let next = parseInt(localStorage.getItem(COMM_NEXT_ID_KEY) || "129", 10);
  localStorage.setItem(COMM_NEXT_ID_KEY, String(next + 1));
  return next;
}

function formatToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function matchesFilter(post, filter) {
  if (filter === "all") return true;
  if (filter === "공지사항") return post.category === "notice";
  const meta = BOARD_CATS[post.category];
  if (!meta) return false;
  return meta.tab === filter;
}

function getBoardPosts() {
  const user = getUserPosts();
  return [...user, ...DEFAULT_POSTS].sort((a, b) => b.id - a.id);
}

/* 게시글 목록 번호: 등록이 오래된 글=1, 위로 갈수록 증가 (공지 제외) */
function getPostDisplayNumberMap() {
  const posts = [...getUserPosts(), ...DEFAULT_POSTS].sort((a, b) => a.id - b.id);
  const map = new Map();
  posts.forEach((post, index) => {
    map.set(post.id, index + 1);
  });
  return map;
}

function renderBoardRow(post, displayNo) {
  if (post.category === "notice") {
    return `
      <li class="comm-row comm-row-notice">
        <span class="col-no"><span class="comm-pin" aria-label="공지">📌</span></span>
        <span class="col-title">
          <span class="comm-badge comm-badge-notice">공지</span>
          <a href="${postHref(post)}" class="comm-post-link">${escapeHtml(post.title)}</a>
        </span>
        <span class="col-author">${escapeHtml(post.author)}</span>
        <span class="col-date">${post.date}</span>
        <span class="col-views">${formatCount(viewCount(post))}</span>
        <span class="col-likes">${formatCount(likeCount(post))}</span>
      </li>`;
  }

  const meta = BOARD_CATS[post.category] || BOARD_CATS.free;

  return `
    <li class="comm-row" data-post-id="${post.id}">
      <span class="col-no">${displayNo}</span>
      <span class="col-title">
        <span class="comm-badge ${meta.badge}">${meta.label}</span>
        <a href="${postHref(post)}" class="comm-post-link">${escapeHtml(post.title)}</a>
      </span>
      <span class="col-author">${escapeHtml(post.author)}</span>
      <span class="col-date">${post.date}</span>
      <span class="col-views">${formatCount(viewCount(post))}</span>
      <span class="col-likes">${formatCount(likeCount(post))}</span>
    </li>`;
}

function matchesSearch(post) {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return true;
  const field = searchField === "author" ? "author" : searchField;
  const haystack = String(post[field] || "").toLowerCase();
  return haystack.includes(q);
}

function renderBoard() {
  if (!boardList) return;

  const displayNumbers = getPostDisplayNumberMap();

  const rows = [];
  if (activeFilter === "all" || activeFilter === "공지사항") {
    if (matchesFilter(COMM_NOTICE, activeFilter) && matchesSearch(COMM_NOTICE)) {
      rows.push(renderBoardRow(COMM_NOTICE));
    }
  }

  getBoardPosts().forEach((post) => {
    if (matchesFilter(post, activeFilter) && matchesSearch(post)) {
      rows.push(renderBoardRow(post, displayNumbers.get(post.id)));
    }
  });

  boardList.innerHTML = rows.join("");
  const hasQuery = searchQuery.trim().length > 0;
  if (boardEmpty) {
    boardEmpty.classList.toggle("is-hidden", rows.length > 0 || !hasQuery);
  }
}

function renderHotList() {
  if (!hotList) return;

  hotList.innerHTML = HOT_ITEMS.map(
    (post, i) => `
    <li>
      <span class="comm-hot-rank">${i + 1}</span>
      <a href="${postHref(post)}" class="comm-hot-title comm-post-link">${escapeHtml(post.title)}</a>
      <img src="${post.thumb}" alt="" class="comm-hot-thumb" width="56" height="40">
    </li>
  `
  ).join("");
}

function openCompose() {
  if (!composePanel) return;
  composePanel.classList.remove("is-hidden");
  composePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  writeForm?.querySelector('[name="title"]')?.focus();
}

function closeCompose() {
  composePanel?.classList.add("is-hidden");
  writeForm?.reset();
  clearWritePhoto();
}

writeBtn?.addEventListener("click", () => {
  openCompose();
});

composeClose?.addEventListener("click", closeCompose);
composeCancel?.addEventListener("click", closeCompose);

writeForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(writeForm);
  const title = String(fd.get("title") || "").trim();
  const author = String(fd.get("author") || "").trim() || "익명";
  const category = String(fd.get("category") || "free");
  const body = String(fd.get("body") || "").trim();

  if (!title) return;

  const image = writeImageDataUrl || "";
  const post = {
    id: getNextId(),
    category,
    title,
    author,
    body,
    date: formatToday(),
    views: 0,
    likes: 0,
    thumb: image || COMM_DEFAULT_THUMB,
    image,
  };

  const userPosts = getUserPosts();
  userPosts.unshift(post);

  try {
    saveUserPosts(userPosts);
  } catch {
    alert("저장 공간이 부족합니다. 사진 크기를 줄이거나 사진을 빼고 등록해 주세요.");
    return;
  }

  closeCompose();
  window.location.href = postHref(post);
});

function setActiveTab(label) {
  tabButtons.forEach((btn) => {
    const on = btn.textContent.trim() === label;
    btn.classList.toggle("is-active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const label = btn.textContent.trim();
    activeFilter = label === "전체" ? "all" : label;
    setActiveTab(label);
    renderBoard();
  });
});

boardSearchForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const fieldEl = document.getElementById("comm-board-search-field");
  const queryEl = document.getElementById("comm-board-search-query");
  searchField = fieldEl?.value || "title";
  searchQuery = String(queryEl?.value || "");
  renderBoard();
});

renderBoard();
renderHotList();
