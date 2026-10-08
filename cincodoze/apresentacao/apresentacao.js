/* ============================================================
   studio.fh — Apresentação interativa da Campanha 5.12 (reunião, show and tell)
   - setas / espaço / clique navegam; F = tela cheia
   - o nome da empresa (capa) personaliza os slides  (?empresa=Acme também funciona)
   - Mapa de Propósito ao vivo (mapa.js) escolhe o formato; dá pra trocar à mão
   - preço só aparece com o token do painel (localStorage "c512_token")
   ============================================================ */
(function () {
  "use strict";

  var M = window.MapaProposito;
  var API_HOST = "https://studio-fh-site.vercel.app";
  var sameOrigin = /localhost|127\.0\.0\.1|\.vercel\.app$/.test(location.hostname);
  var API = (sameOrigin ? "" : API_HOST) + "/api/cincodoze-painel";
  var CHAVE = { T: "talk", E: "embaixadores", L: "hub" };
  var LETRAS = ["A", "B", "C", "D", "E"];

  /* conteúdo de cada formato (o que o cliente vê; preços ficam na API) */
  var F = {
    talk: {
      nome: "Talk de Impacto", nivel: "Despertar", prep: 7, quando: "60–90 min · presencial ou online · todo o time",
      etapas: ["Briefing de 30 min com vocês", "Talk personalizado com dados do setor", "Enquete ao vivo por QR code", "Pesquisa pós-talk: quem quer se engajar e em quais causas", "Resumo executivo com o mapa de interesse do time"],
      agenda: [["0:00", "Abertura com um dado que incomoda"], ["0:10", "Por que propósito move resultado"], ["0:30", "Histórias reais: ONG parceira e cases"], ["0:50", "Enquete ao vivo: qual causa move o time?"], ["1:05", "Como começar amanhã + convite para os próximos passos"]],
      entregas: [["Time inspirado", "a conversa sobre propósito começa com todo mundo"], ["Mapa de interesse", "quem quer se engajar e em quais causas"], ["Lista de futuros embaixadores", "quem levantou a mão para puxar o movimento"], ["Resumo executivo", "recomendação de próximos passos para 2027"]],
      gatilhos: [["preparação", "1 semana"], ["público", "ilimitado"], ["do lado de vocês", "espaço ou link + divulgação"]],
    },
    embaixadores: {
      nome: "Jornada de Embaixadores", nivel: "Mobilizar", prep: 14, quando: "meio período · presencial · até 40 embaixadores",
      etapas: ["Pesquisa rápida de causas com todo o time", "Convocação e seleção dos embaixadores", "Workshop de co-criação (4h)", "Carta de Propósito + plano de causas 2027", "Kit do embaixador e relatório final"],
      agenda: [["0:00", "Abertura: propósito e negócio"], ["0:20", "“Minha causa”: dinâmica em duplas"], ["0:50", "Mapa coletivo de causas"], ["1:30", "Priorização: impacto × negócio × energia"], ["2:15", "Squads desenham as ações de 2027"], ["3:15", "Compromissos públicos e Carta de Propósito"]],
      entregas: [["Causas da empresa definidas", "co-criadas com quem está na linha de frente"], ["Rede de embaixadores", "até 40 pessoas com papel claro"], ["Carta de Propósito", "1 página para comunicar dentro e fora"], ["Plano de causas 2027", "primeiras ações já desenhadas"], ["Kit do embaixador", "materiais para mobilizar o time"]],
      gatilhos: [["preparação", "2 semanas"], ["participantes", "até 40"], ["do lado de vocês", "ponto focal + espaço"]],
    },
    hub: {
      nome: "Hub de Impacto", nivel: "Transformar", prep: 21, quando: "1 dia · presencial · até 60 colaboradores em squads",
      etapas: ["Curadoria das ONGs alinhadas às causas de vocês", "Seleção dos desafios reais que o time vai resolver", "Design conjunto da sessão com o RH", "O dia do Hub: squads, mentoria e pitch", "Relatório final de impacto, pronto para o ESG"],
      agenda: [["9:00", "Abertura: a causa e as regras do jogo"], ["9:30", "ONGs apresentam seus desafios ao vivo"], ["10:00", "Squads mistos mergulham no problema"], ["11:00", "Mão na massa com mentoria"], ["14:00", "Refino e preparação do pitch"], ["15:00", "Pitch das soluções para as ONGs"], ["15:45", "Celebração e compromisso"]],
      entregas: [["Soluções reais entregues", "3 a 5 ONGs com desafios resolvidos pelo time"], ["Soft skills na prática", "colaboração, comunicação e liderança sob pressão real"], ["Silos quebrados", "squads com gente de áreas diferentes"], ["Relatório de impacto", "horas, organizações, ODS e depoimentos para o ESG"], ["Uma história para contar", "conteúdo para comunicação interna e externa"]],
      gatilhos: [["preparação", "3 semanas"], ["participantes", "até 60"], ["do lado de vocês", "ponto focal + espaço"]],
    },
  };

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.from((el || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var st = { slide: 0, empresa: "", respostas: {}, q: 0, formato: "hub", resultado: null, precos: null };

  /* ---------- empresa ---------- */
  function setEmpresa(v) {
    st.empresa = v.trim();
    var e = st.empresa;
    $$("[data-empresa-tag]").forEach(function (el) { el.textContent = e ? "· " + e : ""; });
    $$("[data-empresa-de],[data-empresa-para]").forEach(function (el) { el.textContent = e ? " · " + e : ""; });
  }
  var inEmp = $("#empresa");
  var qEmp = new URLSearchParams(location.search).get("empresa");
  if (qEmp) { inEmp.value = qEmp; setEmpresa(qEmp); }
  inEmp.addEventListener("input", function () { setEmpresa(inEmp.value); });

  /* ---------- navegação ---------- */
  var slides = $$(".ap-slide");
  $("#dots").innerHTML = slides.map(function (s, i) { return '<button data-go="' + i + '" title="' + esc(s.dataset.title) + '"></button>'; }).join("");
  function ir(i) {
    st.slide = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach(function (s, k) {
      s.classList.toggle("is-on", k === st.slide);
      s.classList.toggle("is-past", k < st.slide);
    });
    document.body.classList.toggle("on-light", slides[st.slide].classList.contains("ap-slide--light"));
    $$("#dots button").forEach(function (b, k) { b.classList.toggle("is-on", k === st.slide); });
    $("#counter").textContent = st.slide + 1 + " / " + slides.length + " · " + slides[st.slide].dataset.title;
    try { history.replaceState(null, "", "#" + (st.slide + 1)); } catch (e) {}
  }
  $("#prev").addEventListener("click", function () { ir(st.slide - 1); });
  $("#next").addEventListener("click", function () { ir(st.slide + 1); });
  $("#dots").addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) ir(+b.dataset.go); });
  $("#full").addEventListener("click", tela);
  function tela() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();
  }
  document.addEventListener("keydown", function (e) {
    if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { if (e.key === "Enter") document.activeElement.blur(); return; }
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); ir(st.slide + 1); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); ir(st.slide - 1); }
    if (e.key === "f" || e.key === "F") tela();
    // no Mapa, teclas A–E respondem
    if (slides[st.slide].classList.contains("ap-slide--mapa")) {
      var k = LETRAS.indexOf(e.key.toUpperCase());
      var b = $$("#mapaQ .ap-opt")[k];
      if (b) b.click();
    }
  });

  /* ---------- Mapa ao vivo ---------- */
  function renderMapa() {
    renderPergunta();
    renderBarras();
  }
  function renderPergunta() {
    var total = M.PERGUNTAS.length;
    if (st.q >= total) {
      $("#mapaQ").innerHTML = '<div class="ap-mapa__done"><span class="ap-kicker ap-kicker--lime">mapa completo</span><h2>Pronto. O formato ideal já apareceu.</h2>' +
        '<div class="ap-row ap-row--start"><button class="btn btn--lime btn--lg" data-acao="ver">Ver o resultado →</button><button class="btn btn--ghost" data-acao="refazer">Refazer</button></div></div>';
    } else {
      var p = M.PERGUNTAS[st.q];
      $("#mapaQ").innerHTML = '<span class="ap-kicker ap-kicker--lime">pergunta ' + (st.q + 1) + " de " + total + "</span><h2>" + esc(p.titulo) + "</h2>" +
        '<div class="ap-opts">' + p.opcoes.map(function (o, k) {
          return '<button class="ap-opt' + (st.respostas[p.id] === o.id ? " is-on" : "") + '" data-op="' + o.id + '"><i>' + LETRAS[k] + "</i>" + esc(o.txt) + "</button>";
        }).join("") + "</div>" +
        (st.q > 0 ? '<button class="ap-back" data-acao="voltar">← pergunta anterior</button>' : "");
    }
  }
  function renderBarras() {
    var r = M.calcular(st.respostas);
    var max = Math.max(r.pontos.T, r.pontos.E, r.pontos.L, 1);
    var algum = Object.keys(st.respostas).length > 0;
    $("#mapaBars").innerHTML = [["L", "Hub de Impacto", "Transformar"], ["E", "Jornada de Embaixadores", "Mobilizar"], ["T", "Talk de Impacto", "Despertar"]].map(function (b) {
      var top = algum && b[0] === r.chave;
      return '<div class="ap-live' + (top ? " is-top" : "") + '"><div class="ap-live__row"><b>' + b[1] + "</b><small>" + b[2] + "</small></div><i><em style=\"width:" + (r.pontos[b[0]] / max) * 100 + '%"></em></i></div>';
    }).join("");
    $("#mapaDots").innerHTML = M.PERGUNTAS.map(function (p, k) {
      return '<li class="' + (st.respostas[p.id] ? "is-done" : "") + (k === st.q ? " is-on" : "") + '"></li>';
    }).join("");
  }
  $("#mapaQ").addEventListener("click", function (e) {
    var op = e.target.closest("[data-op]");
    var ac = e.target.closest("[data-acao]");
    if (op) {
      st.respostas[M.PERGUNTAS[st.q].id] = op.dataset.op;
      $$(".ap-opt", $("#mapaQ")).forEach(function (b) { b.classList.toggle("is-on", b === op); });
      renderBarras();
      setTimeout(function () {
        st.q++;
        if (st.q >= M.PERGUNTAS.length) {
          st.resultado = M.calcular(st.respostas);
          setFormato(CHAVE[st.resultado.chave]);
        }
        renderMapa();
      }, 380);
    } else if (ac) {
      if (ac.dataset.acao === "voltar") { st.q = Math.max(0, st.q - 1); renderMapa(); }
      if (ac.dataset.acao === "refazer") { st.q = 0; st.respostas = {}; st.resultado = null; renderMapa(); renderResultado(); }
      if (ac.dataset.acao === "ver") ir(st.slide + 1);
    }
  });
  /* ---------- resultado ---------- */
  function renderResultado() {
    var el = $("#resultado");
    var f = F[st.formato];
    var r = st.resultado;
    var fm = M.FORMATOS[{ talk: "T", embaixadores: "E", hub: "L" }[st.formato]];
    el.innerHTML = '<div class="ap-res">' +
      '<div class="ap-res__main"><span class="ap-res__level">estágio: ' + esc(f.nivel) + "</span><h1>" + esc(f.nome) + "</h1>" +
      '<p class="ap-lead">' + esc(fm.porque) + "</p>" +
      (r && r.motivos.length ? '<ul class="ap-res__why">' + r.motivos.slice(0, 3).map(function (m) { return "<li>" + esc(m.charAt(0).toUpperCase() + m.slice(1)) + "</li>"; }).join("") + "</ul>" : "") +
      (!r ? '<p class="ap-hint">Sem Mapa respondido: formato escolhido manualmente.</p>' : "") +
      "</div>" +
      '<div class="ap-res__side"><div class="ap-switch ap-switch--dark" data-switch></div>' +
      '<div class="ap-facts">' + f.gatilhos.map(function (g) { return "<div><small>" + g[0] + "</small><b>" + g[1] + "</b></div>"; }).join("") + "</div></div>" +
      "</div>";
    renderSwitches();
  }

  /* ---------- troca manual de formato ---------- */
  function renderSwitches() {
    $$("[data-switch]").forEach(function (el) {
      el.innerHTML = Object.keys(F).map(function (k) {
        return '<button data-f="' + k + '" class="' + (k === st.formato ? "is-on" : "") + '">' + F[k].nome.replace(" de Impacto", "").replace("Jornada de ", "") + "</button>";
      }).join("");
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-switch] [data-f]");
    if (b) setFormato(b.dataset.f);
  });
  function setFormato(k) {
    st.formato = k;
    renderResultado();
    renderDia();
    renderEntregas();
    renderTimeline();
    renderInvestimento();
    renderSwitches();
  }

  /* ---------- como seria o dia ---------- */
  function renderDia() {
    var f = F[st.formato];
    $("#dia").innerHTML = '<p class="ap-sub">' + esc(f.quando) + "</p>" +
      '<div class="ap-day"><div><h4>Etapas</h4><ol class="ap-steps">' + f.etapas.map(function (e) { return "<li>" + esc(e) + "</li>"; }).join("") + "</ol></div>" +
      '<div><h4>' + (st.formato === "hub" ? "Agenda do dia" : st.formato === "talk" ? "Roteiro do talk" : "Roteiro do workshop") + '</h4><ul class="ap-agenda">' +
      f.agenda.map(function (a) { return "<li><b>" + a[0] + "</b><span>" + esc(a[1]) + "</span></li>"; }).join("") + "</ul></div></div>";
  }
  function renderEntregas() {
    var f = F[st.formato];
    $("#entregas").innerHTML = '<div class="ap-gets">' + f.entregas.map(function (e, i) {
      return '<div class="ap-get"><span>0' + (i + 1) + "</span><b>" + esc(e[0]) + "</b><small>" + esc(e[1]) + "</small></div>";
    }).join("") + '<div class="ap-get ap-get--lime"><span>+</span><b>Operação completa</b><small>curadoria, facilitação, materiais e comunicação interna: o time de vocês só precisa aparecer</small></div></div>';
  }

  /* ---------- linha do tempo ---------- */
  var FECHAMENTO = new Date("2026-11-17T12:00:00-03:00");
  function addDias(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  // marcos caem em dia útil: pula fim de semana e feriados nacionais (sentido +1 ou -1)
  var FERIADOS = ["2026-11-02", "2026-11-15", "2026-11-20", "2026-12-25"];
  function util(d, sentido) {
    var x = new Date(d);
    while (x.getDay() === 0 || x.getDay() === 6 || FERIADOS.indexOf(x.toISOString().slice(0, 10)) >= 0) x = addDias(x, sentido || 1);
    return x;
  }
  function fmt(d) { return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " · " + d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""); }
  function renderTimeline() {
    var f = F[st.formato];
    var v = $("#dataEvento").value || "2026-12-04";
    var dia = new Date(v + "T12:00:00-03:00");
    var hoje = new Date(); hoje.setHours(12, 0, 0, 0);
    var limite = addDias(dia, -f.prep);
    if (limite > FECHAMENTO) limite = FECHAMENTO;
    limite = util(limite, -1);
    var apertado = limite < hoje;
    var marcos = [
      [limite, "Assinatura", "último dia para garantir esta data" + (limite.getTime() === FECHAMENTO.getTime() ? " (fechamento da agenda)" : "")],
      [util(addDias(limite, 2)), "Kick-off", "alinhamento com o ponto focal de vocês"],
    ];
    if (st.formato === "hub") marcos.push([util(addDias(dia, -14), -1), "Curadoria pronta", "ONGs e desafios validados"], [util(addDias(dia, -7), -1), "Comunicação interna", "convites e formação dos squads"]);
    if (st.formato === "embaixadores") marcos.push([util(addDias(dia, -10), -1), "Pesquisa de causas", "time inteiro responde em 5 min"], [util(addDias(dia, -5), -1), "Embaixadores convocados", "lista fechada"]);
    if (st.formato === "talk") marcos.push([util(addDias(dia, -5), -1), "Briefing", "30 min para personalizar o talk"]);
    marcos.push([dia, "O dia", f.nome], [util(addDias(dia, 15)), "Relatório", "resultados e indicadores"]);
    marcos.sort(function (a, b) { return a[0] - b[0]; });
    var fds = dia.getDay() === 0 || dia.getDay() === 6;
    $("#timeline").innerHTML = '<ol class="ap-tl">' + marcos.map(function (m) {
      var d = m[1] === "O dia";
      return '<li class="' + (d ? "is-d" : "") + (m[0] < hoje ? " is-late" : "") + '"><small>' + fmt(m[0]) + "</small><b>" + esc(m[1]) + "</b><span>" + esc(m[2]) + "</span></li>";
    }).join("") + "</ol>" +
      (apertado ? '<p class="ap-alert">Prazo apertado: para esta data o ideal era ter fechado até ' + fmt(limite) + ". Vale escolher uma data mais à frente ou um formato mais leve.</p>"
        : '<p class="ap-ok">Dá tempo. Fechando até <b>' + fmt(limite) + "</b>, a data está garantida." + (fds ? " Atenção: a data escolhida cai no fim de semana." : "") + "</p>");
  }
  $("#dataEvento").addEventListener("change", renderTimeline);

  /* ---------- investimento ---------- */
  function renderInvestimento() {
    var el = $("#investimento");
    if (!st.precos) {
      el.innerHTML = "<h2>Escopo fechado.<br /><span class=\"muted\">Sem surpresa.</span></h2><p class=\"ap-lead\">Escopo fechado, sem surpresa. Os valores são apresentados pelo nosso time nesta conversa.</p>" + bonus();
      return;
    }
    el.innerHTML = "<h2>Escopo fechado.<br /><span class=\"muted\">Sem surpresa.</span></h2>" +
      '<div class="ap-prices">' + ["talk", "embaixadores", "hub"].map(function (k) {
        var p = st.precos[k];
        return '<div class="ap-price' + (k === st.formato ? " is-on" : "") + '">' + (k === st.formato ? "<em>indicado para vocês</em>" : "") +
          "<small>" + esc(F[k].nivel) + "</small><b>" + esc(p.nome) + "</b><strong>" + esc(p.texto) + "</strong><span>" + esc(F[k].quando) + "</span></div>";
      }).join("") + "</div>" + bonus() +
      '<p class="ap-sub ap-sub--light">NF na assinatura · investimento dentro do orçamento de 2026 · combos sob consulta</p>';
  }
  function bonus() {
    var ate = new Date("2026-11-05T23:59:00-03:00");
    if (new Date() > ate) return "";
    return '<div class="ap-bonus"><b>Bônus fechando até 05/11</b><span>Kit de comunicação interna pronto (convite, lembretes e pós-evento) + prioridade na escolha da data.</span></div>';
  }
  function carregarPrecos() {
    var t;
    try { t = localStorage.getItem("c512_token"); } catch (e) {}
    if (!t) return;
    fetch(API + "?acao=manual", { headers: { Authorization: "Bearer " + t } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && d.precos) { st.precos = d.precos; renderInvestimento(); } })
      .catch(function () {});
  }

  /* ---------- start ---------- */
  renderMapa();
  setFormato("hub");
  carregarPrecos();
  var h = parseInt(location.hash.slice(1), 10);
  ir(h > 0 ? h - 1 : 0);
})();
