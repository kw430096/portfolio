/* jshint esversion: 11, browser: true, laxbreak: true */
(function () {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("header.top .menu");
  const header = document.querySelector("header.top");
  if (!toggle || !menu || !menu.children.length) return;

  const openLabel = "메뉴 열기";
  const closeLabel = "메뉴 닫기";
  const desktopQuery = window.matchMedia("(min-width: 1440px)");

  function syncHeaderHeight() {
    if (!header) return;
    document.documentElement.style.setProperty(
      "--header-h",
      `${header.getBoundingClientRect().height}px`
    );
  }

  syncHeaderHeight();
  window.addEventListener("load", syncHeaderHeight);

  function setOpen(isOpen) {
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute("aria-label", isOpen ? closeLabel : openLabel);
    toggle.classList.toggle("is-open", isOpen);
    menu.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("has-nav-open", isOpen);
    menu.inert = desktopQuery.matches ? false : !isOpen;
  }

  setOpen(false);

  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    setOpen(!menu.classList.contains("is-open"));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (event) => {
    if (!menu.classList.contains("is-open")) return;
    if (toggle.contains(event.target) || menu.contains(event.target)) return;
    setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  window.addEventListener("resize", () => {
    syncHeaderHeight();
    if (desktopQuery.matches) {
      setOpen(false);
    }
  });
})();
