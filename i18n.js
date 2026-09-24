/* ============================================================
   studio.fh — seletor de idioma (PT | EN | ES)
   Cada idioma tem páginas próprias com texto revisado:
   PT na raiz, EN em /en/..., ES em /es/... (geradas por tools/i18n/build.py).
   Os botões levam para a mesma página no outro idioma.
   ============================================================ */
(function () {
  "use strict";

  var LANGS = [
    { code: "pt", label: "PT", name: "Português",
      flag: '<svg viewBox="0 0 28 20"><rect width="28" height="20" fill="#009b3a"/><path d="M14 2.6 25.4 10 14 17.4 2.6 10z" fill="#fedf00"/><circle cx="14" cy="10" r="4.4" fill="#002776"/></svg>' },
    { code: "en", label: "EN", name: "English",
      flag: '<svg viewBox="0 0 28 20"><rect width="28" height="20" fill="#fff"/><path d="M0 0h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28v1.54H0zm0 3.08h28V20H0z" fill="#b22234"/><rect width="12" height="10.77" fill="#3c3b6e"/></svg>' },
    { code: "es", label: "ES", name: "Español",
      flag: '<svg viewBox="0 0 28 20"><rect width="28" height="20" fill="#aa151b"/><rect y="5" width="28" height="10" fill="#f1bf00"/></svg>' }
  ];

  var m = location.pathname.match(/^\/(en|es)(\/.*)$/);
  var current = m ? m[1] : "pt";
  var basePath = m ? m[2] : location.pathname;

  function hrefFor(code) {
    return (code === "pt" ? "" : "/" + code) + basePath + location.search + location.hash;
  }

  // limpa o cookie da versão antiga (Google Tradutor), que não é mais usado
  if (/googtrans=/.test(document.cookie)) {
    var past = "googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = past;
    var host = location.hostname;
    if (host.indexOf(".") > -1) {
      document.cookie = past + ";domain=." + host;
      document.cookie = past + ";domain=." + host.split(".").slice(-3).join(".");
    }
  }

  var css =
    ".lang{display:inline-flex;align-items:center;gap:2px;padding:3px;border:1px solid var(--line-2,rgba(255,255,255,.16));" +
      "border-radius:999px;background:rgba(255,255,255,.04);font-size:.74rem;font-weight:600;letter-spacing:.04em}" +
    ".lang a{display:inline-flex;align-items:center;gap:6px;padding:.42em .7em;border-radius:999px;" +
      "color:var(--muted,rgba(231,233,255,.66));transition:background .2s,color .2s}" +
    ".lang a:hover{color:#fff;background:rgba(255,255,255,.07)}" +
    ".lang a[aria-current=true]{background:#fff;color:#0a0a2e}" +
    ".lang svg{width:16px;height:11px;border-radius:2px;flex:none;box-shadow:0 0 0 1px rgba(0,0,0,.15)}" +
    ".nav__right{display:flex;align-items:center;gap:14px}" +
    // desktop apertado: só bandeiras
    "@media (max-width:1100px) and (min-width:761px){.lang a span{display:none}.lang a{padding:.5em .55em}}" +
    "@media (max-width:760px){.nav__right{gap:6px;margin-left:auto}.lang a{padding:.42em .55em;gap:5px}}" +
    "@media (max-width:360px){.lang a span{display:none}.lang a{padding:.5em}}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  function build() {
    var host = document.querySelector(".nav__inner");
    if (!host || host.querySelector(".lang")) return;
    var wrap = document.createElement("div");
    wrap.className = "lang";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Idioma / Language");
    LANGS.forEach(function (l) {
      var a = document.createElement("a");
      a.href = hrefFor(l.code);
      a.hreflang = l.code;
      a.lang = l.code;
      a.title = l.name;
      a.setAttribute("aria-label", l.name);
      if (l.code === current) a.setAttribute("aria-current", "true");
      a.innerHTML = l.flag + "<span>" + l.label + "</span>";
      a.addEventListener("click", function () {
        if (window.dataLayer) window.dataLayer.push({ event: "idioma_trocado", idioma: l.code, idioma_origem: current });
      });
      wrap.appendChild(a);
    });
    // fica sempre visível: junto do CTA no desktop, ao lado do burger no mobile
    var right = document.createElement("div");
    right.className = "nav__right";
    var actions = host.querySelector(".nav__actions");
    host.insertBefore(right, actions || host.querySelector(".nav__burger"));
    right.appendChild(wrap);
    if (actions) right.appendChild(actions);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
