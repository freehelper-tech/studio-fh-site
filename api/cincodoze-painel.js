/**
 * /api/cincodoze-painel — painel interno da Campanha 5.12.
 *
 *   POST { senha }                         → { ok, token }   (sessão de 12h)
 *   GET  ?acao=dados   (Bearer token)      → conversão (dbo.leads, usuário só-leitura)
 *   GET  ?acao=ga      (Bearer token)      → audiência da LP no GA4
 *   GET  ?acao=manual  (Bearer token)      → manual interno + preços (não ficam no site público)
 *
 * Variáveis: C512_PAINEL_SENHA, C512_SESSION_SECRET (+ as de db.js e ga4.js)
 */
const crypto = require("crypto");
const { pool } = require("./_cincodoze/db");
const ga4 = require("./_cincodoze/ga4");
const manual = require("./_cincodoze/manual");

const LANCAMENTO = "2026-10-13";
const ALLOWED_ORIGINS = /^https:\/\/(studio\.freehelper\.com\.br|[a-z0-9-]+\.vercel\.app)$|^http:\/\/localhost(:\d+)?$/;
const erros = new Map(); // ip → [timestamps] (rate limit de senha errada)

const secret = () => process.env.C512_SESSION_SECRET || "";
const assinar = (exp) => exp + "." + crypto.createHmac("sha256", secret()).update(String(exp)).digest("base64url");
function tokenValido(t) {
  const [exp, sig] = String(t || "").split(".");
  if (!exp || !sig || !secret() || Date.now() > Number(exp)) return false;
  const esperado = assinar(exp).split(".")[1];
  return sig.length === esperado.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(esperado));
}
function senhaOk(s) {
  const a = crypto.createHash("sha256").update(String(s || "")).digest();
  const b = crypto.createHash("sha256").update(process.env.C512_PAINEL_SENHA || crypto.randomBytes(16)).digest();
  return crypto.timingSafeEqual(a, b);
}

async function dados() {
  const p = await pool("leitura");
  const BRT = "CAST(criado_em AT TIME ZONE 'UTC' AT TIME ZONE 'E. South America Standard Time' AS DATE)";
  const r = await p.request().query(`
    SELECT COUNT(*) total,
      SUM(CASE WHEN ${BRT} = CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'E. South America Standard Time' AS DATE) THEN 1 ELSE 0 END) hoje,
      SUM(CASE WHEN criado_em >= DATEADD(day,-7,SYSUTCDATETIME()) THEN 1 ELSE 0 END) semana,
      SUM(CASE WHEN origem='mapa' THEN 1 ELSE 0 END) via_mapa,
      SUM(CASE WHEN monday_id IS NULL THEN 1 ELSE 0 END) sem_monday
    FROM dbo.leads;
    SELECT ${BRT} dia, COUNT(*) n FROM dbo.leads GROUP BY ${BRT} ORDER BY dia;
    SELECT formato k, COUNT(*) n FROM dbo.leads GROUP BY formato;
    SELECT ISNULL(recomendacao,'-') k, COUNT(*) n FROM dbo.leads GROUP BY recomendacao;
    SELECT colaboradores k, COUNT(*) n FROM dbo.leads GROUP BY colaboradores;
    SELECT ISNULL(utm_source,'(direto)') k, COUNT(*) n FROM dbo.leads GROUP BY utm_source ORDER BY n DESC;
    SELECT TOP 300 id, FORMAT(criado_em AT TIME ZONE 'UTC' AT TIME ZONE 'E. South America Standard Time','dd/MM HH:mm') quando,
      nome, cargo, empresa, colaboradores, formato, recomendacao, utm_source, monday_id
    FROM dbo.leads ORDER BY id DESC;`);
  const [t, dias, formato, recomendacao, colab, origem, lista] = r.recordsets;
  const mapa = (rs) => Object.fromEntries(rs.map((x) => [x.k, x.n]));
  return {
    totais: t[0],
    dias: dias.map((d) => ({ dia: d.dia.toISOString().slice(0, 10), n: d.n })),
    formato: mapa(formato), recomendacao: mapa(recomendacao), colaboradores: mapa(colab), origem: mapa(origem),
    leads: lista,
  };
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.test(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "POST") {
    const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0] || "?";
    const recentes = (erros.get(ip) || []).filter((t) => Date.now() - t < 15 * 60 * 1000);
    if (recentes.length >= 10) return res.status(429).json({ ok: false, error: "Muitas tentativas. Aguarde 15 minutos." });
    let body = req.body;
    if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
    if (!process.env.C512_PAINEL_SENHA || !secret()) return res.status(500).json({ ok: false, error: "Painel não configurado." });
    if (!senhaOk(body?.senha)) {
      erros.set(ip, [...recentes, Date.now()]);
      return res.status(401).json({ ok: false, error: "Senha incorreta." });
    }
    return res.status(200).json({ ok: true, token: assinar(Date.now() + 12 * 3600 * 1000) });
  }

  if (req.method !== "GET") return res.status(405).json({ ok: false });
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!tokenValido(token)) return res.status(401).json({ ok: false, error: "Sessão expirada." });

  const acao = String(req.query?.acao || new URL(req.url, "http://x").searchParams.get("acao") || "");
  try {
    if (acao === "dados") return res.status(200).json({ ok: true, ...(await dados()) });
    if (acao === "ga") return res.status(200).json({ ok: true, desde: LANCAMENTO, ...(await ga4.resumo(LANCAMENTO)) });
    if (acao === "manual") return res.status(200).json({ ok: true, ...manual });
    return res.status(400).json({ ok: false, error: "Ação inválida." });
  } catch (err) {
    console.error("[cincodoze-painel]", acao, err);
    return res.status(502).json({ ok: false, error: "Falha ao carregar (" + acao + ")." });
  }
};
