/* jshint esversion: 11, browser: true, laxbreak: true */
/* exported TRIPICK_PLACES, isFavorite, toggleFavorite, getFavorites, getRecent, addRecent,
   getPlaceById, getPlacesByIds, getPlaceSub, getBrowsePlaces */
const TRIPICK_PLACES = [
  {
    id: "osaka",
    name: "OSAKA",
    nameKo: "오사카",
    country: "일본",
    region: "overseas",
    tag: "도시",
    img: "images/osaka.jpg",
    search: ["오사카", "osaka", "일본"],
  },
  {
    id: "tokyo",
    name: "TOKYO",
    nameKo: "도쿄",
    country: "일본",
    region: "overseas",
    tag: "도시",
    img: "images/tokyo.jpg",
    search: ["도쿄", "tokyo", "일본"],
  },
  {
    id: "jeju",
    name: "JEJU",
    nameKo: "제주",
    country: "대한민국",
    region: "domestic",
    tag: "자연",
    img: "images/jeju.jpg",
    search: ["제주", "jeju", "한국", "국내"],
  },
  {
    id: "paris",
    name: "PARIS",
    nameKo: "파리",
    country: "프랑스",
    region: "overseas",
    tag: "도시",
    img: "images/paris.jpg",
    search: ["파리", "paris", "프랑스", "유럽"],
  },
  {
    id: "bangkok",
    name: "BANGKOK",
    nameKo: "방콕",
    country: "태국",
    region: "overseas",
    tag: "문화",
    img: "images/bangkok.jpg",
    search: ["방콕", "bangkok", "태국"],
  },
  {
    id: "hawaii",
    name: "HAWAII",
    nameKo: "하와이",
    country: "미국",
    region: "overseas",
    tag: "휴양",
    img: "images/hawaii.jpg",
    search: ["하와이", "hawaii", "미국"],
  },
  {
    id: "rome",
    name: "ROME",
    nameKo: "로마",
    country: "이탈리아",
    region: "overseas",
    tag: "역사",
    img: "images/rome.jpg",
    search: ["로마", "rome", "이탈리아", "유럽"],
  },
  {
    id: "london",
    name: "LONDON",
    nameKo: "런던",
    country: "영국",
    region: "overseas",
    tag: "도시",
    img: "images/london.jpg",
    search: ["런던", "london", "영국", "유럽"],
  },
  {
    id: "fukuoka",
    name: "FUKUOKA",
    nameKo: "후쿠오카",
    country: "일본",
    region: "overseas",
    tag: "도시",
    img: "images/fukuoka.jpg",
    search: ["후쿠오카", "fukuoka", "일본"],
  },
  {
    id: "busan",
    name: "BUSAN",
    nameKo: "부산",
    country: "대한민국",
    region: "domestic",
    tag: "바다",
    img: "images/busan.jpg",
    search: ["부산", "busan", "한국", "국내", "대한민국"],
  },
  {
    id: "newyork",
    name: "NEW YORK",
    nameKo: "뉴욕",
    country: "미국",
    region: "overseas",
    tag: "도시",
    img: "images/newyork.jpg",
    search: ["뉴욕", "new york", "newyork", "미국"],
  },
  {
    id: "danang",
    name: "DA NANG",
    nameKo: "다낭",
    country: "베트남",
    region: "overseas",
    tag: "휴양",
    img: "images/danang.jpg",
    search: ["다낭", "danang", "베트남"],
  },
  {
    id: "taipei",
    name: "TAIPEI",
    nameKo: "타이베이",
    country: "대만",
    region: "overseas",
    tag: "야시장",
    img: "images/taipei.jpg",
    search: ["타이베이", "타이페이", "taipei", "대만"],
  },
  {
    id: "sydney",
    name: "SYDNEY",
    nameKo: "시드니",
    country: "호주",
    region: "overseas",
    tag: "바다",
    img: "images/sydney.jpg",
    search: ["시드니", "sydney", "호주"],
  },
];

const FAV_KEY = "tripick_favorites";
const RECENT_KEY = "tripick_recent";
const RECENT_MAX = 10;

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
  } catch {
    return [];
  }
}

function saveFavorites(ids) {
  localStorage.setItem(FAV_KEY, JSON.stringify(ids));
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  const list = getFavorites();
  const index = list.indexOf(id);

  if (index === -1) {
    saveFavorites([...list, id]);
    return true;
  }

  list.splice(index, 1);
  saveFavorites(list);
  return false;
}

function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

function addRecent(id) {
  const list = getRecent().filter((item) => item !== id);
  list.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
}

function getPlaceById(id) {
  return TRIPICK_PLACES.find((place) => place.id === id);
}

function getPlacesByIds(ids) {
  return ids.map((id) => getPlaceById(id)).filter(Boolean);
}

function getPlaceSub(place) {
  return `${place.country} / ${place.nameKo}`;
}

function getBrowsePlaces() {
  return TRIPICK_PLACES.filter((place) => !place.hidden);
}
