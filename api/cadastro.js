/**
 * POST /api/cadastro
 *
 * Recebe o formulário "Fale com especialistas" (home e /cadastro) e cria a
 * oportunidade no board de leads do Monday — o mesmo board que o formulário
 * antigo do Monday (wkf.ms) alimentava, com os mesmos IDs de coluna.
 *
 * Variáveis de ambiente (Vercel → studio-fh-site):
 *   MONDAY_API_TOKEN   token de API do Monday (obrigatório)
 *   MONDAY_BOARD_ID    board de leads (padrão: 18409461674)
 *   MONDAY_GROUP_ID    grupo onde o item entra (padrão: "topics")
 *   CADASTRO_DRY_RUN   "1" para não chamar o Monday (uso local/teste)
 *
 * Resposta: { ok: true, id } ou { ok: false, error }.
 */

const MONDAY_TOKEN = process.env.MONDAY_API_TOKEN;
const MONDAY_BOARD_ID = process.env.MONDAY_BOARD_ID || "18409461674";
const MONDAY_GROUP_ID = process.env.MONDAY_GROUP_ID || "topics";
const DRY_RUN = process.env.CADASTRO_DRY_RUN === "1";

// Colunas do board de leads (iguais às do formulário do Monday)
const COL = {
  nome: "short_textrwx4id6g",
  sobrenome: "short_text7ucdcve4",
  cargo: "short_textpzn8lwmj",
  telefone: "phone3u7rztfx",
  email: "emailvin8ygky",
  desafio: "long_text_mm2wy5md",
  utmSource: "short_textbopqjb0i",
  origem: "dropdown_mm2wx7e3", // "Inbound"
};

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const digits = (v) => String(v ?? "").replace(/\D/g, "");

/** Telefone no formato que a coluna "phone" do Monday aceita: só dígitos com DDI. */
function normalizePhone(raw) {
  let d = digits(raw);
  if (d.startsWith("00")) d = d.slice(2);
  if ((d.length === 10 || d.length === 11) && !d.startsWith("55")) d = "55" + d;
  return d;
}

function buildDesafio(p) {
  const utm = p.utm || {};
  const meta = [
    `Origem: studio.fh (${p.origem || "site"})`,
    p.pagina ? `Página: ${p.pagina}` : "",
    utm.source ? `utm_source: ${utm.source}` : "",
    utm.medium ? `utm_medium: ${utm.medium}` : "",
    utm.campaign ? `utm_campaign: ${utm.campaign}` : "",
    utm.content ? `utm_content: ${utm.content}` : "",
    utm.term ? `utm_term: ${utm.term}` : "",
    utm.gclid ? `gclid: ${utm.gclid}` : "",
  ].filter(Boolean);
  return `${p.desafio}\n\n— ${meta.join(" · ")}`;
}

async function createMondayItem(p) {
  const columnValues = {
    [COL.nome]: p.nome,
    [COL.sobrenome]: p.sobrenome,
    [COL.cargo]: p.cargo,
    [COL.email]: { email: p.email, text: p.email },
    [COL.telefone]: { phone: normalizePhone(p.telefone), countryShortName: "BR" },
    [COL.desafio]: { text: buildDesafio(p) },
    [COL.utmSource]: clean(p.utm?.source, 100) || "studio-fh",
    [COL.origem]: { labels: ["Inbound"] },
  };

  const query = `mutation ($boardId: ID!, $groupId: String, $itemName: String!, $columnValues: JSON!) {
    create_item(board_id: $boardId, group_id: $groupId, item_name: $itemName, column_values: $columnValues) { id }
  }`;

  const r = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: MONDAY_TOKEN,
      "API-Version": "2024-01",
    },
    body: JSON.stringify({
      query,
      variables: {
        boardId: MONDAY_BOARD_ID,
        groupId: MONDAY_GROUP_ID,
        itemName: p.empresa,
        columnValues: JSON.stringify(columnValues),
      },
    }),
  });

  const data = await r.json().catch(() => null);
  const id = data?.data?.create_item?.id;
  if (!id) {
    const msg = data?.errors?.[0]?.message || data?.error_message || `HTTP ${r.status}`;
    throw new Error(`Monday: ${msg}`);
  }
  return String(id);
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  const body = typeof req.body === "string" ? safeParse(req.body) : req.body;
  if (!body) return res.status(400).json({ ok: false, error: "JSON inválido" });

  // honeypot: campo invisível que só robô preenche
  if (clean(body.website, 10)) return res.status(200).json({ ok: true, id: null });

  const p = {
    nome: clean(body.nome, 120),
    sobrenome: clean(body.sobrenome, 120),
    cargo: clean(body.cargo, 160),
    empresa: clean(body.empresa, 200),
    email: clean(body.email, 200).toLowerCase(),
    telefone: clean(body.telefone, 40),
    desafio: clean(body.desafio, 4000),
    origem: clean(body.origem, 40),
    pagina: clean(body.pagina, 200),
    utm: {
      source: clean(body.utm?.source, 100),
      medium: clean(body.utm?.medium, 100),
      campaign: clean(body.utm?.campaign, 160),
      content: clean(body.utm?.content, 160),
      term: clean(body.utm?.term, 160),
      gclid: clean(body.utm?.gclid, 200),
    },
  };

  if (p.nome.length < 2) return res.status(400).json({ ok: false, error: "Informe seu nome." });
  if (p.sobrenome.length < 2) return res.status(400).json({ ok: false, error: "Informe seu sobrenome." });
  if (p.cargo.length < 2) return res.status(400).json({ ok: false, error: "Informe seu cargo." });
  if (p.empresa.length < 2) return res.status(400).json({ ok: false, error: "Informe a empresa." });
  if (!emailOk(p.email)) return res.status(400).json({ ok: false, error: "E-mail inválido." });
  if (digits(p.telefone).length < 10) return res.status(400).json({ ok: false, error: "Telefone inválido." });
  if (p.desafio.length < 5) return res.status(400).json({ ok: false, error: "Conte um pouco do desafio." });

  if (DRY_RUN) return res.status(200).json({ ok: true, id: "dry-run" });

  if (!MONDAY_TOKEN) {
    console.error("[cadastro] MONDAY_API_TOKEN ausente");
    return res.status(500).json({ ok: false, error: "CRM não configurado." });
  }

  try {
    const id = await createMondayItem(p);
    return res.status(200).json({ ok: true, id });
  } catch (err) {
    console.error("[cadastro] falhou", err);
    return res.status(502).json({ ok: false, error: "Não conseguimos registrar agora. Tente de novo em instantes." });
  }
};
