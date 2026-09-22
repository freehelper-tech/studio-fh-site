/* ============================================================
   studio.fh — páginas de case (/case-fh/*)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- nav: scroll state + mobile ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (burger) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll(".nav__links a, .nav__actions a").forEach((a) =>
      a.addEventListener("click", () => nav.classList.remove("open"))
    );
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- índice lateral: destaca a seção visível ---------- */
  const links = Array.from(document.querySelectorAll(".toc a[href^='#']"));
  const targets = links
    .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
    .filter(Boolean);
  if (targets.length) {
    const setActive = (id) =>
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id));
    const spy = new IntersectionObserver(
      (entries) => {
        // pega a seção mais alta que está dentro da faixa de leitura
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    targets.forEach((t) => spy.observe(t));
    setActive(targets[0].id);
  }

  /* ---------- copiar link ---------- */
  const copy = document.getElementById("copyLink");
  if (copy) {
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(location.href.split("#")[0]);
        copy.classList.add("is-done");
        setTimeout(() => copy.classList.remove("is-done"), 1600);
      } catch (_) {
        prompt("Copie o link:", location.href);
      }
    });
  }
})();
