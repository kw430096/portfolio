/* jshint esversion: 11, browser: true, laxbreak: true */
/* exported COMM_NEXT_ID_KEY, HOT_ITEMS, BOARD_CATS, COMM_DEFAULT_THUMB, getPostImage,
   compressImageFile, getPostBody, formatCount, escapeHtml, deleteUserPost, updateUserPost,
   addComment, deleteComment, addView, toggleLike, isScrapped, toggleScrap, readNotify,
   saveNotify, myComments, scrappedPosts */
const COMM_USER_KEY = "tripick_community_user_posts";
const COMM_NEXT_ID_KEY = "tripick_community_next_id";

const COMM_NOTICE = {
  id: "notice",
  category: "notice",
  title: "TRIPICK 커뮤니티 이용 안내 및 게시판 규칙",
  author: "운영팀",
  date: "2024.03.01",
  views: 1024,
  likes: 48,
  thumb: "images/logo.png",
  body: `TRIPICK 커뮤니티에 오신 것을 환영합니다.

· 서로를 존중하는 말과 태도를 지켜 주세요.
· 개인정보(연락처, 주소 등)는 게시하지 않습니다.
· 광고·홍보 목적의 반복 게시는 제한될 수 있습니다.
· 여행 정보는 참고용이며, 일정·비용은 직접 확인해 주세요.

즐거운 여행 이야기 나눠 주세요!`,
};

const DEFAULT_POSTS = [
  {
    id: 128,
    category: "tip",
    title: "유럽 기차 여행, Eurail 패스 꼭 사야 할까요?",
    author: "trainlover",
    date: "2024.03.18",
    views: 892,
    likes: 56,
    thumb: "images/rome.jpg",
    body: `여러 나라를 짧게 돌 계획이라 패스를 샀는데, 생각보다 예약·좌석 지정이 번거로웠어요.

· 이동이 많고 장거리(4시간+)가 잦으면 패스가 유리
· 도시 2~3곳만 가면 개별 표가 더 쌀 때도 많음
· Eurail 앱에서 예약 가능 열차인지 미리 확인하는 게 핵심

저는 5국 8일 일정에서 패스가 약간 이득이었지만, 친구 3국 5일은 개별이 더 저렴했습니다.`,
  },
  {
    id: 127,
    category: "free",
    title: "혼자 떠난 오사카 3박 4일, 첫 솔로 여행 후기",
    author: "solo_j",
    date: "2024.03.17",
    views: 1203,
    likes: 102,
    thumb: "images/osaka.jpg",
    body: `첫 솔로 여행으로 오사카 다녀왔습니다.

· 숙소는 난바 역 근처 게스트하우스 — 밤에 돌아다니기 편했어요
· USJ는 평일 오전 입장 추천, 오후엔 사람 많음
· 혼밥 걱정했는데 이치란·쿠로몬 시장·편의점 도시락도 충분히 좋았습니다

혼자 가도 외롭기보다 자유로움이 더 컸어요. 다음엔 교토 당일치기도 해보려고요.`,
  },
  {
    id: 126,
    category: "q",
    title: "4월 제주도 렌트카 vs 대중교통, 2박이면 뭐가 나을까요?",
    author: "jeju_plan",
    date: "2024.03.16",
    views: 456,
    likes: 23,
    thumb: "images/jeju.jpg",
    body: `4월 초 제주 2박 3일, 성산·협재·애월 정도만 가보려고 합니다. 운전은 가능한데 제주가 처음이라 고민돼요.

· 렌트: 이동 자유롭지만 주차·주유·보험 비용
· 버스: 저렴하지만 환승·시간

동선 기준으로 어떤 쪽이 나을까요?`,
  },
  {
    id: 125,
    category: "mate",
    title: "5월 초 방콕 3박 — 비슷한 연령대 여행 메이트 구해요",
    author: "bangkok_d",
    date: "2024.03.15",
    views: 678,
    likes: 31,
    thumb: "images/bangkok.jpg",
    body: `5/3~5/6 방콕 3박, 20대 후반~30대 초반 여성분과 가볍게 같이 다니실 분 구합니다.

· 왓포·차오프라야·카페·야시장 위주 (클럽 X)
· 숙소는 각자 / 일정만 맞춰도 OK
· 카톡 또는 인스타 DM 주세요 (댓글 남겨주시면 연락드릴게요)`,
  },
];

const HOT_ITEMS = [COMM_NOTICE, ...DEFAULT_POSTS];

/* 게시판 카테고리별 라벨·탭 이름 */
const BOARD_CATS = {
  tip: { label: "여행팁", badge: "comm-badge-tip", tab: "여행 팁" },
  free: { label: "자유", badge: "comm-badge-free", tab: "자유 여행 이야기" },
  q: { label: "질문", badge: "comm-badge-q", tab: "여행지 질문" },
  mate: { label: "동행", badge: "comm-badge-mate", tab: "동행 구해요" },
  notice: { label: "공지", badge: "comm-badge-notice", tab: "공지사항" },
};

const COMM_DEFAULT_THUMB = "images/travel.png";
const COMM_IMAGE_MAX_WIDTH = 1200;
const COMM_IMAGE_TARGET_CHARS = 900000;

function getUserPosts() {
  try {
    const raw = localStorage.getItem(COMM_USER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUserPosts(posts) {
  localStorage.setItem(COMM_USER_KEY, JSON.stringify(posts));
}

function getPostImage(post) {
  if (!post) return "";
  if (post.image && String(post.image).trim()) return String(post.image);
  if (post.thumb && String(post.thumb).startsWith("data:image/")) return String(post.thumb);
  return "";
}

function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      reject(new Error("이미지 파일만 첨부할 수 있어요."));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      reject(new Error("이미지는 8MB 이하로 올려 주세요."));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, COMM_IMAGE_MAX_WIDTH / Math.max(img.width, 1));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("이미지를 처리하지 못했어요."));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.82;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > COMM_IMAGE_TARGET_CHARS && quality > 0.45) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("이미지를 불러오지 못했어요."));
    };

    img.src = objectUrl;
  });
}

function isUserPost(id) {
  return getUserPosts().some((p) => p.id === id);
}

function normalizePostId(raw) {
  return raw === "notice" ? "notice" : Number(raw);
}

function findPost(rawId) {
  const id = normalizePostId(rawId);
  if (id === "notice") return { ...COMM_NOTICE };
  const user = getUserPosts().find((p) => p.id === id);
  if (user) return { ...user };
  const found = DEFAULT_POSTS.find((p) => p.id === id);
  return found ? { ...found } : null;
}

function getPostBody(post) {
  const text = post.body && String(post.body).trim();
  return text || "등록된 본문이 없습니다.";
}

function postHref(post) {
  const id = post.category === "notice" ? "notice" : String(post.id);
  return `community-post.html?id=${encodeURIComponent(id)}`;
}

function formatCount(n) {
  return n.toLocaleString("en-US");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function deleteUserPost(id) {
  const numId = Number(id);
  if (!isUserPost(numId)) return false;
  const next = getUserPosts().filter((p) => p.id !== numId);
  saveUserPosts(next);
  deleteCommentsForPost(String(numId));
  return true;
}

function updateUserPost(id, updates) {
  const numId = Number(id);
  if (!isUserPost(numId)) return false;
  const posts = getUserPosts().map((p) =>
    p.id === numId ? { ...p, ...updates } : p
  );
  saveUserPosts(posts);
  return true;
}

function postKey(rawId) {
  return rawId === "notice" ? "notice" : String(normalizePostId(rawId));
}

const COMM_COMMENTS_KEY = "tripick_community_comments";

const SEED_COMMENTS = {
  notice: [
    {
      id: "s-notice-1",
      author: "tripick_user",
      date: "2024.03.02",
      text: "규칙 정리해 주셔서 보기 편하네요.",
    },
  ],
  "128": [
    {
      id: "s-128-1",
      author: "interrail_k",
      date: "2024.03.18",
      text: "스위스만 짧게 갔는데도 패스보다 개별이 싸더라고요. 일정표 먼저 짜보는 게 맞는 듯.",
    },
    {
      id: "s-128-2",
      author: "trainlover",
      date: "2024.03.19",
      text: "댓글 감사합니다! 저도 다음엔 도시 수 줄여서 다시 계산해 볼게요.",
    },
  ],
  "127": [
    {
      id: "s-127-1",
      author: "osaka_fan",
      date: "2024.03.17",
      text: "난바 쪽 숙소 어디 쓰셨어요? 저도 4월에 혼자 가요.",
    },
  ],
  "126": [
    {
      id: "s-126-1",
      author: "jeju_local",
      date: "2024.03.16",
      text: "2박이면 렌트보다는 버스+택시 섞는 분들도 많아요. 애월·협재만 갈 거면 버스도 괜찮습니다.",
    },
  ],
  "125": [
    {
      id: "s-125-1",
      author: "bangkok_d",
      date: "2024.03.15",
      text: "DM 보냈어요~ 일정 비슷하면 연락 주세요.",
    },
  ],
};

function readCommentStore() {
  try {
    const raw = localStorage.getItem(COMM_COMMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCommentStore(store) {
  localStorage.setItem(COMM_COMMENTS_KEY, JSON.stringify(store));
}

function getComments(postKey) {
  const store = readCommentStore();
  if (store[postKey] && store[postKey].length > 0) {
    return store[postKey];
  }
  return SEED_COMMENTS[postKey] ? [...SEED_COMMENTS[postKey]] : [];
}

function addComment(postKey, author, text) {
  const store = readCommentStore();
  const list = getComments(postKey);
  const entry = {
    id: `c-${Date.now()}`,
    author: author.trim() || "익명",
    date: formatCommentDate(new Date()),
    text: text.trim(),
    own: true,
  };
  const next = [...list, entry];
  store[postKey] = next;
  saveCommentStore(store);
  return entry;
}

function deleteComment(postKey, commentId) {
  const list = getComments(postKey);
  const target = list.find((c) => c.id === commentId);
  if (!target || !target.own) return false;

  const store = readCommentStore();
  store[postKey] = list.filter((c) => c.id !== commentId);
  saveCommentStore(store);
  return true;
}

function deleteCommentsForPost(postKey) {
  const store = readCommentStore();
  delete store[postKey];
  saveCommentStore(store);
}

function formatCommentDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

const COMM_LIKES_KEY = "tripick_community_likes";
const COMM_SCRAPS_KEY = "tripick_community_scraps";
const COMM_NOTIFY_KEY = "tripick_community_notify";
const COMM_VIEW_DELTAS_KEY = "tripick_community_view_deltas";

function readExtraViews() {
  try {
    const raw = localStorage.getItem(COMM_VIEW_DELTAS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveExtraViews(store) {
  localStorage.setItem(COMM_VIEW_DELTAS_KEY, JSON.stringify(store));
}

function viewCount(post) {
  if (!post) return 0;
  const key = postKey(post.category === "notice" ? "notice" : post.id);
  if (post.category !== "notice" && isUserPost(Number(post.id))) {
    const fresh = findPost(post.id);
    return fresh ? fresh.views || 0 : post.views || 0;
  }
  const base = post.views || 0;
  const delta = readExtraViews()[key] || 0;
  return base + delta;
}

function addView(rawId) {
  const post = findPost(rawId);
  if (!post) return 0;

  const key = postKey(rawId);

  if (post.category !== "notice" && isUserPost(Number(post.id))) {
    const posts = getUserPosts();
    const p = posts.find((x) => x.id === post.id);
    if (p) {
      p.views = (p.views || 0) + 1;
      saveUserPosts(posts);
    }
    return viewCount(findPost(rawId));
  }

  const store = readExtraViews();
  store[key] = (store[key] || 0) + 1;
  saveExtraViews(store);
  return viewCount(findPost(rawId));
}

function readLikeStore() {
  try {
    const raw = localStorage.getItem(COMM_LIKES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLikeStore(store) {
  localStorage.setItem(COMM_LIKES_KEY, JSON.stringify(store));
}

function isPostLiked(postKey) {
  return Boolean(readLikeStore()[postKey]);
}

function setLiked(postKey, liked) {
  const store = readLikeStore();
  if (liked) store[postKey] = true;
  else delete store[postKey];
  saveLikeStore(store);
}

function likeCount(post) {
  if (!post) return 0;
  const key = postKey(post.category === "notice" ? "notice" : post.id);
  if (post.category !== "notice" && isUserPost(Number(post.id))) {
    const fresh = findPost(post.id);
    return fresh ? fresh.likes : post.likes || 0;
  }
  const base = post.likes || 0;
  return base + (isPostLiked(key) ? 1 : 0);
}

function toggleLike(post) {
  if (!post) return 0;
  const key = postKey(post.category === "notice" ? "notice" : post.id);
  const wasLiked = isPostLiked(key);
  setLiked(key, !wasLiked);

  if (post.category !== "notice" && isUserPost(Number(post.id))) {
    const posts = getUserPosts();
    const p = posts.find((x) => x.id === post.id);
    if (p) {
      p.likes = Math.max(0, (p.likes || 0) + (!wasLiked ? 1 : -1));
      saveUserPosts(posts);
    }
  }

  return likeCount(findPost(key));
}

function getScrapIds() {
  try {
    const raw = localStorage.getItem(COMM_SCRAPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScrapIds(ids) {
  localStorage.setItem(COMM_SCRAPS_KEY, JSON.stringify(ids));
}

function isScrapped(postKey) {
  return getScrapIds().includes(postKey);
}

function toggleScrap(postKey) {
  let ids = getScrapIds();
  if (ids.includes(postKey)) {
    ids = ids.filter((id) => id !== postKey);
  } else {
    ids = [...ids, postKey];
  }
  saveScrapIds(ids);
  return ids.includes(postKey);
}

function readNotify() {
  try {
    const raw = localStorage.getItem(COMM_NOTIFY_KEY);
    return (
      raw ? JSON.parse(raw) : {
        reply: true,
        like: true,
        notice: true,
      }
    );
  } catch {
    return { reply: true, like: true, notice: true };
  }
}

function saveNotify(settings) {
  localStorage.setItem(COMM_NOTIFY_KEY, JSON.stringify(settings));
}

function commentPostKeys() {
  const store = readCommentStore();
  const keys = new Set(Object.keys(store));
  Object.keys(SEED_COMMENTS).forEach((k) => keys.add(k));
  return [...keys];
}

function myComments() {
  const out = [];
  commentPostKeys().forEach((key) => {
    getComments(key)
      .filter((c) => c.own)
      .forEach((c) => {
        const post = findPost(key);
        out.push({
          ...c,
          postKey: key,
          postTitle: post ? post.title : "글을 찾을 수 없음",
          postHref: post ? postHref(post) : "community.html",
        });
      });
  });
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

function scrappedPosts() {
  return getScrapIds()
    .map((key) => findPost(key))
    .filter(Boolean);
}
