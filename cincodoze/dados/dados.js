/* /cincodoze/dados/ — calculadora de custo de reposição + eventos */
(function () {
  "use strict";
  function push(evt) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(evt);
    try { if (window.clarity) window.clarity("event", evt.event); } catch (e) {}
  }
  push({ event: "cincodoze_dados_view" });

  var brl = function (v) {
    if (v >= 1e6) return "R$ " + (v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mi";
    if (v >= 1e3) return "R$ " + Math.round(v / 1e3).toLocaleString("pt-BR") + " mil";
    return "R$ " + Math.round(v).toLocaleString("pt-BR");
  };
  var form = document.getElementById("calc");
  var mexeu = false;
  function calcular() {
    var colab = Math.max(0, +form.colab.value || 0);
    var salario = Math.max(0, +form.salario.value || 0);
    var turnover = Math.min(100, Math.max(0, +form.turnover.value || 0)) / 100;
    var anual = salario * 13.33;                   // 13 salários + 1/3 de férias
    var saidas = Math.round(colab * turnover);
    var min = saidas * anual * 0.5, max = saidas * anual * 2;   // Gallup: ½ a 2× o salário anual
    document.getElementById("rSaidas").textContent = saidas.toLocaleString("pt-BR");
    document.getElementById("rUnit").textContent = brl(anual * 0.5) + " a " + brl(anual * 2);
    document.getElementById("rTotal").textContent = saidas ? brl(min) + " a " + brl(max) : "R$ 0";
    document.getElementById("rDetalhe").textContent = saidas
      ? "só para repor as " + saidas + " pessoas que devem sair nos próximos 12 meses."
      : "Ajuste os números para a realidade da sua empresa.";
  }
  form.addEventListener("input", function () {
    calcular();
    if (!mexeu) { mexeu = true; push({ event: "cincodoze_dados_calc" }); }
  });
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  calcular();

  document.querySelectorAll("[data-cta]").forEach(function (a) {
    a.addEventListener("click", function () { push({ event: "cincodoze_dados_cta", cta: a.dataset.cta }); });
  });
})();
