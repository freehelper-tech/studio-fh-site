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
  // Idioma vem do <html lang> (pt-BR na raiz, en em /en/, es em /es/ — gerados por tools/i18n/build.py)
  var LANG = (document.documentElement.lang || "pt").slice(0, 2);
  if (!/^(en|es)$/.test(LANG)) LANG = "pt";
  var PREFIX = LANG === "pt" ? "" : "/" + LANG;
  var THANKS = PREFIX + "/obrigado-empresa/";
  var UTM_KEY = "fh_utm";

  var TEXTS = {
    pt: {
      s1: ["Sobre você", "Quem está falando com a gente?", "Leva menos de um minuto. Nossa equipe retorna em até 1 dia útil."],
      s2: ["Sua empresa", "Onde você atua?", "Usamos o e-mail e o telefone só para retornar o contato."],
      s3: ["Seu desafio", "Qual o principal desafio que estão enfrentando?", "Pode ser em poucas linhas. Isso ajuda a gente a chegar na conversa já com ideias."],
      nome: ["Nome", "Seu nome"], sobrenome: ["Sobrenome", "Seu sobrenome"], cargo: ["Cargo", "Ex.: Gerente de Sustentabilidade"],
      empresa: ["Empresa", "Nome da empresa"], email: ["E-mail corporativo", "voce@empresa.com.br"],
      telefone: ["Telefone / WhatsApp", "(11) 99999-9999"],
      desafio: ["Conte para a gente", "Ex.: queremos engajar colaboradores em voluntariado, mas a adesão é baixa…"],
      err: { nome: "Informe seu nome.", sobrenome: "Informe seu sobrenome.", cargo: "Informe seu cargo.", empresa: "Informe a empresa.",
        email: "Digite um e-mail válido.", telefone: "Digite um telefone com DDD.", desafio: "Conte um pouco do desafio." },
      kicker: "Fale com especialistas", step: "Etapa {i} de {n}", back: "Voltar", next: "Próxima", send: "Enviar cadastro",
      legal: "Ao enviar, você concorda em receber contato da Freehelper sobre sua solicitação. Tratamos seus dados conforme a LGPD.",
      fail: "Não conseguimos enviar agora.", mail: "Se preferir, escreva para",
    },
    en: {
      s1: ["About you", "Who are we talking to?", "It takes less than a minute. Our team will get back to you within 1 business day."],
      s2: ["Your company", "Where do you work?", "We only use your email and phone to get back to you."],
      s3: ["Your challenge", "What's the main challenge your team is facing?", "A few lines are enough. It helps us come to the call with ideas."],
      nome: ["First name", "Your first name"], sobrenome: ["Last name", "Your last name"], cargo: ["Job title", "e.g., Sustainability Manager"],
      empresa: ["Company", "Company name"], email: ["Work email", "you@company.com"],
      telefone: ["Phone / WhatsApp", "+1 555 123 4567"],
      desafio: ["Tell us about it", "e.g., we want to engage employees in volunteering, but participation is low…"],
      err: { nome: "Enter your first name.", sobrenome: "Enter your last name.", cargo: "Enter your job title.", empresa: "Enter your company.",
        email: "Enter a valid email.", telefone: "Enter a phone number with country code.", desafio: "Tell us a bit about the challenge." },
      kicker: "Talk to our experts", step: "Step {i} of {n}", back: "Back", next: "Next", send: "Submit",
      legal: "By submitting, you agree to be contacted by Freehelper about your request. We handle your data in accordance with Brazil's data protection law (LGPD).",
      fail: "We couldn't send your request right now.", mail: "If you prefer, write to",
    },
    es: {
      s1: ["Sobre ti", "¿Con quién estamos hablando?", "Te llevará menos de un minuto. Nuestro equipo te responde en hasta 1 día hábil."],
      s2: ["Tu empresa", "¿Dónde trabajas?", "Solo usamos tu correo y teléfono para responderte."],
      s3: ["Tu desafío", "¿Cuál es el principal desafío que enfrenta tu empresa?", "Unas pocas líneas bastan. Así llegamos a la conversación con ideas."],
      nome: ["Nombre", "Tu nombre"], sobrenome: ["Apellido", "Tu apellido"], cargo: ["Cargo", "Ej.: Gerente de Sostenibilidad"],
      empresa: ["Empresa", "Nombre de la empresa"], email: ["Correo corporativo", "tu@empresa.com"],
      telefone: ["Teléfono / WhatsApp", "+34 600 123 456"],
      desafio: ["Cuéntanos", "Ej.: queremos involucrar a los colaboradores en el voluntariado, pero la adhesión es baja…"],
      err: { nome: "Escribe tu nombre.", sobrenome: "Escribe tu apellido.", cargo: "Escribe tu cargo.", empresa: "Escribe el nombre de la empresa.",
        email: "Escribe un correo válido.", telefone: "Escribe un teléfono con código de país.", desafio: "Cuéntanos un poco sobre el desafío." },
      kicker: "Habla con nuestros expertos", step: "Paso {i} de {n}", back: "Volver", next: "Siguiente", send: "Enviar",
      legal: "Al enviar, aceptas que Freehelper te contacte sobre tu solicitud. Tratamos tus datos conforme a la LGPD (ley brasileña de protección de datos).",
      fail: "No pudimos enviar tu solicitud ahora.", mail: "Si prefieres, escribe a",
    },
  };
  var T = TEXTS[LANG];

  function field(name, type, extra) {
    var f = { name: name, label: T[name][0], placeholder: T[name][1], type: type };
    for (var k in extra) f[k] = extra[k];
    return f;
  }

  var STEPS = [
    {
      key: "voce", label: T.s1[0], title: T.s1[1], hint: T.s1[2],
      fields: [
        field("nome", "text", { autocomplete: "given-name" }),
        field("sobrenome", "text", { autocomplete: "family-name" }),
        field("cargo", "text", { autocomplete: "organization-title", full: true }),
      ],
    },
    {
      key: "empresa", label: T.s2[0], title: T.s2[1], hint: T.s2[2],
      fields: [
        field("empresa", "text", { autocomplete: "organization", full: true }),
        field("email", "email", { autocomplete: "email", inputmode: "email" }),
        field("telefone", "tel", { autocomplete: "tel", inputmode: "tel" }),
      ],
    },
    {
      key: "desafio", label: T.s3[0], title: T.s3[1], hint: T.s3[2],
      fields: [field("desafio", "textarea", { full: true })],
    },
  ];

  var RULES = {
    nome: function (v) { return v.trim().length >= 2 || T.err.nome; },
    sobrenome: function (v) { return v.trim().length >= 2 || T.err.sobrenome; },
    cargo: function (v) { return v.trim().length >= 2 || T.err.cargo; },
    empresa: function (v) { return v.trim().length >= 2 || T.err.empresa; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || T.err.email; },
    telefone: function (v) { return v.replace(/\D/g, "").length >= 10 || T.err.telefone; },
    desafio: function (v) { return v.trim().length >= 5 || T.err.desafio; },
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
        '<div class="cad__top"><span class="cad__kicker">' + T.kicker + "</span>" +
        '<span class="cad__count"></span></div>' +
        '<div class="cad__bar"><i></i></div>' +
        '<div class="cad__steps">' + STEPS.map(function (s) { return "<span>" + s.label + "</span>"; }).join("") + "</div>" +
        stepsHtml +
        '<input class="cad__hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" />' +
        '<div class="cad__error" role="alert"></div>' +
        '<p class="cad__legal">' + T.legal + "</p>" +
        '<div class="cad__nav">' +
          '<button type="button" class="btn btn--ghost cad__back">← ' + T.back + '</button>' +
          '<button type="submit" class="btn btn--lime cad__next">' + T.next + ' <span class="arr">→</span><span class="spin"></span></button>' +
        "</div>" +
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

    // máscara (11) 99999-9999 só no PT; em EN/ES o número pode ser de qualquer país
    if (LANG === "pt") root.querySelectorAll('input[name="telefone"]').forEach(function (inp) {
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
      count.textContent = T.step.replace("{i}", i + 1).replace("{n}", STEPS.length);
      back.classList.toggle("is-hidden", i === 0);
      next.innerHTML = (i === STEPS.length - 1 ? T.send : T.next) +
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
      data.idioma = LANG;
      return data;
    }

    function fail(msg) {
      root.classList.remove("is-sending");
      // mensagens da API são em PT; fora do PT usa a genérica traduzida
      errBox.innerHTML = ((LANG === "pt" && msg) || T.fail) +
        " " + T.mail + ' <a href="mailto:contato@freehelper.com.br">contato@freehelper.com.br</a>.';
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
