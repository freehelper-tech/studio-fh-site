/* /cincodoze/dados/ — eventos da página */
(function () {
  "use strict";
  function push(evt) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(evt);
    try { if (window.clarity) window.clarity("event", evt.event); } catch (e) {}
  }
  push({ event: "cincodoze_dados_view" });

  document.querySelectorAll("[data-cta]").forEach(function (a) {
    a.addEventListener("click", function () { push({ event: "cincodoze_dados_cta", cta: a.dataset.cta }); });
  });
})();
