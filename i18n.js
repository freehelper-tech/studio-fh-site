/* ============================================================
   studio.fh — seletor de idioma (PT | EN | ES)
   Tradução automática via Google Tradutor, com botões próprios.
   O idioma fica no cookie "googtrans" (/pt/en, /pt/es); o script
   do Google só é carregado quando o visitante escolhe EN ou ES.
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

  function current() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/[a-z-]+\/([a-z-]+)/i);
    return m && m[1] !== "pt" ? m[1] : "pt";
  }

  function setCookie(value, expires) {
    var base = "googtrans=" + value + ";path=/" + (expires ? ";expires=" + expires : "");
    document.cookie = base;
    // o Google às vezes grava no domínio-pai também; limpa/grava nos dois
    var host = location.hostname;
    if (host.indexOf(".") > -1 && !/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      document.cookie = base + ";domain=." + host;
      document.cookie = base + ";domain=." + host.split(".").slice(-3).join(".");
    }
  }

  function choose(code) {
    if (code === current()) return;
    if (code === "pt") setCookie("", "Thu, 01 Jan 1970 00:00:00 GMT");
    else setCookie("/pt/" + code);
    if (window.dataLayer) window.dataLayer.push({ event: "idioma_trocado", idioma: code });
    location.reload();
  }

  /* ---------- estilos (escondem a barra do Google) ---------- */
  var css =
    ".lang{display:inline-flex;align-items:center;gap:2px;padding:3px;border:1px solid var(--line-2,rgba(255,255,255,.16));" +
      "border-radius:999px;background:rgba(255,255,255,.04);font-size:.74rem;font-weight:600;letter-spacing:.04em}" +
    ".lang button{display:inline-flex;align-items:center;gap:6px;padding:.42em .7em;border:0;border-radius:999px;" +
      "background:transparent;color:var(--muted,rgba(231,233,255,.66));font:inherit;cursor:pointer;transition:background .2s,color .2s}" +
    ".lang button:hover{color:#fff;background:rgba(255,255,255,.07)}" +
    ".lang button[aria-pressed=true]{background:#fff;color:#0a0a2e}" +
    ".lang svg{width:16px;height:11px;border-radius:2px;flex:none;box-shadow:0 0 0 1px rgba(0,0,0,.15)}" +
    ".nav__right{display:flex;align-items:center;gap:14px}" +
    // desktop apertado: só bandeiras
    "@media (max-width:1100px) and (min-width:761px){.lang button span{display:none}.lang button{padding:.5em .55em}}" +
    "@media (max-width:760px){.nav__right{gap:6px;margin-left:auto}.lang button{padding:.42em .55em;gap:5px}}" +
    "@media (max-width:360px){.lang button span{display:none}.lang button{padding:.5em}}" +
    "body{top:0!important}" +
    "body>.skiptranslate,.goog-te-banner-frame,iframe.skiptranslate,#goog-gt-tt,.goog-te-balloon-frame," +
      ".VIpgJd-ZVi9od-ORHb-OEVmcd,.VIpgJd-ZVi9od-aZ2wEe-wOHMyf,.VIpgJd-yAWNEb-L7lbkb{display:none!important}" +
    ".goog-text-highlight,font[style]{background:none!important;box-shadow:none!important}" +
    "#google_translate_element{display:none}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- botões ---------- */
  function build() {
    var host = document.querySelector(".nav__inner");
    if (!host || host.querySelector(".lang")) return;
    var active = current();
    var wrap = document.createElement("div");
    wrap.className = "lang notranslate";
    wrap.setAttribute("translate", "no");
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Idioma / Language");
    LANGS.forEach(function (l) {
      var b = document.createElement("button");
      b.type = "button";
      b.lang = l.code;
      b.title = l.name;
      b.setAttribute("aria-label", l.name);
      b.setAttribute("aria-pressed", String(l.code === active));
      b.innerHTML = l.flag + "<span>" + l.label + "</span>";
      b.addEventListener("click", function () { choose(l.code); });
      wrap.appendChild(b);
    });
    // fica sempre visível: junto do CTA no desktop, ao lado do burger no mobile
    var right = document.createElement("div");
    right.className = "nav__right";
    var actions = host.querySelector(".nav__actions");
    host.insertBefore(right, actions || host.querySelector(".nav__burger"));
    right.appendChild(wrap);
    if (actions) right.appendChild(actions);
    // logo não deve ser "traduzido"
    var logo = host.querySelector(".nav__logo");
    if (logo) logo.classList.add("notranslate");
  }

  /* ---------- Google Tradutor (só quando EN/ES) ---------- */
  function loadGoogle() {
    var holder = document.createElement("div");
    holder.id = "google_translate_element";
    document.body.appendChild(holder);
    window.__fhTranslateInit = function () {
      new window.google.translate.TranslateElement(
        { pageLanguage: "pt", includedLanguages: "en,es", autoDisplay: false },
        "google_translate_element"
      );
    };
    var s = document.createElement("script");
    s.src = "https://translate.google.com/translate_a/element.js?cb=__fhTranslateInit";
    s.async = true;
    document.body.appendChild(s);
    document.documentElement.lang = current();
  }

  /* ---------- marca não se traduz: o Google devolve "estudio.fh", desfaz depois ---------- */
  function fixBrand() {
    var re = /\bestudio\.fh/gi;
    var fix = function (root) {
      var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (w.nextNode()) {
        var n = w.currentNode;
        if (re.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(re, "studio.fh");
        re.lastIndex = 0;
      }
      if (re.test(document.title)) document.title = document.title.replace(re, "studio.fh");
      re.lastIndex = 0;
    };
    var t;
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(function () { fix(document.body); }, 150);
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function init() {
    build();
    if (current() !== "pt") {
      fixBrand();
      loadGoogle();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
