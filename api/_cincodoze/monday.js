/**
 * Cria o lead da Campanha 5.12 no board de leads do Monday — o mesmo board e as
 * mesmas colunas do formulário "Fale com especialistas" (api/cadastro.js).
 * Variáveis: MONDAY_API_TOKEN, MONDAY_BOARD_ID, MONDAY_GROUP_ID, C512_MONDAY_ORIGEM
 */
const BOARD_ID = process.env.MONDAY_BOARD_ID || "18409461674";
const GROUP_ID = process.env.MONDAY_GROUP_ID || "topics";
const ORIGEM = process.env.C512_MONDAY_ORIGEM || "Inbound";

const COL = {
  nome: "short_textrwx4id6g",
  sobrenome: "short_text7ucdcve4",
  cargo: "short_textpzn8lwmj",
  telefone: "phone3u7rztfx",
  email: "emailvin8ygky",
  desafio: "long_text_mm2wy5md",
  utmSource: "short_textbopqjb0i",
  origem: "dropdown_mm2wx7e3",
};

function normalizePhone(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if ((d.length === 10 || d.length === 11) && !d.startsWith("55")) d = "55" + d;
  return d;
}

async function criarItem(lead, texto) {
  const token = process.env.MONDAY_API_TOKEN;
  if (!token) throw new Error("MONDAY_API_TOKEN ausente");
  const [nome, ...resto] = lead.nome.split(/\s+/);
  const columnValues = {
    [COL.nome]: nome,
    [COL.sobrenome]: resto.join(" ") || "-",
    [COL.cargo]: lead.cargo,
    [COL.email]: { email: lead.email, text: lead.email },
    [COL.telefone]: { phone: normalizePhone(lead.telefone), countryShortName: "BR" },
    [COL.desafio]: { text: texto },
    [COL.utmSource]: lead.utm.source || "campanha-512",
    [COL.origem]: { labels: [ORIGEM] },
  };
  const query = `mutation ($boardId: ID!, $groupId: String, $itemName: String!, $columnValues: JSON!) {
    create_item(board_id: $boardId, group_id: $groupId, item_name: $itemName, column_values: $columnValues, create_labels_if_missing: true) { id }
  }`;
  const r = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: token, "API-Version": "2024-01" },
    body: JSON.stringify({
      query,
      variables: { boardId: BOARD_ID, groupId: GROUP_ID, itemName: `[5.12] ${lead.empresa}`, columnValues: JSON.stringify(columnValues) },
    }),
  });
  const data = await r.json().catch(() => null);
  const id = data?.data?.create_item?.id;
  if (!id) throw new Error(`Monday: ${data?.errors?.[0]?.message || data?.error_message || "HTTP " + r.status}`);
  return String(id);
}

module.exports = { criarItem, BOARD_ID };
