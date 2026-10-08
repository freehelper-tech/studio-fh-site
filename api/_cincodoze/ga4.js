/**
 * GA4 Data API (somente leitura) com a service account ga4-mcp, que é Leitora
 * da propriedade "Studio FH" (551597112). Assina o JWT na mão para não depender
 * de pacote do Google.
 * Variáveis: C512_GA_SA_KEY (JSON da chave em base64), C512_GA_PROPERTY (padrão 551597112)
 */
const crypto = require("crypto");

const PROPERTY = process.env.C512_GA_PROPERTY || "551597112";
let cache = { token: null, exp: 0 };

function chave() {
  const raw = process.env.C512_GA_SA_KEY;
  if (!raw) throw new Error("C512_GA_SA_KEY ausente");
  return JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
}

async function accessToken() {
  if (cache.token && Date.now() < cache.exp) return cache.token;
  const k = chave();
  const agora = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const corpo = b64({ alg: "RS256", typ: "JWT" }) + "." +
    b64({ iss: k.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly", aud: "https://oauth2.googleapis.com/token", iat: agora, exp: agora + 3600 });
  const assinatura = crypto.createSign("RSA-SHA256").update(corpo).sign(k.private_key, "base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: corpo + "." + assinatura }),
  });
  const d = await r.json();
  if (!d.access_token) throw new Error("GA4 auth: " + (d.error_description || d.error || r.status));
  cache = { token: d.access_token, exp: Date.now() + 50 * 60 * 1000 };
  return d.access_token;
}

async function report(body) {
  const r = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY}:runReport`, {
    method: "POST",
    headers: { Authorization: "Bearer " + (await accessToken()), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (d.error) throw new Error("GA4: " + d.error.message);
  return (d.rows || []).map((row) => ({
    d: (row.dimensionValues || []).map((v) => v.value),
    m: (row.metricValues || []).map((v) => Number(v.value)),
  }));
}

const FILTRO = { filter: { fieldName: "pagePath", stringFilter: { matchType: "BEGINS_WITH", value: "/cincodoze" } } };

/** Resumo da LP desde o lançamento: totais, série diária, origens, dispositivos e eventos do funil. */
async function resumo(inicio) {
  // antes do lançamento a página ainda não tem dados: mostra os últimos 7 dias
  const hoje = new Date().toISOString().slice(0, 10);
  const dateRanges = [{ startDate: inicio <= hoje ? inicio : "7daysAgo", endDate: "today" }];
  const metricas = [{ name: "screenPageViews" }, { name: "totalUsers" }, { name: "sessions" }, { name: "averageSessionDuration" }];
  const [totais, dias, origens, devices, eventos] = await Promise.all([
    report({ dateRanges, metrics: metricas, dimensionFilter: FILTRO }),
    report({ dateRanges, dimensions: [{ name: "date" }], metrics: [{ name: "screenPageViews" }, { name: "totalUsers" }], dimensionFilter: FILTRO, orderBys: [{ dimension: { dimensionName: "date" } }] }),
    report({ dateRanges, dimensions: [{ name: "sessionSourceMedium" }], metrics: [{ name: "totalUsers" }], dimensionFilter: FILTRO, orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }], limit: 8 }),
    report({ dateRanges, dimensions: [{ name: "deviceCategory" }], metrics: [{ name: "totalUsers" }], dimensionFilter: FILTRO }),
    report({ dateRanges, dimensions: [{ name: "eventName" }], metrics: [{ name: "eventCount" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { matchType: "BEGINS_WITH", value: "cincodoze_" } } } }),
  ]);
  const t = totais[0]?.m || [0, 0, 0, 0];
  return {
    views: t[0], usuarios: t[1], sessoes: t[2], duracao: Math.round(t[3]),
    dias: dias.map((r) => ({ dia: r.d[0], views: r.m[0], usuarios: r.m[1] })),
    origens: origens.map((r) => ({ origem: r.d[0], usuarios: r.m[0] })),
    devices: devices.map((r) => ({ device: r.d[0], usuarios: r.m[0] })),
    eventos: Object.fromEntries(eventos.map((r) => [r.d[0], r.m[0]])),
  };
}

module.exports = { resumo };
