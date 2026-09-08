/* jshint esversion: 11, browser: true, laxbreak: true */
/* globals BOARD_CATS, COMM_DEFAULT_THUMB, findPost, getPostImage, getPostBody, postKey,
   getComments, addComment, deleteComment, isUserPost, deleteUserPost, updateUserPost,
   compressImageFile, escapeHtml, formatCount, viewCount, likeCount, isPostLiked, toggleLike,
   isScrapped, toggleScrap, addView */
const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

const article = document.getElementById("comm-post-article");
const missing = document.getElementById("comm-post-missing");
const badgeEl = document.getElementById("comm-post-badge");
const titleEl = document.getElementById("comm-post-title");
const metaEl = document.getElementById("comm-post-meta");
const bodyEl = document.getElementById("comm-post-body");
const postView = document.getElementById("comm-post-view");
const ownerBar = document.getElementById("comm-post-owner");
const deleteBtn = document.getElementById("comm-post-delete");
const editBtn = document.getElementById("comm-post-edit-btn");
const editForm = document.getElementById("comm-post-edit-form");
const editCancelBtn = document.getElementById("comm-post-edit-cancel");
const commentList = document.getElementById("comm-comment-list");
const commentCount = document.getElementById("comm-comment-count");
const commentEmpty = document.getElementById("comm-comment-empty");
const commentForm = document.getElementById("comm-comment-form");
const likeBtn = document.getElementById("comm-post-like");
const likeCountEl = document.getElementById("comm-post-like-count");
const scrapBtn = document.getElementById("comm-post-scrap");
const postImageWrap = document.getElementById("comm-post-image-wrap");
const postImageEl = document.getElementById("comm-post-image");
const editPhotoInput = document.getElementById("comm-edit-photo");
const editPhotoClear = document.getElementById("comm-edit-photo-clear");
const editPhotoPreview = document.getElementById("comm-edit-photo-preview");
const editPhotoImg = document.getElementById("comm-edit-photo-img");

let editImageDataUrl = "";
let editImageRemoved = false;

const BLANK_IMG = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

function setEditPhotoPreview(dataUrl) {
  editImageDataUrl = dataUrl || "";
  if (editPhotoImg) editPhotoImg.src = editImageDataUrl || BLANK_IMG;
  editPhotoPreview?.classList.toggle("is-hidden", !editImageDataUrl);
  editPhotoClear?.classList.toggle("is-hidden", !editImageDataUrl);
}

function resetEditPhotoState(post) {
  editImageRemoved = false;
  if (editPhotoInput) editPhotoInput.value = "";
  const current = getPostImage(post);
  setEditPhotoPreview(current);
}

function showPostImage(post) {
  const src = getPostImage(post);
  if (postImageEl) postImageEl.src = src || BLANK_IMG;
  postImageWrap?.classList.toggle("is-hidden", !src);
}

function getPostKey() {
  return postKey(postId);
}

function renderComments() {
  const key = getPostKey();
  const comments = getComments(key);

  commentCount.textContent = String(comments.length);
  commentEmpty.classList.toggle("is-hidden", comments.length > 0);

  commentList.innerHTML = comments
    .map((c) => {
      const deleteBtn = c.own
        ? `<button type="button" class="comm-comment-delete" data-comment-id="${escapeHtml(c.id)}">삭제</button>`
        : "";
      return `
    <li class="comm-comment-item">
      <p class="comm-comment-meta">
        <span><strong>${escapeHtml(c.author)}</strong> · ${c.date}</span>
        ${deleteBtn}
      </p>
      <p class="comm-comment-text">${escapeHtml(c.text)}</p>
    </li>
  `;
    })
    .join("");
}

function updateReactUI(post) {
  const key = getPostKey();
  const likes = likeCount(post);
  likeCountEl.textContent = formatCount(likes);
  likeBtn.classList.toggle("is-liked", isPostLiked(key));
  likeBtn.setAttribute("aria-pressed", isPostLiked(key) ? "true" : "false");

  const scrapped = isScrapped(key);
  scrapBtn.classList.toggle("is-active", scrapped);
  scrapBtn.setAttribute("aria-pressed", scrapped ? "true" : "false");
  const label = scrapBtn.querySelector(".comm-scrap-label");
  if (label) label.textContent = scrapped ? "스크랩됨" : "스크랩";
}

function renderPost() {
  if (!postId) {
    showMissing();
    return;
  }

  const post = findPost(postId);
  if (!post) {
    showMissing();
    return;
  }

  const meta = BOARD_CATS[post.category] || BOARD_CATS.free;
  document.title = `${post.title} — TRIPICK 커뮤니티`;

  badgeEl.textContent = meta.label;
  badgeEl.className = `comm-badge ${meta.badge}`;
  titleEl.textContent = post.title;
  metaEl.textContent = `${post.author} · ${post.date} · 조회 ${formatCount(viewCount(post))} · 좋아요 ${formatCount(likeCount(post))}`;
  bodyEl.textContent = getPostBody(post);
  showPostImage(post);

  updateReactUI(post);

  const isOwner = post.category !== "notice" && isUserPost(post.id);
  ownerBar.classList.toggle("is-hidden", !isOwner);

  if (isOwner && editForm) {
    editForm.querySelector('[name="category"]').value = post.category;
    editForm.querySelector('[name="title"]').value = post.title;
    editForm.querySelector('[name="body"]').value = post.body || "";
    resetEditPhotoState(post);
  }

  setEditMode(false);
  renderComments();

  article.hidden = false;
  missing.hidden = true;
}

function setEditMode(on) {
  postView.classList.toggle("is-hidden", on);
  editForm.classList.toggle("is-hidden", !on);
  if (!on) {
    const post = findPost(postId);
    const isOwner = post && post.category !== "notice" && isUserPost(post.id);
    ownerBar.classList.toggle("is-hidden", !isOwner);
  } else {
    ownerBar.classList.add("is-hidden");
  }
}

function showMissing() {
  article.hidden = true;
  missing.hidden = false;
  document.title = "게시글을 찾을 수 없음 — TRIPICK";
}

deleteBtn?.addEventListener("click", () => {
  if (!postId || postId === "notice") return;
  if (!confirm("이 게시글을 삭제할까요?")) return;
  if (deleteUserPost(postId)) {
    window.location.href = "community.html";
  }
});

editBtn?.addEventListener("click", () => {
  setEditMode(true);
  editForm?.querySelector('[name="title"]')?.focus();
});

editCancelBtn?.addEventListener("click", () => {
  renderPost();
});

editPhotoInput?.addEventListener("change", async () => {
  const file = editPhotoInput.files && editPhotoInput.files[0];
  if (!file) return;
  try {
    const dataUrl = await compressImageFile(file);
    editImageRemoved = false;
    setEditPhotoPreview(dataUrl);
  } catch (err) {
    alert(err.message || "사진을 추가하지 못했어요.");
    if (editPhotoInput) editPhotoInput.value = "";
  }
});

editPhotoClear?.addEventListener("click", () => {
  editImageRemoved = true;
  setEditPhotoPreview("");
  if (editPhotoInput) editPhotoInput.value = "";
});

editForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!postId || postId === "notice") return;

  const fd = new FormData(editForm);
  const title = String(fd.get("title") || "").trim();
  const body = String(fd.get("body") || "").trim();
  const category = String(fd.get("category") || "free");

  if (!title) return;

  const current = findPost(postId);
  let image = getPostImage(current);
  if (editImageRemoved) image = "";
  if (editImageDataUrl) image = editImageDataUrl;

  const updates = {
    title,
    body,
    category,
    image,
    thumb: image || COMM_DEFAULT_THUMB,
  };

  try {
    if (updateUserPost(postId, updates)) {
      renderPost();
    }
  } catch {
    alert("저장 공간이 부족합니다. 사진 크기를 줄이거나 사진을 빼고 저장해 주세요.");
  }
});

commentForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!postId) return;

  const fd = new FormData(commentForm);
  const author = String(fd.get("author") || "").trim();
  const text = String(fd.get("text") || "").trim();
  if (!text) return;

  addComment(getPostKey(), author, text);
  commentForm.reset();
  renderComments();
});

commentList?.addEventListener("click", (e) => {
  const btn = e.target.closest(".comm-comment-delete");
  if (!btn) return;
  const commentId = btn.getAttribute("data-comment-id");
  if (!commentId) return;
  if (!confirm("댓글을 삭제할까요?")) return;
  if (deleteComment(getPostKey(), commentId)) {
    renderComments();
  }
});

likeBtn?.addEventListener("click", () => {
  const post = findPost(postId);
  if (!post) return;
  toggleLike(post);
  const updated = findPost(postId);
  metaEl.textContent = `${updated.author} · ${updated.date} · 조회 ${formatCount(viewCount(updated))} · 좋아요 ${formatCount(likeCount(updated))}`;
  updateReactUI(updated);
});

scrapBtn?.addEventListener("click", () => {
  toggleScrap(getPostKey());
  updateReactUI(findPost(postId));
});

function loadPostPage() {
  if (!postId) {
    showMissing();
    return;
  }
  if (!findPost(postId)) {
    showMissing();
    return;
  }
  addView(postId);
  renderPost();
}

loadPostPage();
