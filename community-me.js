/* jshint esversion: 11, browser: true, laxbreak: true */
/* globals getUserPosts, postHref, escapeHtml, formatCount, likeCount, myComments, scrappedPosts,
   readNotify, saveNotify */
const params = new URLSearchParams(window.location.search);
const tab = params.get("tab") || "posts";
const panel = document.getElementById("comm-my-panel");
const tabLinks = document.querySelectorAll(".comm-my-tab");

tabLinks.forEach((link) => {
  link.classList.toggle("is-active", link.dataset.tab === tab);
});

function renderPosts() {
  const posts = getUserPosts();
  if (!posts.length) {
    panel.innerHTML = `<p class="comm-my-empty">아직 작성한 글이 없습니다. <a href="community.html">글쓰기</a></p>`;
    return;
  }
  panel.innerHTML = `
    <ul class="comm-my-list">
      ${posts
        .map(
          (p) => `
        <li>
          <a href="${postHref(p)}" class="comm-my-link">${escapeHtml(p.title)}</a>
          <span class="comm-my-sub">${p.date} · 좋아요 ${formatCount(likeCount(p))}</span>
        </li>
      `
        )
        .join("")}
    </ul>`;
}

function renderComments() {
  const list = myComments();
  if (!list.length) {
    panel.innerHTML = `<p class="comm-my-empty">등록한 댓글이 없습니다.</p>`;
    return;
  }
  panel.innerHTML = `
    <ul class="comm-my-list comm-my-list-comments">
      ${list
        .map(
          (c) => `
        <li>
          <a href="${c.postHref}" class="comm-my-link">${escapeHtml(c.postTitle)}</a>
          <p class="comm-my-comment">${escapeHtml(c.text)}</p>
          <span class="comm-my-sub">${c.date}</span>
        </li>
      `
        )
        .join("")}
    </ul>`;
}

function renderScraps() {
  const posts = scrappedPosts();
  if (!posts.length) {
    panel.innerHTML = `<p class="comm-my-empty">스크랩한 글이 없습니다. 게시글에서 스크랩해 보세요.</p>`;
    return;
  }
  panel.innerHTML = `
    <ul class="comm-my-list">
      ${posts
        .map(
          (p) => `
        <li>
          <a href="${postHref(p)}" class="comm-my-link">${escapeHtml(p.title)}</a>
          <span class="comm-my-sub">${escapeHtml(p.author)} · ${p.date}</span>
        </li>
      `
        )
        .join("")}
    </ul>`;
}

function renderSettings() {
  const s = readNotify();
  panel.innerHTML = `
    <form class="comm-my-settings" id="comm-notify-form">
      <p class="comm-my-settings-lead">알림은 이 브라우저에만 저장됩니다. (데모용 설정)</p>
      <label class="comm-my-check">
        <input type="checkbox" name="reply" ${s.reply ? "checked" : ""}>
        내 글에 댓글이 달리면 알림
      </label>
      <label class="comm-my-check">
        <input type="checkbox" name="like" ${s.like ? "checked" : ""}>
        내 글에 좋아요가 생기면 알림
      </label>
      <label class="comm-my-check">
        <input type="checkbox" name="notice" ${s.notice ? "checked" : ""}>
        커뮤니티 공지 알림
      </label>
      <button type="submit" class="record-btn">저장</button>
    </form>`;

  document.getElementById("comm-notify-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    saveNotify({
      reply: fd.get("reply") === "on",
      like: fd.get("like") === "on",
      notice: fd.get("notice") === "on",
    });
    alert("알림 설정을 저장했습니다.");
  });
}

switch (tab) {
  case "comments":
    renderComments();
    break;
  case "scraps":
    renderScraps();
    break;
  case "settings":
    renderSettings();
    break;
  default:
    renderPosts();
}
