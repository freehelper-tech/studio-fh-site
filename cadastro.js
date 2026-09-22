/* ============================================================
   studio.fh — formulário de cadastro em etapas
   Renderiza em qualquer <div class="cad" data-cadastro="<origem>"></div>,
   envia para /api/cadastro (→ Monday) e redireciona para /obrigado-empresa/.
   ============================================================ */
(function () {
  "use strict";

  // O site oficial roda no GitHub Pages (estático); a função /api/cadastro vive no
  // projeto Vercel studio-fh-site. Fora do Vercel/local, chama a URL absoluta.
  var API_HOST = "https://studio-fh-site.vercel.app";
  var sameOrigin = /localhost|127\.0\.0\.1|\.vercel\.app$/.test(location.hostname);
  var ENDPOINT = (sameOrigin ? "" : API_HOST) + "/api/cadastro";
  var THANKS = "/obrigado-empresa/";
  var UTM_KEY = "fh_utm";

  var STEPS = [
    {
      key: "voce",
      label: "Sobre você",
      title: "Quem está falando com a gente?",
      hint: "Leva menos de um minuto. Nossa equipe retorna em até 1 dia útil.",
      fields: [
        { name: "nome", label: "Nome", type: "text", autocomplete: "given-name", placeholder: "Seu nome" },
        { name: "sobrenome", label: "Sobrenome", type: "text", autocomplete: "family-name", placeholder: "Seu sobrenome" },
        { name: "cargo", label: "Cargo", type: "text", autocomplete: "organization-title", placeholder: "Ex.: Gerente de Sustentabilidade", full: true },
      ],
    },
    {
      key: "empresa",
      label: "Sua empresa",
      title: "Onde você atua?",
      hint: "Usamos o e-mail e o telefone só para retornar o contato.",
      fields: [
        { name: "empresa", label: "Empresa", type: "text", autocomplete: "organization", placeholder: "Nome da empresa", full: true },
        { name: "email", label: "E-mail corporativo", type: "email", autocomplete: "email", placeholder: "voce@empresa.com.br", inputmode: "email" },
        { name: "telefone", label: "Telefone / WhatsApp", type: "tel", autocomplete: "tel", placeholder: "(11) 99999-9999", inputmode: "tel" },
      ],
    },
    {
      key: "desafio",
      label: "Seu desafio",
      title: "Qual o principal desafio que estão enfrentando?",
      hint: "Pode ser em poucas linhas. Isso ajuda a gente a chegar na conversa já com ideias.",
      fields: [
        { name: "desafio", label: "Conte para a gente", type: "textarea", placeholder: "Ex.: queremos engajar colaboradores em voluntariado, mas a adesão é baixa…", full: true },
      ],
    },
  ];

  var RULES = {
    nome: function (v) { return v.trim().length >= 2 || "Informe seu nome."; },
    sobrenome: function (v) { return v.trim().length >= 2 || "Informe seu sobrenome."; },
    cargo: function (v) { return v.trim().length >= 2 || "Informe seu cargo."; },
    empresa: function (v) { return v.trim().length >= 2 || "Informe a empresa."; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Digite um e-mail válido."; },
    telefone: function (v) { return v.replace(/\D/g, "").length >= 10 || "Digite um telefone com DDD."; },
    desafio: function (v) { return v.trim().length >= 5 || "Conte um pouco do desafio."; },
  };

  /* ---------- UTM: guarda na sessão para não perder ao ir da home ao /cadastro ---------- */
  function readUtm() {
    var saved = {};
    try { saved = JSON.parse(sessionStorage.getItem(UTM_KEY) || "{}"); } catch (e) {}
    var q = new URLSearchParams(location.search);
    var map = { utm_source: "source", utm_medium: "medium", utm_campaign: "campaign", utm_content: "content", utm_term: "term", gclid: "gclid" };
    var changed = false;
    Object.keys(map).forEach(function (k) {
      var v = q.get(k);
      if (v) { saved[map[k]] = v; changed = true; }
    });
    if (changed) { try { sessionStorage.setItem(UTM_KEY, JSON.stringify(saved)); } catch (e) {} }
    return saved;
  }
  var UTM = readUtm();

  function push(evt) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(evt);
  }

  /* ---------- telefone: máscara leve (11) 99999-9999 ---------- */
  function maskPhone(v) {
    var d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length <= 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
  }

  /* ---------- render ---------- */
  function fieldHtml(f) {
    var id = "cad-" + f.name + "-" + Math.random().toString(36).slice(2, 7);
    var common = ' id="' + id + '" name="' + f.name + '" placeholder="' + (f.placeholder || "") + '"' +
      (f.autocomplete ? ' autocomplete="' + f.autocomplete + '"' : "") +
      (f.inputmode ? ' inputmode="' + f.inputmode + '"' : "") + ' required';
    var control = f.type === "textarea"
      ? "<textarea" + common + ' rows="4"></textarea>'
      : '<input type="' + f.type + '"' + common + " />";
    return '<div class="field' + (f.full ? " field--full" : "") + '" data-field="' + f.name + '">' +
      '<label for="' + id + '">' + f.label + " <b>*</b></label>" + control +
      '<span class="field__err"></span></div>';
  }

  function render(root) {
    var stepsHtml = STEPS.map(function (s, i) {
      return '<div class="cad__step" data-step="' + i + '">' +
        '<h3 class="cad__title">' + s.title + "</h3>" +
        (s.hint ? '<p class="cad__hint">' + s.hint + "</p>" : "") +
        '<div class="cad__grid">' + s.fields.map(fieldHtml).join("") + "</div></div>";
    }).join("");

    root.innerHTML =
      '<form novalidate>' +
        '<div class="cad__top"><span class="cad__kicker">Fale com especialistas</span>' +
        '<span class="cad__count">Etapa 1 de ' + STEPS.length + "</span></div>" +
        '<div class="cad__bar"><i></i></div>' +
        '<div class="cad__steps">' + STEPS.map(function (s) { return "<span>" + s.label + "</span>"; }).join("") + "</div>" +
        stepsHtml +
        '<input class="cad__hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
        '<div class="cad__error" role="alert"></div>' +
        '<div class="cad__nav">' +
          '<button type="button" class="btn btn--ghost cad__back">← Voltar</button>' +
          '<button type="submit" class="btn btn--lime cad__next">Próxima <span class="arr">→</span><span class="spin"></span></button>' +
        "</div>" +
        '<p class="cad__legal">Ao enviar, você concorda em receber contato da Freehelper sobre sua solicitação. Tratamos seus dados conforme a LGPD.</p>' +
      "</form>";
  }

  /* ---------- controller ---------- */
  function mount(root) {
    render(root);
    var form = root.querySelector("form");
    var origem = root.getAttribute("data-cadastro") || "site";
    var stepEls = root.querySelectorAll(".cad__step");
    var chips = root.querySelectorAll(".cad__steps span");
    var bar = root.querySelector(".cad__bar i");
    var count = root.querySelector(".cad__count");
    var back = root.querySelector(".cad__back");
    var next = root.querySelector(".cad__next");
    var errBox = root.querySelector(".cad__error");
    var step = 0;
    var started = false;

    root.querySelectorAll('input[name="telefone"]').forEach(function (inp) {
      inp.addEventListener("input", function () { inp.value = maskPhone(inp.value); });
    });

    root.querySelectorAll("input,textarea").forEach(function (inp) {
      inp.addEventListener("input", function () {
        inp.closest(".field").classList.remove("is-invalid");
        if (!started) { started = true; push({ event: "cadastro_empresa_inicio", form_origem: origem }); }
      });
    });

    function show(i, focus) {
      step = i;
      stepEls.forEach(function (el, k) { el.classList.toggle("is-active", k === i); });
      chips.forEach(function (c, k) {
        c.classList.toggle("is-active", k === i);
        c.classList.toggle("is-done", k < i);
      });
      bar.style.width = ((i + 1) / STEPS.length) * 100 + "%";
      count.textContent = "Etapa " + (i + 1) + " de " + STEPS.length;
      back.classList.toggle("is-hidden", i === 0);
      next.innerHTML = (i === STEPS.length - 1 ? "Enviar cadastro" : "Próxima") +
        ' <span class="arr">→</span><span class="spin"></span>';
      errBox.classList.remove("is-on");
      if (focus) {
        var first = stepEls[i].querySelector("input,textarea");
        if (first && window.matchMedia("(min-width: 761px)").matches) first.focus({ preventScroll: true });
      }
    }

    function validate(i) {
      var ok = true;
      stepEls[i].querySelectorAll(".field").forEach(function (f) {
        var name = f.getAttribute("data-field");
        var input = f.querySelector("input,textarea");
        var r = RULES[name] ? RULES[name](input.value) : true;
        f.classList.toggle("is-invalid", r !== true);
        if (r !== true) {
          f.querySelector(".field__err").textContent = r;
          if (ok) input.focus();
          ok = false;
        }
      });
      return ok;
    }

    function payload() {
      var data = {};
      form.querySelectorAll("input,textarea").forEach(function (el) { data[el.name] = el.value; });
      data.utm = UTM;
      data.origem = origem;
      data.pagina = location.pathname;
      return data;
    }

    function fail(msg) {
      root.classList.remove("is-sending");
      errBox.innerHTML = (msg || "Não conseguimos enviar agora.") +
        ' Se preferir, escreva para <a href="mailto:contato@freehelper.com.br">contato@freehelper.com.br</a>.';
      errBox.classList.add("is-on");
    }

    function submit() {
      root.classList.add("is-sending");
      var body = payload();
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, json: j }; }); })
        .then(function (res) {
          if (!res.json.ok) return fail(res.json.error);
          push({ event: "cadastro_empresa", form_origem: origem, empresa: body.empresa });
          try { sessionStorage.setItem("fh_cadastro_ok", "1"); } catch (e) {}
          location.href = THANKS;
        })
        .catch(function () { fail(); });
    }

    back.addEventListener("click", function () { if (step > 0) show(step - 1, true); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(step)) return;
      if (step < STEPS.length - 1) { show(step + 1, true); return; }
      submit();
    });

    // Enter em input avança; em textarea, Ctrl/Cmd+Enter envia
    form.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      if (e.target.tagName === "TEXTAREA") {
        if (e.metaKey || e.ctrlKey) { e.preventDefault(); form.requestSubmit(); }
        return;
      }
      e.preventDefault();
      form.requestSubmit();
    });

    show(0, false);
  }

  document.querySelectorAll("[data-cadastro]").forEach(mount);

  /* ---------- nav das páginas que não carregam script.js (/cadastro, /obrigado-empresa) ---------- */
  if (document.body.hasAttribute("data-standalone")) {
    var nav = document.getElementById("nav");
    var burger = document.getElementById("burger");
    if (nav) {
      var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 20); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      if (burger) {
        burger.addEventListener("click", function () {
          var open = nav.classList.toggle("open");
          burger.setAttribute("aria-expanded", String(open));
        });
      }
    }
  }
})();
