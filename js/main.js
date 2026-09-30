/* ==========================================================
   Aberno Group — sayt skriptlari
   ========================================================== */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  /* ---------- Tema (yorug' / qorong'i) ---------- */
  // Boshlang'ich tema <head> ichidagi skriptda o'rnatiladi (sahifa "miltillamasligi" uchun).
  var root = document.documentElement;
  var themeBtn = document.querySelector(".theme-toggle");
  var darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function storedTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeBtn) {
      var dark = theme === "dark";
      themeBtn.setAttribute("aria-pressed", String(dark));
      themeBtn.setAttribute("aria-label", dark ? "Yorugʻ rejimga oʻtish" : "Qorongʻi rejimga oʻtish");
      themeBtn.title = dark ? "Yorugʻ rejim" : "Qorongʻi rejim";
    }
  }

  applyTheme(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  // Foydalanuvchi o'zi tanlamagan bo'lsa, tizim sozlamasiga ergashadi
  if (darkQuery) {
    var onSystemChange = function (e) {
      if (!storedTheme()) applyTheme(e.matches ? "dark" : "light");
    };
    if (darkQuery.addEventListener) darkQuery.addEventListener("change", onSystemChange);
    else if (darkQuery.addListener) darkQuery.addListener(onSystemChange);
  }

  /* ---------- Mobil menyu ---------- */
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");

  function setMenu(open) {
    if (!burger || !nav) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Menyuni yopish" : "Menyuni ochish");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  }

  if (burger && nav) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) setMenu(false);
    });
  }

  /* ---------- Faol menyu bandi ---------- */
  var page = location.pathname.split("/").pop() || "index.html";
  var brandPages = ["margaritto.html", "smaylo.html", "bulut.html"];
  document.querySelectorAll(".nav__link").forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === page || (href === "products.html" && brandPages.indexOf(page) !== -1)) {
      link.setAttribute("aria-current", "page");
    }
  });

  /* ---------- Header soyasi va "yuqoriga" tugmasi ---------- */
  var header = document.querySelector(".header");
  var toTop = document.querySelector(".to-top");

  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Paydo bo'lish animatsiyasi ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Raqamlar hisoblagichi ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var start = parseInt(el.getAttribute("data-from") || "0", 10);
    var duration = 1400;
    var t0 = null;
    function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && "IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---------- Mahsulotlar filtri ---------- */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var items = document.querySelectorAll(".catalog .product");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      items.forEach(function (item) {
        var cats = (item.getAttribute("data-cat") || "").split(" ");
        item.classList.toggle("is-hidden", f !== "all" && cats.indexOf(f) === -1);
      });
    });
  });

  /* ---------- Formalar ---------- */
  var phoneRe = /^\+?[\d\s\-()]{9,}$/;
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(field) {
    var input = field.querySelector("input, select, textarea");
    if (!input) return true;
    var val = input.value.trim();
    var ok = true;
    if (input.required && !val) ok = false;
    else if (val && input.type === "tel" && !phoneRe.test(val)) ok = false;
    else if (val && input.type === "email" && !emailRe.test(val)) ok = false;
    field.classList.toggle("has-error", !ok);
    input.setAttribute("aria-invalid", String(!ok));
    return ok;
  }

  document.querySelectorAll("form.form").forEach(function (form) {
    var fields = form.querySelectorAll(".field");

    fields.forEach(function (field) {
      var input = field.querySelector("input, select, textarea");
      if (!input) return;
      input.addEventListener("blur", function () { validateField(field); });
      input.addEventListener("input", function () {
        if (field.classList.contains("has-error")) validateField(field);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var firstBad = null;
      fields.forEach(function (field) {
        if (!validateField(field)) {
          valid = false;
          if (!firstBad) firstBad = field.querySelector("input, select, textarea");
        }
      });
      if (!valid) {
        if (firstBad) firstBad.focus();
        return;
      }
      // Backend ulanmagan: bu yerda so'rovni serverga yuborish kodi qo'shiladi.
      form.classList.add("is-sent");
      var ok = form.querySelector(".form__success");
      if (ok) {
        ok.setAttribute("tabindex", "-1");
        ok.focus();
      }
    });
  });

  /* ---------- Joriy yil ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
