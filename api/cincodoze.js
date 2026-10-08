/**
 * POST /api/cincodoze
 *
 * Lead da Campanha 5.12 (studio.freehelper.com.br/cincodoze/).
 *   1. valida o formulário (e recalcula o Mapa de Propósito no servidor)
 *   2. cria o item no board de leads do Monday ("[5.12] Empresa")
 *   3. grava em dbo.leads na base isolada studio-cincodoze (mesmo se o Monday falhar)
 *
 * Variáveis: ver api/_cincodoze/db.js e api/_cincodoze/monday.js.
 *   C512_DRY_RUN = "1" → não chama Monday nem banco (teste local)
 */
const { sql, pool } = require("./_cincodoze/db");
const { criarItem } = require("./_cincodoze/monday");
require("../cincodoze/mapa.js");
const M = globalThis.MapaProposito;

const DRY_RUN = process.env.C512_DRY_RUN === "1";
const FORMATOS = ["talk", "embaixadores", "hub", "combo"];
const NOME_FORMATO = { talk: "Talk de Impacto", embaixadores: "Jornada de Embaixadores", hub: "Hub de Impacto", combo: "Ajuda para escolher / combinar" };
const FAIXAS = ["Até 100", "101 a 500", "501 a 1.000", "1.001 a 5.000", "Mais de 5.000"];
const ALLOWED_ORIGINS = /^https:\/\/(studio\.freehelper\.com\.br|[a-z0-9-]+\.vercel\.app)$|^http:\/\/localhost(:\d+)?$/;

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const digits = (v) => String(v ?? "").replace(/\D/g, "");

function textoMonday(l, mapa) {
  const linhas = [
    "Campanha 5.12 — Dia Internacional do Voluntariado",
    `Formato de interesse: ${NOME_FORMATO[l.formato]}`,
    mapa ? `Mapa de Propósito indicou: ${mapa.formato.nome} (estágio ${mapa.formato.nivel})` : "Contato direto (sem Mapa de Propósito)",
    `Colaboradores: ${l.colaboradores}`,
  ];
  if (mapa) {
    linhas.push("", "Respostas do Mapa:");
    M.PERGUNTAS.forEach((p) => {
      const op = p.opcoes.find((o) => o.id === l.respostas[p.id]);
      if (op) linhas.push(`• ${p.titulo} → ${op.txt}`);
    });
  }
  const u = l.utm;
  const meta = [`Página: ${l.pagina || "/cincodoze/"}`, u.source && `utm_source: ${u.source}`, u.medium && `utm_medium: ${u.medium}`,
    u.campaign && `utm_campaign: ${u.campaign}`, u.content && `utm_content: ${u.content}`, u.gclid && `gclid: ${u.gclid}`].filter(Boolean);
  return linhas.join("\n") + `\n\n— ${meta.join(" · ")}`;
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body) return res.status(400).json({ ok: false, error: "JSON inválido" });
  if (clean(body.website, 10)) return res.status(200).json({ ok: true }); // honeypot

  const u = body.utm || {};
  const l = {
    nome: clean(body.nome, 160),
    cargo: clean(body.cargo, 160),
    empresa: clean(body.empresa, 200),
    colaboradores: clean(body.colaboradores, 40),
    email: clean(body.email, 200).toLowerCase(),
    telefone: clean(body.telefone, 40),
    formato: clean(body.formato, 20),
    lgpd: body.lgpd === true,
    pagina: clean(body.pagina, 200),
    respostas: {},
    utm: { source: clean(u.source, 100), medium: clean(u.medium, 100), campaign: clean(u.campaign, 160), content: clean(u.content, 160), term: clean(u.term, 160), gclid: clean(u.gclid, 200) },
  };
  // só aceita respostas que existem no Mapa
  if (body.respostas && typeof body.respostas === "object") {
    M.PERGUNTAS.forEach((p) => {
      const v = clean(body.respostas[p.id], 20);
      if (p.opcoes.some((o) => o.id === v)) l.respostas[p.id] = v;
    });
  }
  const completo = Object.keys(l.respostas).length === M.PERGUNTAS.length;
  const mapa = completo ? M.calcular(l.respostas) : null;

  if (l.nome.length < 3) return res.status(400).json({ ok: false, error: "Informe seu nome." });
  if (l.cargo.length < 2) return res.status(400).json({ ok: false, error: "Informe seu cargo." });
  if (l.empresa.length < 2) return res.status(400).json({ ok: false, error: "Informe a empresa." });
  if (!FAIXAS.includes(l.colaboradores)) return res.status(400).json({ ok: false, error: "Selecione o nº de colaboradores." });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email)) return res.status(400).json({ ok: false, error: "E-mail inválido." });
  if (digits(l.telefone).length < 10) return res.status(400).json({ ok: false, error: "WhatsApp inválido." });
  if (!FORMATOS.includes(l.formato)) return res.status(400).json({ ok: false, error: "Escolha um formato." });
  if (!l.lgpd) return res.status(400).json({ ok: false, error: "É preciso autorizar o contato (LGPD)." });

  if (DRY_RUN) return res.status(200).json({ ok: true, dryRun: true, recomendacao: mapa?.formato.id || null });

  let mondayId = null, mondayErro = null;
  try {
    mondayId = await criarItem(l, textoMonday(l, mapa));
  } catch (err) {
    mondayErro = String(err.message).slice(0, 300);
    console.error("[cincodoze] monday falhou", err);
  }

  try {
    const p = await pool("escrita");
    const r = p.request();
    const campos = {
      nome: [sql.NVarChar(160), l.nome], cargo: [sql.NVarChar(160), l.cargo], empresa: [sql.NVarChar(200), l.empresa],
      colaboradores: [sql.NVarChar(40), l.colaboradores], email: [sql.NVarChar(200), l.email], telefone: [sql.NVarChar(40), l.telefone],
      formato: [sql.NVarChar(20), l.formato], recomendacao: [sql.NVarChar(20), mapa?.formato.id || null],
      origem: [sql.NVarChar(20), mapa ? "mapa" : "contato-direto"], respostas: [sql.NVarChar(1000), mapa ? JSON.stringify(l.respostas) : null],
      pontos_t: [sql.TinyInt, mapa?.pontos.T ?? null], pontos_e: [sql.TinyInt, mapa?.pontos.E ?? null], pontos_h: [sql.TinyInt, mapa?.pontos.L ?? null],
      utm_source: [sql.NVarChar(100), l.utm.source || null], utm_medium: [sql.NVarChar(100), l.utm.medium || null],
      utm_campaign: [sql.NVarChar(160), l.utm.campaign || null], utm_content: [sql.NVarChar(160), l.utm.content || null],
      utm_term: [sql.NVarChar(160), l.utm.term || null], gclid: [sql.NVarChar(200), l.utm.gclid || null],
      pagina: [sql.NVarChar(200), l.pagina || null], lgpd: [sql.Bit, 1],
      monday_id: [sql.NVarChar(40), mondayId], monday_erro: [sql.NVarChar(300), mondayErro],
    };
    Object.entries(campos).forEach(([k, [t, v]]) => r.input(k, t, v));
    const cols = Object.keys(campos);
    await r.query(`INSERT INTO dbo.leads (${cols.join(",")}) VALUES (${cols.map((c) => "@" + c).join(",")})`);
  } catch (err) {
    console.error("[cincodoze] banco falhou", err);
    if (!mondayId) return res.status(502).json({ ok: false, error: "Não conseguimos registrar agora. Tente de novo em instantes." });
  }

  return res.status(200).json({ ok: true, recomendacao: mapa?.formato.id || null });
};
