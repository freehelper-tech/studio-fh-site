/* ============================================================
   studio.fh — Painel interno da Campanha 5.12
   Token de 12h guardado no localStorage (a apresentação usa o mesmo
   token para mostrar os preços).
   ============================================================ */
(function () {
  "use strict";

  var API_HOST = "https://studio-fh-site.vercel.app";
  var sameOrigin = /localhost|127\.0\.0\.1|\.vercel\.app$/.test(location.hostname);
  var API = (sameOrigin ? "" : API_HOST) + "/api/cincodoze-painel";
  var KEY = "c512_token";
  var MONDAY = "https://freehelper-force.monday.com/boards/18409461674/pulses/";
  var NOMES = { talk: "Talk", embaixadores: "Embaixadores", hub: "Hub", combo: "Combo / ajuda", "-": "Sem Mapa" };
  var DIA = new Date("2026-12-05T09:00:00-03:00");

  var $ = function (s) { return document.querySelector(s); };
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function token() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setToken(t) { try { t ? localStorage.setItem(KEY, t) : localStorage.removeItem(KEY); } catch (e) {} }

  function get(acao) {
    return fetch(API + "?acao=" + acao, { headers: { Authorization: "Bearer " + token() } }).then(function (r) {
      if (r.status === 401) { sair(); throw new Error("sessão"); }
      return r.json();
    });
  }

  /* ---------- login ---------- */
  $("#loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("#loginErr");
    err.textContent = "";
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senha: e.target.senha.value }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d.ok) throw new Error(d.error || "Erro");
        setToken(d.token);
        entrar();
      })
      .catch(function (ex) { err.textContent = ex.message; });
  });
  function sair() { setToken(null); $("#app").hidden = true; $("#login").hidden = false; }
  $("#sair").addEventListener("click", sair);

  /* ---------- abas ---------- */
  var carregado = {};
  document.querySelectorAll("[data-tab]").forEach(function (b) {
    b.addEventListener("click", function () { abrir(b.dataset.tab); });
  });
  function abrir(tab) {
    document.querySelectorAll("[data-tab]").forEach(function (b) { b.classList.toggle("is-on", b.dataset.tab === tab); });
    document.querySelectorAll("[data-pane]").forEach(function (p) { p.classList.toggle("is-on", p.dataset.pane === tab); });
    try { history.replaceState(null, "", "#" + tab); } catch (e) {}
    if (tab === "audiencia" && !carregado.ga) carregarGa();
    if (tab === "manual" && !carregado.manual) carregarManual();
  }

  /* ---------- componentes ---------- */
  function bars(el, obj, nomes) {
    var arr = Object.keys(obj || {}).map(function (k) { return [k, obj[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
    if (!arr.length) { el.innerHTML = '<p class="pn-empty">Ainda sem dados.</p>'; return; }
    var max = arr[0][1] || 1;
    el.innerHTML = '<div class="pn-bars">' + arr.map(function (a) {
      return '<div class="pn-bar"><span title="' + esc(a[0]) + '">' + esc((nomes && nomes[a[0]]) || a[0]) + '</span><i><em style="width:' + (a[1] / max) * 100 + '%"></em></i><b>' + a[1] + "</b></div>";
    }).join("") + "</div>";
  }
  function cols(el, serie, campo) {
    if (!serie.length) { el.innerHTML = '<p class="pn-empty">Ainda sem dados.</p>'; return; }
    var max = Math.max.apply(null, serie.map(function (s) { return s[campo]; })) || 1;
    el.innerHTML = serie.map(function (s) {
      var d = s.dia.replace(/-/g, "");
      return '<div class="pn-col"><i style="height:' + Math.max(2, (s[campo] / max) * 150) + 'px"><b>' + s[campo] + "</b></i><small>" + d.slice(6, 8) + "/" + d.slice(4, 6) + "</small></div>";
    }).join("");
  }
  function kpi(label, valor, nota, hl) {
    return '<div class="pn-kpi' + (hl ? " pn-kpi--hl" : "") + '"><small>' + label + "</small><b>" + valor + "</b>" + (nota ? "<span>" + nota + "</span>" : "") + "</div>";
  }

  /* ---------- conversão ---------- */
  function carregarDados() {
    return get("dados").then(function (d) {
      if (!d.ok) throw new Error(d.error);
      var t = d.totais;
      $("#kpis").innerHTML =
        kpi("Leads", t.total || 0, "desde o lançamento", true) +
        kpi("Hoje", t.hoje || 0) +
        kpi("Últimos 7 dias", t.semana || 0) +
        kpi("Via Mapa", t.via_mapa || 0, t.total ? Math.round((t.via_mapa / t.total) * 100) + "% dos leads" : "") +
        kpi("Fora do Monday", t.sem_monday || 0, t.sem_monday ? "conferir: falhou ao criar item" : "tudo sincronizado");
      cols($("#chartDias"), d.dias, "n");
      bars($("#chartFormato"), d.formato, NOMES);
      bars($("#chartRec"), d.recomendacao, NOMES);
      bars($("#chartColab"), d.colaboradores);
      bars($("#chartOrigem"), d.origem);
      $("#tabela").innerHTML = "<thead><tr><th>Quando</th><th>Empresa</th><th>Pessoa</th><th>Colab.</th><th>Escolheu</th><th>Mapa indicou</th><th>Origem</th><th>Monday</th></tr></thead><tbody>" +
        (d.leads.length ? d.leads.map(function (l) {
          return "<tr><td>" + esc(l.quando) + "</td><td><b>" + esc(l.empresa) + "</b></td><td>" + esc(l.nome) + "<small>" + esc(l.cargo) + "</small></td><td>" + esc(l.colaboradores) +
            '</td><td><span class="pn-tag pn-tag--' + esc(l.formato) + '">' + esc(NOMES[l.formato] || l.formato) + "</span></td><td>" +
            (l.recomendacao ? '<span class="pn-tag pn-tag--' + esc(l.recomendacao) + '">' + esc(NOMES[l.recomendacao]) + "</span>" : "—") +
            "</td><td>" + esc(l.utm_source || "direto") + "</td><td>" + (l.monday_id ? '<a href="' + MONDAY + esc(l.monday_id) + '" target="_blank" rel="noopener">abrir ↗</a>' : "⚠︎") + "</td></tr>";
        }).join("") : '<tr><td colspan="8" class="pn-empty">Nenhum lead ainda.</td></tr>') + "</tbody>";
    });
  }

  /* ---------- audiência (GA4) ---------- */
  function carregarGa() {
    carregado.ga = true;
    $("#gaKpis").innerHTML = '<p class="pn-empty">Carregando dados do Google Analytics…</p>';
    get("ga").then(function (g) {
      if (!g.ok) throw new Error(g.error);
      var min = Math.floor(g.duracao / 60), seg = g.duracao % 60;
      $("#gaKpis").innerHTML =
        kpi("Visualizações", g.views, "", true) + kpi("Usuários", g.usuarios) + kpi("Sessões", g.sessoes) + kpi("Tempo médio", min + "m" + String(seg).padStart(2, "0") + "s");
      cols($("#gaDias"), g.dias, "views");
      var e = g.eventos || {};
      var funil = { "1. Visitantes": g.usuarios, "2. Começaram o Mapa": e.cincodoze_mapa_inicio || 0, "3. Viram o resultado": e.cincodoze_mapa_resultado || 0, "4. Viraram lead": e.cincodoze_lead || 0 };
      var el = $("#gaFunil");
      el.innerHTML = '<div class="pn-bars">' + Object.keys(funil).map(function (k) {
        var max = g.usuarios || 1;
        return '<div class="pn-bar"><span>' + k + '</span><i><em style="width:' + Math.min(100, (funil[k] / max) * 100) + '%"></em></i><b>' + funil[k] + "</b></div>";
      }).join("") + "</div>";
      var o = {}; g.origens.forEach(function (x) { o[x.origem] = x.usuarios; }); bars($("#gaOrigens"), o);
      var dv = {}; g.devices.forEach(function (x) { dv[{ mobile: "Celular", desktop: "Computador", tablet: "Tablet" }[x.device] || x.device] = x.usuarios; }); bars($("#gaDevices"), dv);
      $("#gaNota").textContent = (g.desde > new Date().toISOString().slice(0, 10) ? "Antes do lançamento: mostrando os últimos 7 dias. " : "Desde " + g.desde.split("-").reverse().join("/") + ". ") +
        "O GA4 tem atraso de algumas horas. Eventos do funil dependem das tags cincodoze_* no GTM.";
    }).catch(function (ex) {
      carregado.ga = false;
      $("#gaKpis").innerHTML = '<p class="pn-empty">Não foi possível carregar o GA4 (' + esc(ex.message) + ").</p>";
    });
  }

  /* ---------- manual ---------- */
  function carregarManual() {
    carregado.manual = true;
    get("manual").then(function (m) {
      $("#toc").innerHTML = m.secoes.map(function (s) { return '<a href="#m-' + s.id + '">' + esc(s.titulo) + "</a>"; }).join("");
      $("#manual").innerHTML = m.secoes.map(function (s) {
        return '<section class="m-sec" id="m-' + s.id + '"><h2>' + esc(s.titulo) + "</h2>" + s.html + "</section>";
      }).join("");
      var links = Array.from(document.querySelectorAll("#toc a"));
      links.forEach(function (a) {
        a.addEventListener("click", function (ev) {
          ev.preventDefault();
          document.querySelector(a.getAttribute("href")).scrollIntoView({ behavior: "smooth" });
        });
      });
      var io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle("is-on", a.getAttribute("href") === "#" + en.target.id); });
        });
      }, { rootMargin: "-30% 0px -60% 0px" });
      document.querySelectorAll(".m-sec").forEach(function (s) { io.observe(s); });
    }).catch(function () { carregado.manual = false; });
  }

  /* ---------- start ---------- */
  var timer;
  function entrar() {
    $("#login").hidden = true;
    $("#app").hidden = false;
    var dias = Math.max(0, Math.floor((DIA - new Date()) / 864e5));
    $("#countdown").textContent = dias + " dias para o 05.12 · fechamento até 17/11";
    carregarDados().catch(function (ex) { if (ex.message !== "sessão") $("#kpis").innerHTML = '<p class="pn-empty">Erro ao carregar: ' + esc(ex.message) + "</p>"; });
    clearInterval(timer);
    timer = setInterval(function () { if (!document.hidden && token()) carregarDados().catch(function () {}); }, 60000);
    var h = location.hash.slice(1);
    abrir(["conversao", "audiencia", "manual"].indexOf(h) >= 0 ? h : "conversao");
  }
  if (token()) entrar();
})();
