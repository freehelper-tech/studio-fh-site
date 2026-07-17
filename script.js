/* ============================================================
   studio.fh — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- nav: scroll state + mobile ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll(".nav__links a, .nav__actions a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("open"))
  );

  /* ---------- solutions tabs ---------- */
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".panel");
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      const i = tab.dataset.tab;
      tabs.forEach((t) => t.classList.remove("is-active"));
      panels.forEach((p) => p.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.querySelector(`.panel[data-panel="${i}"]`).classList.add("is-active");
    })
  );
  // deep-link: ?tab=N abre uma frente específica
  const tabParam = new URLSearchParams(location.search).get("tab");
  if (tabParam && tabs[tabParam]) tabs[tabParam].click();

  /* ---------- cases carousel ---------- */
  const track = document.getElementById("caseTrack");
  const step = () => {
    const card = track.querySelector(".case");
    return card ? card.getBoundingClientRect().width + 22 : 360;
  };
  document.getElementById("caseNext").addEventListener("click", () =>
    track.scrollBy({ left: step(), behavior: "smooth" })
  );
  document.getElementById("casePrev").addEventListener("click", () =>
    track.scrollBy({ left: -step(), behavior: "smooth" })
  );

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
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- engine: draw wires + sequential glow ---------- */
  const svg = document.querySelector(".engine__wires");
  if (svg) {
    const W = 400, H = 520, cx = W / 2, cy = H / 2;
    const left = svg.querySelector(".wires-left");
    const right = svg.querySelector(".wires-right");
    const mk = (d, group) => {
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", d);
      group.appendChild(p);
    };
    // 4 method nodes on the left edge
    [0.16, 0.38, 0.62, 0.84].forEach((t) => {
      const y = H * t;
      mk(`M0 ${y} C ${cx * 0.7} ${y}, ${cx * 0.6} ${cy}, ${cx} ${cy}`, left);
    });
    // 6 area nodes on the right edge
    [0.1, 0.26, 0.42, 0.58, 0.74, 0.9].forEach((t) => {
      const y = H * t;
      mk(`M${W} ${y} C ${cx + cx * 0.4} ${y}, ${cx + cx * 0.4} ${cy}, ${cx} ${cy}`, right);
    });
  }

  // sequential highlight of the method nodes
  const enodes = document.querySelectorAll(".enode");
  if (enodes.length) {
    let k = 0;
    setInterval(() => {
      enodes.forEach((n) => n.classList.remove("lit"));
      enodes[k % enodes.length].classList.add("lit");
      k++;
    }, 1400);
  }
})();
