/* ============================================================
   studio.fh — Campanha 5.12 (/cincodoze/)
   nav, reveal, contagem regressiva, Mapa de Propósito + captura de lead.
   Depende de mapa.js (window.MapaProposito).
   ============================================================ */
(function () {
  "use strict";

  // Mesmo esquema do cadastro.js: o site oficial é GitHub Pages (estático),
  // a função vive no projeto Vercel studio-fh-site.
  var API_HOST = "https://studio-fh-site.vercel.app";
  var sameOrigin = /localhost|127\.0\.0\.1|\.vercel\.app$/.test(location.hostname);
  var ENDPOINT = (sameOrigin ? "" : API_HOST) + "/api/cincodoze";
  var DIA = new Date("2026-12-05T09:00:00-03:00");
  var UTM_KEY = "fh_utm";

  function push(evt) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(evt);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---------- nav ---------- */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("burger");
  var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 38); };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  burger.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll(".nav__links a, .nav__actions a").forEach(function (a) {
    a.addEventListener("click", function () { nav.classList.remove("open"); });
  });

  /* ---------- reveal ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* ---------- contagem regressiva ---------- */
  function tick() {
    var ms = Math.max(0, DIA - new Date());
    var v = {
      dias: Math.floor(ms / 864e5),
      horas: Math.floor((ms % 864e5) / 36e5),
      min: Math.floor((ms % 36e5) / 6e4),
    };
    document.querySelectorAll("[data-countdown]").forEach(function (el) {
      var n = v[el.dataset.countdown];
      el.textContent = el.dataset.countdown === "dias" ? n : String(n).padStart(2, "0");
    });
  }
  tick();
  setInterval(tick, 30000);

  /* ---------- UTM ---------- */
  function readUtm() {
    var saved = {};
    try { saved = JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}"); } catch (e) {}
    var q = new URLSearchParams(location.search);
    var map = { utm_source: "source", utm_medium: "medium", utm_campaign: "campaign", utm_content: "content", utm_term: "term", gclid: "gclid" };
    var changed = false;
    Object.keys(map).forEach(function (k) {
      var val = q.get(k);
      if (val) { saved[map[k]] = val; changed = true; }
    });
    if (changed) { try { sessionStorage.setItem(UTM_KEY, JSON.stringify(saved)); } catch (e) {} }
    return saved;
  }
  var UTM = readUtm();

  function maskPhone(v) {
    var d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  /* ============================================================
     MAPA DE PROPÓSITO
     estados: intro → pergunta 0..4 → resultado (+ form) → enviado
     "pular" vai direto pro form com o formato escolhido à mão.
     ============================================================ */
  var M = window.MapaProposito;
  var box = document.getElementById("quiz");
  var state = { passo: -1, respostas: {}, resultado: null, escolha: "", iniciou: false };
  var LETRAS = ["A", "B", "C", "D", "E"];
  var NOMES = { talk: "Talk de Impacto", embaixadores: "Jornada de Embaixadores", hub: "Hub de Impacto" };

  function head(label, frac) {
    return '<div class="cad__top"><span class="cad__kicker">' + label + '</span>' +
      (frac != null ? '<span class="cad__count">' + Math.round(frac * 100) + "%</span>" : "") + "</div>" +
      '<div class="cad__bar"><i style="width:' + Math.round((frac || 0) * 100) + '%"></i></div>';
  }

  function renderIntro() {
    box.innerHTML = head("Mapa de Propósito", 0) +
      '<div class="cad__step is-active q-intro">' +
      '<h3 class="cad__title">Qual o formato ideal para o seu time?</h3>' +
      "<p>5 perguntas, resultado na hora.</p>" +
      '<button class="btn btn--lime btn--lg" data-act="start">Começar agora <span class="arr">→</span></button><br />' +
      '<button class="q-intro__skip" data-act="skip">Já sei o que quero, quero falar com o time</button>' +
      "</div>";
  }

  function renderPergunta(i) {
    var p = M.PERGUNTAS[i];
    var atual = state.respostas[p.id];
    box.innerHTML = head("Pergunta " + (i + 1) + " de " + M.PERGUNTAS.length, i / M.PERGUNTAS.length) +
      '<div class="cad__step is-active">' +
      '<h3 class="cad__title">' + esc(p.titulo) + "</h3>" +
      '<div class="q-opts" role="radiogroup">' +
      p.opcoes.map(function (o, k) {
        return '<button class="q-opt' + (atual === o.id ? " is-on" : "") + '" role="radio" aria-checked="' + (atual === o.id) + '" data-op="' + o.id + '">' +
          '<span class="q-opt__key">' + LETRAS[k] + "</span><span>" + esc(o.txt) + "</span></button>";
      }).join("") +
      "</div>" +
      '<div class="cad__nav"><button class="btn btn--ghost' + (i === 0 ? " is-hidden" : "") + '" data-act="back">← Voltar</button><span></span></div>' +
      "</div>";
  }

  function formHtml(titulo, sub) {
    var opts = ['<option value="">Selecione</option>']
      .concat(["talk", "embaixadores", "hub", "combo"].map(function (k) {
        var nome = k === "combo" ? "Quero ajuda pra escolher / combinar" : NOMES[k];
        return '<option value="' + k + '"' + (state.escolha === k ? " selected" : "") + ">" + nome + "</option>";
      }));
    return '<form class="q-form" novalidate>' +
      '<div class="q-result__cta"><h4>' + titulo + "</h4><p>" + sub + "</p></div>" +
      '<div class="cad__grid">' +
      fld("nome", "Nome e sobrenome", "text", "name") +
      fld("cargo", "Cargo", "text", "organization-title") +
      fld("empresa", "Empresa", "text", "organization") +
      '<div class="field"><label for="q-colab">Nº de colaboradores <b>*</b></label><select id="q-colab" name="colaboradores" required>' +
      '<option value="">Selecione</option><option>Até 100</option><option>101 a 500</option><option>501 a 1.000</option><option>1.001 a 5.000</option><option>Mais de 5.000</option>' +
      '</select><span class="field__err">Selecione uma faixa.</span></div>' +
      fld("email", "E-mail corporativo", "email", "email") +
      fld("telefone", "WhatsApp", "tel", "tel") +
      '<div class="field field--full"><label for="q-formato">Formato de interesse <b>*</b></label><select id="q-formato" name="formato" required>' + opts.join("") +
      '</select><span class="field__err">Escolha uma opção.</span></div>' +
      "</div>" +
      '<input class="cad__hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
      '<label class="q-lgpd"><input type="checkbox" name="lgpd" /> <span>Autorizo o studio.fh / Freehelper a usar estes dados para entrar em contato sobre a Campanha 5.12, conforme a LGPD.</span></label>' +
      '<div class="cad__error" role="alert"></div>' +
      '<div class="cad__nav"><button type="button" class="btn btn--ghost" data-act="back">← Voltar</button>' +
      '<button type="submit" class="btn btn--lime">Receber meu Mapa <span class="arr">→</span></button></div>' +
      "</form>";
  }
  function fld(name, label, type, ac) {
    return '<div class="field"><label for="q-' + name + '">' + label + ' <b>*</b></label>' +
      '<input id="q-' + name + '" name="' + name + '" type="' + type + '" autocomplete="' + ac + '"' +
      (type === "tel" ? ' inputmode="tel" placeholder="(11) 99999-9999"' : "") + " required />" +
      '<span class="field__err">' + (type === "email" ? "Informe um e-mail válido." : "Campo obrigatório.") + "</span></div>";
  }

  function renderResultado() {
    var r = state.resultado;
    var max = Math.max(r.pontos.T, r.pontos.E, r.pontos.L) || 1;
    var bars = [["L", "Hub de Impacto"], ["E", "Embaixadores"], ["T", "Talk de Impacto"]].map(function (b) {
      var pct = Math.round((r.pontos[b[0]] / max) * 100);
      return '<div class="q-bar' + (b[0] === r.chave ? " is-top" : "") + '"><span>' + b[1] + '</span><i><span style="width:' + pct + '%"></span></i><span>' + pct + "%</span></div>";
    }).join("");
    box.innerHTML = head("Seu resultado", 1) +
      '<div class="cad__step is-active q-result">' +
      '<span class="q-result__badge">estágio: ' + esc(r.formato.nivel) + "</span>" +
      '<h3 class="q-result__name">Formato indicado: ' + esc(r.formato.nome) + "</h3>" +
      '<p class="q-result__why">' + esc(r.formato.porque) + "</p>" +
      '<div class="q-result__bars">' + bars + "</div>" +
      formHtml("Receba o Mapa de Propósito completo", "Nossa equipe envia o mapa detalhado e uma proposta para dezembro em até 48h úteis.") +
      "</div>";
    bindForm();
  }

  function renderSkip() {
    box.innerHTML = head("Fale com o time 5.12", null) +
      '<div class="cad__step is-active">' +
      formHtml("Vamos montar o seu 5.12", "Deixe seus dados e retornamos em até 48h úteis com datas e proposta.") +
      "</div>";
    bindForm();
  }

  function renderDone(nome) {
    box.innerHTML = head("Tudo certo", 1) +
      '<div class="cad__step is-active q-done">' +
      '<div class="q-done__icon">✓</div>' +
      "<h3>Recebemos, " + esc(nome.split(" ")[0]) + "!</h3>" +
      "<p>Em até 48h úteis nosso time entra em contato pelo WhatsApp ou e-mail para conversar sobre o seu 5.12.</p>" +
      "</div>";
  }

  function go(passo) {
    state.passo = passo;
    if (passo === -1) renderIntro();
    else if (passo === "skip") renderSkip();
    else if (passo < M.PERGUNTAS.length) renderPergunta(passo);
    else {
      state.resultado = M.calcular(state.respostas);
      if (!state.escolha) state.escolha = state.resultado.formato.id;
      push({ event: "cincodoze_mapa_resultado", mapa_formato: state.resultado.formato.id });
      renderResultado();
    }
  }

  box.addEventListener("click", function (e) {
    var op = e.target.closest("[data-op]");
    var act = e.target.closest("[data-act]");
    if (op) {
      var p = M.PERGUNTAS[state.passo];
      state.respostas[p.id] = op.dataset.op;
      op.parentNode.querySelectorAll(".q-opt").forEach(function (b) { b.classList.toggle("is-on", b === op); });
      setTimeout(function () { go(state.passo + 1); }, 220);
      return;
    }
    if (!act) return;
    var a = act.dataset.act;
    if (a === "start") {
      if (!state.iniciou) { state.iniciou = true; push({ event: "cincodoze_mapa_inicio" }); }
      go(0);
    } else if (a === "skip") {
      push({ event: "cincodoze_contato_direto" });
      go("skip");
    } else if (a === "back") {
      if (state.passo === "skip") go(-1);
      else go(Math.max(0, (typeof state.passo === "number" ? state.passo : M.PERGUNTAS.length) - 1));
    }
  });

  // Botões "Quero o Talk/Jornada/Hub" pré-selecionam o formato no form
  document.querySelectorAll("[data-escolha]").forEach(function (b) {
    b.addEventListener("click", function () {
      state.escolha = b.dataset.escolha;
      var sel = box.querySelector("#q-formato");
      if (sel) sel.value = state.escolha;
      push({ event: "cincodoze_escolha_formato", formato: state.escolha });
    });
  });

  function bindForm() {
    var form = box.querySelector(".q-form");
    var tel = form.querySelector('[name="telefone"]');
    tel.addEventListener("input", function () { tel.value = maskPhone(tel.value); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var data = {
        nome: f.nome.value.trim(),
        cargo: f.cargo.value.trim(),
        empresa: f.empresa.value.trim(),
        colaboradores: f.colaboradores.value,
        email: f.email.value.trim().toLowerCase(),
        telefone: f.telefone.value.trim(),
        formato: f.formato.value,
        lgpd: f.lgpd.checked,
        website: f.website.value,
      };
      var ok = true;
      function check(name, cond) {
        var field = form.querySelector('[name="' + name + '"]').closest(".field");
        field.classList.toggle("is-invalid", !cond);
        if (!cond) ok = false;
      }
      check("nome", data.nome.length >= 3);
      check("cargo", data.cargo.length >= 2);
      check("empresa", data.empresa.length >= 2);
      check("colaboradores", !!data.colaboradores);
      check("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email));
      check("telefone", data.telefone.replace(/\D/g, "").length >= 10);
      check("formato", !!data.formato);
      form.querySelector(".q-lgpd").classList.toggle("is-invalid", !data.lgpd);
      if (!data.lgpd) ok = false;
      if (!ok) return;

      data.respostas = state.respostas;
      data.recomendacao = state.resultado ? state.resultado.formato.id : "";
      data.pontos = state.resultado ? state.resultado.pontos : null;
      data.origem = state.resultado ? "mapa" : "contato-direto";
      data.pagina = location.pathname;
      data.utm = UTM;

      var btn = form.querySelector('[type="submit"]');
      var err = form.querySelector(".cad__error");
      btn.disabled = true;
      btn.innerHTML = "Enviando…";
      err.classList.remove("is-on");

      fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.error || "Falha no envio");
          push({ event: "cincodoze_lead", formato: data.formato, mapa_formato: data.recomendacao, form_origem: data.origem });
          renderDone(data.nome);
        })
        .catch(function (ex) {
          btn.disabled = false;
          btn.innerHTML = 'Receber meu Mapa <span class="arr">→</span>';
          err.innerHTML = esc(ex.message && ex.message !== "Failed to fetch" ? ex.message : "Não conseguimos enviar agora.") +
            ' Se preferir, escreva para <a href="mailto:contato@freehelper.com.br">contato@freehelper.com.br</a>.';
          err.classList.add("is-on");
        });
    });
  }

  go(-1);
})();
