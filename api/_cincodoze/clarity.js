/**
 * Resumo do Microsoft Clarity para o painel (Data Export API).
 *
 * A API só devolve os últimos 1–3 dias e aceita 10 consultas por projeto/dia,
 * então cada consulta vira um retrato em dbo.clarity_snapshots e o painel
 * reaproveita o mais recente; só busca outro depois de 3h (no máx. 8/dia).
 *
 * Variáveis: C512_CLARITY_TOKEN (Settings → Data Export no Clarity)
 */
const { sql, pool } = require("./db");

const API = "https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3";
const VALIDADE_MS = 3 * 3600 * 1000;
const MAX_POR_DIA = 8;

async function buscar() {
  const token = process.env.C512_CLARITY_TOKEN;
  if (!token) throw new Error("C512_CLARITY_TOKEN ausente");
  const r = await fetch(API, { headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" } });
  if (!r.ok) throw new Error("Clarity HTTP " + r.status);
  return r.json();
}

const num = (v) => (v == null || v === "" ? null : Number(v));

/** Converte a resposta crua (lista de { metricName, information[] }) num resumo simples. */
function resumir(bruto) {
  const m = {};
  (Array.isArray(bruto) ? bruto : []).forEach((x) => (m[x.metricName] = x.information || []));
  const primeiro = (nome) => (m[nome] && m[nome][0]) || {};
  const traf = primeiro("Traffic");
  const tempo = primeiro("EngagementTime");
  const pct = (nome) => num(primeiro(nome).sessionsWithMetricPercentage);
  const lista = (nome, chave) =>
    (m[nome] || [])
      .map((i) => ({ nome: i[chave] || i.name || "—", sessoes: num(i.sessionsCount) || 0 }))
      .sort((a, b) => b.sessoes - a.sessoes)
      .slice(0, 6);
  return {
    sessoes: num(traf.totalSessionCount),
    bots: num(traf.totalBotSessionCount),
    usuarios: num(traf.distinctUserCount),
    paginasPorSessao: num(traf.pagesPerSessionPercentage),
    tempoTotal: num(tempo.totalTime),
    tempoAtivo: num(tempo.activeTime),
    rolagem: num(primeiro("ScrollDepth").averageScrollDepth),
    rageClicks: pct("RageClickCount"),
    deadClicks: pct("DeadClickCount"),
    quickback: pct("QuickbackClick"),
    rolagemExcessiva: pct("ExcessiveScroll"),
    errosScript: pct("ScriptErrorCount"),
    dispositivos: lista("Device", "name"),
    origens: lista("ReferrerUrl", "name"),
  };
}

async function resumo() {
  const leitura = await pool("leitura");
  const ult = await leitura.request().query(`
    SELECT TOP 1 criado_em, dados FROM dbo.clarity_snapshots ORDER BY id DESC;
    SELECT COUNT(*) n FROM dbo.clarity_snapshots WHERE criado_em >= DATEADD(hour,-24,SYSUTCDATETIME());`);
  const atual = ult.recordsets[0][0];
  const hoje = ult.recordsets[1][0].n;
  const idade = atual ? Date.now() - new Date(atual.criado_em).getTime() : Infinity;

  let dados = atual ? JSON.parse(atual.dados) : null;
  let quando = atual ? atual.criado_em : null;
  let aviso = null;

  if (idade > VALIDADE_MS && hoje < MAX_POR_DIA) {
    try {
      const bruto = await buscar();
      dados = { resumo: resumir(bruto), bruto };
      const escrita = await pool("escrita");
      await escrita.request()
        .input("dias", sql.TinyInt, 3)
        .input("dados", sql.NVarChar(sql.MAX), JSON.stringify(dados))
        .query("INSERT INTO dbo.clarity_snapshots (dias, dados) VALUES (@dias, @dados)");
      quando = new Date();
    } catch (err) {
      console.error("[clarity]", err);
      aviso = "Não consegui atualizar agora (" + err.message + "). Mostrando o último retrato salvo.";
    }
  }
  if (!dados) throw new Error(aviso || "Sem dados do Clarity ainda.");
  return { atualizado: new Date(quando).toISOString(), aviso, ...dados.resumo };
}

module.exports = { resumo };
