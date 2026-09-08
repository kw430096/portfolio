/* jshint esversion: 11, browser: true, laxbreak: true */
const startBtn = document.getElementById("start-quiz");
const startBox = document.getElementById("recommend-start");
const workBox = document.getElementById("recommend-work");
const quizBox = document.getElementById("recommend-quiz");
const loadingBox = document.getElementById("recommend-loading");
const resultBox = document.getElementById("recommend-result");
const retryBtn = document.getElementById("retry-quiz");
const styleCards = document.querySelectorAll(".rec-style-card");
const panels = document.querySelectorAll(".quiz-panel");
const options = document.querySelectorAll(".quiz-opt");
const nextBtns = document.querySelectorAll(".quiz-next");
const submitBtn = document.querySelector(".quiz-submit");

const resultImg = document.getElementById("result-img");
const resultName = document.getElementById("result-name");
const resultLocation = document.getElementById("result-location");
const resultIntro = document.getElementById("result-intro");
const resultDesc = document.getElementById("result-desc");
const resultTasteList = document.getElementById("result-taste-list");
const resultDetail = document.getElementById("result-detail");

let currentStep = 1;

const places = {
  jeju: {
    en: "JEJU",
    ko: "대한민국 제주",
    name: "제주",
    emoji: "🌿",
    img: "images/jeju.jpg",
  },
  hawaii: {
    en: "HAWAII",
    ko: "미국 하와이",
    name: "하와이",
    emoji: "🌺",
    img: "images/hawaii.jpg",
  },
  busan: {
    en: "BUSAN",
    ko: "대한민국 부산",
    name: "부산",
    emoji: "🌊",
    img: "images/busan.jpg",
  },
  tokyo: {
    en: "TOKYO",
    ko: "일본 도쿄",
    name: "도쿄",
    emoji: "🗼",
    img: "images/tokyo.jpg",
  },
  paris: {
    en: "PARIS",
    ko: "프랑스 파리",
    name: "파리",
    emoji: "🗼",
    img: "images/paris.jpg",
  },
  osaka: {
    en: "OSAKA",
    ko: "일본 오사카",
    name: "오사카",
    emoji: "🏙️",
    img: "images/osaka.jpg",
  },
  bangkok: {
    en: "BANGKOK",
    ko: "태국 방콕",
    name: "방콕",
    emoji: "🛕",
    img: "images/bangkok.jpg",
  },
  fukuoka: {
    en: "FUKUOKA",
    ko: "일본 후쿠오카",
    name: "후쿠오카",
    emoji: "🍜",
    img: "images/fukuoka.jpg",
  },
};

/* 기본 장소: 스타일×동행×기간(64). 분위기·예산으로 후보 중 재선정 */
const recRules = [
  // 조용한 휴양
  { style: "조용한 휴양", companion: "혼자", duration: "당일치기", place: "busan" },
  { style: "조용한 휴양", companion: "혼자", duration: "2~3일", place: "fukuoka" },
  { style: "조용한 휴양", companion: "혼자", duration: "4~7일", place: "hawaii" },
  { style: "조용한 휴양", companion: "혼자", duration: "일주일 이상", place: "hawaii" },
  { style: "조용한 휴양", companion: "연인", duration: "당일치기", place: "busan" },
  { style: "조용한 휴양", companion: "연인", duration: "2~3일", place: "jeju" },
  { style: "조용한 휴양", companion: "연인", duration: "4~7일", place: "hawaii" },
  { style: "조용한 휴양", companion: "연인", duration: "일주일 이상", place: "paris" },
  { style: "조용한 휴양", companion: "가족", duration: "당일치기", place: "busan" },
  { style: "조용한 휴양", companion: "가족", duration: "2~3일", place: "jeju" },
  { style: "조용한 휴양", companion: "가족", duration: "4~7일", place: "jeju" },
  { style: "조용한 휴양", companion: "가족", duration: "일주일 이상", place: "hawaii" },
  { style: "조용한 휴양", companion: "친구", duration: "당일치기", place: "busan" },
  { style: "조용한 휴양", companion: "친구", duration: "2~3일", place: "busan" },
  { style: "조용한 휴양", companion: "친구", duration: "4~7일", place: "osaka" },
  { style: "조용한 휴양", companion: "친구", duration: "일주일 이상", place: "bangkok" },

  // 도시 탐방
  { style: "도시 탐방", companion: "혼자", duration: "당일치기", place: "osaka" },
  { style: "도시 탐방", companion: "혼자", duration: "2~3일", place: "tokyo" },
  { style: "도시 탐방", companion: "혼자", duration: "4~7일", place: "paris" },
  { style: "도시 탐방", companion: "혼자", duration: "일주일 이상", place: "paris" },
  { style: "도시 탐방", companion: "연인", duration: "당일치기", place: "osaka" },
  { style: "도시 탐방", companion: "연인", duration: "2~3일", place: "tokyo" },
  { style: "도시 탐방", companion: "연인", duration: "4~7일", place: "paris" },
  { style: "도시 탐방", companion: "연인", duration: "일주일 이상", place: "paris" },
  { style: "도시 탐방", companion: "가족", duration: "당일치기", place: "tokyo" },
  { style: "도시 탐방", companion: "가족", duration: "2~3일", place: "tokyo" },
  { style: "도시 탐방", companion: "가족", duration: "4~7일", place: "osaka" },
  { style: "도시 탐방", companion: "가족", duration: "일주일 이상", place: "bangkok" },
  { style: "도시 탐방", companion: "친구", duration: "당일치기", place: "osaka" },
  { style: "도시 탐방", companion: "친구", duration: "2~3일", place: "osaka" },
  { style: "도시 탐방", companion: "친구", duration: "4~7일", place: "bangkok" },
  { style: "도시 탐방", companion: "친구", duration: "일주일 이상", place: "bangkok" },

  // 자연 속 여행
  { style: "자연 속 여행", companion: "혼자", duration: "당일치기", place: "busan" },
  { style: "자연 속 여행", companion: "혼자", duration: "2~3일", place: "jeju" },
  { style: "자연 속 여행", companion: "혼자", duration: "4~7일", place: "hawaii" },
  { style: "자연 속 여행", companion: "혼자", duration: "일주일 이상", place: "hawaii" },
  { style: "자연 속 여행", companion: "연인", duration: "당일치기", place: "busan" },
  { style: "자연 속 여행", companion: "연인", duration: "2~3일", place: "jeju" },
  { style: "자연 속 여행", companion: "연인", duration: "4~7일", place: "hawaii" },
  { style: "자연 속 여행", companion: "연인", duration: "일주일 이상", place: "hawaii" },
  { style: "자연 속 여행", companion: "가족", duration: "당일치기", place: "busan" },
  { style: "자연 속 여행", companion: "가족", duration: "2~3일", place: "jeju" },
  { style: "자연 속 여행", companion: "가족", duration: "4~7일", place: "jeju" },
  { style: "자연 속 여행", companion: "가족", duration: "일주일 이상", place: "hawaii" },
  { style: "자연 속 여행", companion: "친구", duration: "당일치기", place: "busan" },
  { style: "자연 속 여행", companion: "친구", duration: "2~3일", place: "busan" },
  { style: "자연 속 여행", companion: "친구", duration: "4~7일", place: "bangkok" },
  { style: "자연 속 여행", companion: "친구", duration: "일주일 이상", place: "bangkok" },

  // 맛집 여행
  { style: "맛집 여행", companion: "혼자", duration: "당일치기", place: "fukuoka" },
  { style: "맛집 여행", companion: "혼자", duration: "2~3일", place: "fukuoka" },
  { style: "맛집 여행", companion: "혼자", duration: "4~7일", place: "tokyo" },
  { style: "맛집 여행", companion: "혼자", duration: "일주일 이상", place: "tokyo" },
  { style: "맛집 여행", companion: "연인", duration: "당일치기", place: "fukuoka" },
  { style: "맛집 여행", companion: "연인", duration: "2~3일", place: "osaka" },
  { style: "맛집 여행", companion: "연인", duration: "4~7일", place: "paris" },
  { style: "맛집 여행", companion: "연인", duration: "일주일 이상", place: "paris" },
  { style: "맛집 여행", companion: "가족", duration: "당일치기", place: "fukuoka" },
  { style: "맛집 여행", companion: "가족", duration: "2~3일", place: "osaka" },
  { style: "맛집 여행", companion: "가족", duration: "4~7일", place: "bangkok" },
  { style: "맛집 여행", companion: "가족", duration: "일주일 이상", place: "bangkok" },
  { style: "맛집 여행", companion: "친구", duration: "당일치기", place: "fukuoka" },
  { style: "맛집 여행", companion: "친구", duration: "2~3일", place: "osaka" },
  { style: "맛집 여행", companion: "친구", duration: "4~7일", place: "bangkok" },
  { style: "맛집 여행", companion: "친구", duration: "일주일 이상", place: "tokyo" },
];

const styleFallback = {
  "조용한 휴양": "busan",
  "도시 탐방": "tokyo",
  "자연 속 여행": "hawaii",
  "맛집 여행": "fukuoka",
};

/* 스타일별 대체 후보 (기본 결과와 섞어 분위기·예산으로 고름) */
const stylePool = {
  "조용한 휴양": ["jeju", "hawaii", "busan", "paris", "fukuoka"],
  "도시 탐방": ["tokyo", "paris", "osaka", "bangkok", "fukuoka"],
  "자연 속 여행": ["jeju", "hawaii", "busan", "bangkok"],
  "맛집 여행": ["fukuoka", "osaka", "tokyo", "bangkok", "paris"],
};

const placeCost = {
  busan: 1,
  jeju: 2,
  fukuoka: 2,
  osaka: 2,
  bangkok: 2,
  tokyo: 3,
  hawaii: 4,
  paris: 4,
};

const vibeScore = {
  "여유로운 분위기": {
    hawaii: 3,
    jeju: 3,
    busan: 2,
    paris: 2,
    fukuoka: 1,
    tokyo: 0,
    osaka: 0,
    bangkok: 0,
  },
  "활기찬 분위기": {
    bangkok: 3,
    osaka: 3,
    tokyo: 2,
    busan: 2,
    fukuoka: 2,
    paris: 1,
    jeju: 0,
    hawaii: 0,
  },
  "감성적인 분위기": {
    paris: 3,
    hawaii: 3,
    jeju: 2,
    tokyo: 1,
    osaka: 1,
    busan: 1,
    fukuoka: 0,
    bangkok: 0,
  },
  "색다른 분위기": {
    bangkok: 3,
    fukuoka: 2,
    osaka: 2,
    paris: 2,
    tokyo: 1,
    hawaii: 1,
    jeju: 1,
    busan: 1,
  },
};

const companionLabel = {
  혼자: "혼자",
  연인: "연인과 함께",
  친구: "친구와 함께",
  가족: "가족과 함께",
};

const atmosphereLabel = {
  "여유로운 분위기": "여유롭게",
  "활기찬 분위기": "활기차게",
  "감성적인 분위기": "감성적으로",
  "색다른 분위기": "색다르게",
};

let progressBuilt = false;

function renderProgress(step) {
  if (!quizBox) return;

  if (!progressBuilt) {
    const wrap = document.createElement("div");
    wrap.className = "quiz-progress";

    const count = document.createElement("p");
    count.className = "quiz-progress-count";

    const dots = document.createElement("div");
    dots.className = "quiz-progress-dots";
    dots.setAttribute("aria-hidden", "true");
    for (let i = 0; i < panels.length; i += 1) {
      dots.appendChild(document.createElement("span"));
    }

    wrap.appendChild(count);
    wrap.appendChild(dots);
    quizBox.insertBefore(wrap, quizBox.firstChild);
    progressBuilt = true;
  }

  quizBox.querySelector(".quiz-progress-count").textContent =
    step + " / " + panels.length;
  quizBox.querySelectorAll(".quiz-progress-dots span").forEach((dot, i) => {
    dot.classList.toggle("is-done", i < step - 1);
    dot.classList.toggle("is-active", i === step - 1);
  });
}

function showStep(step) {
  panels.forEach((panel) => {
    panel.classList.toggle("is-hidden", Number(panel.dataset.step) !== step);
  });
  renderProgress(step);
}

function getOptionText(btn) {
  const tit = btn.querySelector(".quiz-opt-tit");
  if (tit) return tit.textContent.trim();
  const label = btn.querySelector("span:last-child");
  if (label && !label.classList.contains("quiz-opt-emoji")) {
    return label.textContent.trim();
  }
  return btn.textContent.trim();
}

function getSelectedInPanel(panel) {
  const selected = panel.querySelector(".quiz-opt.is-selected");
  return selected ? getOptionText(selected) : "";
}

function getAnswers() {
  return {
    style: getSelectedInPanel(panels[0]),
    companion: getSelectedInPanel(panels[1]),
    duration: getSelectedInPanel(panels[2]),
    atmosphere: getSelectedInPanel(panels[3]),
    budget: getSelectedInPanel(panels[4]),
  };
}

function budgetScore(place, budget) {
  const cost = placeCost[place] || 2;
  if (budget.startsWith("가성비")) {
    if (cost <= 2) return 3;
    if (cost === 3) return 1;
    return 0;
  }
  if (budget.startsWith("여유로운")) {
    if (cost >= 3) return 3;
    if (cost === 2) return 1;
    return 0;
  }
  // 적당한 예산
  if (cost === 2 || cost === 3) return 3;
  return 2;
}

function getBasePlace(style, companion, duration) {
  const match = recRules.find(
    (rule) =>
      rule.style === style &&
      rule.companion === companion &&
      rule.duration === duration
  );
  if (match) return match.place;
  return styleFallback[style] || "tokyo";
}

function getPlaceKey(style, companion, duration, atmosphere, budget) {
  const base = getBasePlace(style, companion, duration);
  const pool = [...new Set([base, ...(stylePool[style] || [])])];
  const vibes = vibeScore[atmosphere] || {};

  let best = base;
  let bestScore = -1;

  pool.forEach((place) => {
    const vibe = vibes[place] || 0;
    const budgetFit = budgetScore(place, budget || "");
    const baseBonus = place === base ? 2 : 0;
    const score = vibe * 2 + budgetFit * 2 + baseBonus;
    if (score > bestScore) {
      bestScore = score;
      best = place;
    }
  });

  return best;
}

function buildIntro(style, companion, place) {
  const name = place.name;

  if (style === "맛집 여행" && companion === "혼자") {
    return `혼자 떠나는 맛집 여행, ${name}는 어떠세요?`;
  }

  if (companion === "친구") {
    return `친구와 함께 ${name}(으)로 떠나보세요.`;
  }

  if (companion === "가족") {
    return `가족과 함께 ${name}(으)로 떠나보세요.`;
  }

  if (companion === "연인" && place.en === "HAWAII") {
    return `당신에게 ${name}를 추천해요.`;
  }

  if (companion === "혼자") {
    return `혼자 떠나기 좋은 ${name}, 어떠세요?`;
  }

  return `당신에게 ${name}를 추천해요.`;
}

function buildReason(style, companion, duration, placeKey) {
  const isShort = duration === "당일치기" || duration === "2~3일";

  const reasons = {
    "jeju|가족|자연 속 여행":
      "아름다운 자연과 여유로운 분위기 속에서 가족과 편안한 시간을 보내기 좋은 여행지에요.",
    "hawaii|연인|조용한 휴양":
      "사랑하는 사람과 여유로운 시간을 보내며 아름다운 자연 속에서 특별한 휴식을 즐겨보세요.",
    "osaka|친구|도시 탐방":
      "짧은 일정에도 다양한 볼거리와 맛있는 음식을 즐길 수 있는 활기찬 여행지에요.",
    "fukuoka|혼자|맛집 여행":
      "짧은 일정에도 맛있는 음식과 도시의 매력을 알차게 즐길 수 있어요.",
    "jeju|가족|조용한 휴양":
      "바다와 숲이 어우러진 풍경 속에서 가족과 여유로운 휴식을 즐기기 좋아요.",
    "busan|친구|조용한 휴양":
      "바다를 바라보며 친구와 함께 가볍게 쉬어가기 좋은 여행지에요.",
    "bangkok|친구|도시 탐방":
      "친구들과 함께 활기찬 거리와 다채로운 볼거리를 즐기기 좋은 여행지에요.",
    "paris|연인|도시 탐방":
      "로맨틱한 분위기 속에서 연인과 특별한 추억을 만들기 좋은 도시에요.",
    "tokyo|혼자|도시 탐방":
      "혼자서도 자유롭게 둘러보며 다양한 매력을 느끼기 좋은 도시에요.",
  };

  const key = `${placeKey}|${companion}|${style}`;
  if (reasons[key]) return reasons[key];

  const fallback = {
    "조용한 휴양": "조용하고 편안한 분위기 속에서 힐링하기 좋은 여행지에요.",
    "도시 탐방": "다양한 볼거리와 도시만의 매력을 즐기기 좋은 여행지에요.",
    "자연 속 여행": "아름다운 자연을 만끽하며 여유로운 시간을 보내기 좋아요.",
    "맛집 여행": isShort
      ? "짧은 일정에도 맛있는 음식과 즐거운 시간을 보내기 좋아요."
      : "다양한 맛과 거리의 매력을 충분히 즐길 수 있는 여행지에요.",
  };

  return fallback[style] || "당신의 선택에 어울리는 멋진 여행지에요.";
}

function buildTasteList(answers) {
  const budgetShort = {
    "가성비 여행 (5~30만원)": "가성비 예산",
    "적당한 예산 (30~100만원)": "적당한 예산",
    "여유로운 예산 (100만원 이상)": "여유로운 예산",
  };

  return [
    answers.style,
    companionLabel[answers.companion] || answers.companion,
    answers.duration,
    atmosphereLabel[answers.atmosphere] || answers.atmosphere,
    budgetShort[answers.budget] || answers.budget,
  ];
}

function showResultScreen(answers) {
  const placeKey = getPlaceKey(
    answers.style,
    answers.companion,
    answers.duration,
    answers.atmosphere,
    answers.budget
  );
  const place = places[placeKey];

  resultImg.src = place.img;
  resultImg.alt = place.ko;
  resultName.textContent = place.en;
  resultLocation.textContent = place.ko;
  resultIntro.textContent = buildIntro(answers.style, answers.companion, place);
  resultDesc.textContent = buildReason(
    answers.style,
    answers.companion,
    answers.duration,
    placeKey
  );

  resultTasteList.innerHTML = "";
  buildTasteList(answers).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    resultTasteList.appendChild(li);
  });

  if (resultDetail) {
    resultDetail.href = `detail.html?place=${placeKey}`;
  }
}

function resetQuiz() {
  currentStep = 1;
  options.forEach((opt) => opt.classList.remove("is-selected"));
  showStep(currentStep);
}

function showLanding() {
  if (startBox) startBox.classList.remove("is-hidden");
  if (workBox) workBox.classList.add("is-hidden");
  quizBox.classList.add("is-hidden");
  loadingBox.classList.add("is-hidden");
  resultBox.classList.add("is-hidden");
}

function preselectStyle(style) {
  if (!style || !panels[0]) return;
  panels[0].querySelectorAll(".quiz-opt").forEach((opt) => {
    opt.classList.toggle("is-selected", getOptionText(opt) === style);
  });
}

/* ----- 새로고침(F5) 시 진행 상태 유지 ----- */
const STORE_KEY = "tripick-recommend-state";

function saveState(screen) {
  try {
    sessionStorage.setItem(
      STORE_KEY,
      JSON.stringify({
        screen: screen,
        step: currentStep,
        answers: Array.from(panels).map((panel) => getSelectedInPanel(panel)),
      })
    );
  } catch (e) {
    /* sessionStorage 사용 불가 시 무시 */
  }
}

function clearState() {
  try {
    sessionStorage.removeItem(STORE_KEY);
  } catch (e) {
    /* 무시 */
  }
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function applySavedAnswers(answers) {
  if (!Array.isArray(answers)) return;
  panels.forEach((panel, i) => {
    const want = answers[i];
    panel.querySelectorAll(".quiz-opt").forEach((opt) => {
      opt.classList.toggle("is-selected", !!want && getOptionText(opt) === want);
    });
  });
}

/* F5 새로고침으로 들어온 경우에만 복원. 메뉴·버튼으로 이동해 왔으면 랜딩부터 시작 */
function isPageReload() {
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    if (nav && nav.type) return nav.type === "reload";
    return performance.navigation && performance.navigation.type === 1;
  } catch (e) {
    return false;
  }
}

function restoreState() {
  if (!isPageReload()) {
    clearState();
    return;
  }

  const state = loadState();
  if (!state || !state.screen || state.screen === "start") return;

  applySavedAnswers(state.answers);

  if (state.screen === "result") {
    const answers = getAnswers();
    if (!answers.style || !answers.budget) return;
    currentStep = panels.length;
    showResultScreen(answers);
    if (startBox) startBox.classList.add("is-hidden");
    if (workBox) workBox.classList.remove("is-hidden");
    quizBox.classList.add("is-hidden");
    loadingBox.classList.add("is-hidden");
    resultBox.classList.remove("is-hidden");
    return;
  }

  currentStep = Math.min(Math.max(Number(state.step) || 1, 1), panels.length);
  if (startBox) startBox.classList.add("is-hidden");
  if (workBox) workBox.classList.remove("is-hidden");
  quizBox.classList.remove("is-hidden");
  loadingBox.classList.add("is-hidden");
  resultBox.classList.add("is-hidden");
  showStep(currentStep);
}

function startQuiz(preselectedStyle) {
  resetQuiz();
  preselectStyle(preselectedStyle);
  if (startBox) startBox.classList.add("is-hidden");
  if (workBox) workBox.classList.remove("is-hidden");
  quizBox.classList.remove("is-hidden");
  loadingBox.classList.add("is-hidden");
  resultBox.classList.add("is-hidden");
  saveState("quiz");
}

if (startBtn) {
  startBtn.addEventListener("click", () => startQuiz());
}

styleCards.forEach((card) => {
  card.addEventListener("click", () => {
    startQuiz(card.dataset.style || "");
  });
});

options.forEach((option) => {
  option.addEventListener("click", () => {
    const panel = option.closest(".quiz-panel");
    if (!panel) return;

    panel.querySelectorAll(".quiz-opt").forEach((item) => {
      item.classList.remove("is-selected");
    });
    option.classList.add("is-selected");
    saveState("quiz");
  });
});

function goNextStep() {
  const panel = panels[currentStep - 1];
  if (!getSelectedInPanel(panel)) {
    alert("보기를 선택해주세요.");
    return;
  }

  if (currentStep < panels.length) {
    currentStep += 1;
    showStep(currentStep);
    saveState("quiz");
  }
}

nextBtns.forEach((btn) => {
  btn.addEventListener("click", goNextStep);
});

if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const panel = panels[4];
    if (!getSelectedInPanel(panel)) {
      alert("보기를 선택해주세요.");
      return;
    }

    const answers = getAnswers();
    currentStep = panels.length;
    saveState("result");
    if (workBox) workBox.classList.remove("is-hidden");
    quizBox.classList.add("is-hidden");
    loadingBox.classList.remove("is-hidden");

    setTimeout(() => {
      showResultScreen(answers);
      loadingBox.classList.add("is-hidden");
      resultBox.classList.remove("is-hidden");
    }, 1500);
  });
}

if (retryBtn) {
  retryBtn.addEventListener("click", () => {
    showLanding();
    resetQuiz();
    clearState();
  });
}

restoreState();
