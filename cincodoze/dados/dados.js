/* /cincodoze/dados/ — eventos da página */
(function () {
  "use strict";
  var sameOrigin = /localhost|127\.0\.0\.1|\.vercel\.app$/.test(location.hostname);
  var ENDPOINT = (sameOrigin ? "" : "https://studio-fh-site.vercel.app") + "/api/cincodoze";
  function push(evt) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(evt);
    try { if (window.clarity) window.clarity("event", evt.event); } catch (e) {}
    try {
      navigator.sendBeacon(ENDPOINT, new Blob([JSON.stringify({ evento: evt.event, detalhe: evt.cta || "" })], { type: "text/plain" }));
    } catch (e) {}
  }
  push({ event: "cincodoze_dados_view" });

  document.querySelectorAll("[data-cta]").forEach(function (a) {
    a.addEventListener("click", function () { push({ event: "cincodoze_dados_cta", cta: a.dataset.cta }); });
  });
})();
