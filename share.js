/* jshint esversion: 11, browser: true, laxbreak: true */
(function () {
  var buttons = document.querySelectorAll(".main-footer-share, .menu-share");
  if (!buttons.length) return;

  var toastTimer = null;

  // http(s) + 보안 컨텍스트에서만 브라우저 네이티브 API 사용 (file:// 등에서는 크래시 방지)
  var canUseNativeApis =
    window.isSecureContext === true && location.protocol !== "file:";

  function showToast(message) {
    var toast = document.querySelector(".share-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "share-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = message;

    // 리플로우를 강제해 트랜지션이 동작하도록
    void toast.offsetWidth;
    toast.classList.add("is-visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2000);
  }

  // 구형·비보안(file://) 환경용 폴백
  function legacyCopy(text) {
    var ok = false;
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ok = document.execCommand("copy");
      ta.remove();
    } catch (e) {
      ok = false;
    }
    showToast(ok ? "링크가 복사되었어요" : "주소창의 링크를 복사해 주세요");
  }

  function copyLink() {
    var url = location.href;
    try {
      if (
        canUseNativeApis &&
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function"
      ) {
        navigator.clipboard.writeText(url).then(
          function () {
            showToast("링크가 복사되었어요");
          },
          function () {
            legacyCopy(url);
          }
        );
        return;
      }
    } catch (e) {
      /* 아래 폴백으로 진행 */
    }
    legacyCopy(url);
  }

  function onShareClick() {
    var data = {
      title: document.title || "TRIPICK",
      text: "TRIPICK — Your Trip, Our Pick",
      url: location.href,
    };

    // 모바일·지원 브라우저: OS 기본 공유창 (카카오톡/문자/기타 앱)
    try {
      var shareOk =
        canUseNativeApis &&
        typeof navigator.share === "function" &&
        (typeof navigator.canShare !== "function" || navigator.canShare(data));

      if (shareOk) {
        var result = navigator.share(data);
        if (result && typeof result.catch === "function") {
          result.catch(function (err) {
            // 사용자가 공유창을 닫으면 AbortError → 무시
            if (err && err.name === "AbortError") return;
            copyLink();
          });
        }
        return;
      }
    } catch (e) {
      /* 아래 링크 복사로 진행 */
    }

    // PC 등 미지원 환경: 링크 복사로 대체
    copyLink();
  }

  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", onShareClick);
  }
})();
