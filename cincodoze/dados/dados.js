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

  /* ---------- enviar para a diretoria: link (WhatsApp, e-mail, copiar) ou PDF ---------- */
  var URL_COMPARTILHAR = "https://studio.freehelper.com.br/cincodoze/dados/?utm_source=compartilhar&utm_medium=diretoria";
  var TITULO = "546 mil afastamentos por saúde mental em 2025: os números para a nossa diretoria";
  var TEXTO = "Vale a leitura (2 min): " + TITULO + "\n" + URL_COMPARTILHAR;
  var btnShare = document.getElementById("compartilhar");
  var menu = document.getElementById("shareMenu");
  menu.querySelector('[data-share="whatsapp"]').href = "https://wa.me/?text=" + encodeURIComponent(TEXTO);
  menu.querySelector('[data-share="email"]').href = "mailto:?subject=" + encodeURIComponent("546 mil afastamentos por saúde mental em 2025. E o nosso time?") +
    "&body=" + encodeURIComponent(
      "Oi,\n\n" +
      "Em 2025, o Brasil bateu recorde de afastamentos do trabalho por saúde mental: 546 mil, 15,7% a mais que em 2024. " +
      "E só 32% dos profissionais brasileiros estão engajados no trabalho.\n\n" +
      "Separei os números nesta página (2 min de leitura), com fontes como Ministério da Previdência, Gallup e Deloitte:\n" +
      URL_COMPARTILHAR + "\n\n" +
      "Acho que vale olharmos para isso antes de fechar o planejamento de 2027.");
  btnShare.addEventListener("click", function () {
    // no celular, usa o compartilhar nativo (WhatsApp, e-mail, etc. em um toque)
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      navigator.share({ title: TITULO, text: "Vale a leitura (2 min):", url: URL_COMPARTILHAR })
        .then(function () { push({ event: "cincodoze_dados_cta", cta: "share-nativo" }); })
        .catch(function () {});
      return;
    }
    menu.hidden = !menu.hidden;
    btnShare.setAttribute("aria-expanded", String(!menu.hidden));
  });
  menu.addEventListener("click", function (e) {
    var b = e.target.closest("[data-share]");
    if (!b) return;
    var tipo = b.dataset.share;
    push({ event: "cincodoze_dados_cta", cta: "share-" + tipo });
    if (tipo === "link") {
      e.preventDefault();
      var feito = function () { b.textContent = "Link copiado ✓"; setTimeout(function () { b.textContent = "Copiar link"; }, 2200); };
      if (navigator.clipboard) navigator.clipboard.writeText(URL_COMPARTILHAR).then(feito, function () { prompt("Copie o link:", URL_COMPARTILHAR); });
      else prompt("Copie o link:", URL_COMPARTILHAR);
    }
    if (tipo === "pdf") { e.preventDefault(); window.print(); }
  });

  /* ---------- linha de urgência muda com o calendário ---------- */
  var nota = document.getElementById("agendaNota");
  var agora = new Date();
  if (agora > new Date("2026-11-17T23:59:59-03:00")) nota.textContent = "";
  else if (agora > new Date("2026-11-05T23:59:59-03:00")) nota.textContent = "Agenda de dezembro limitada. Últimas datas para fechar até 17/11.";

  document.querySelectorAll("[data-cta]").forEach(function (a) {
    a.addEventListener("click", function () { push({ event: "cincodoze_dados_cta", cta: a.dataset.cta }); });
  });
})();
