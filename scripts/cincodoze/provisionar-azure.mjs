/**
 * Provisiona a base da Campanha 5.12 (studio-cincodoze) no Azure SQL (dev-free-helper).
 *
 * Pré-requisitos:
 *   - Banco criado via CLI:
 *       az sql db create -g group-azure-plan -s dev-free-helper -n studio-cincodoze \
 *         --edition Basic --capacity 5 --max-size 2GB --backup-storage-redundancy Local
 *   - `az login` com o admin Entra ID do servidor (Pedro).
 *
 * Uso:  bun scripts/cincodoze/provisionar-azure.mjs
 *
 *   1. Gera senhas e cria/atualiza os LOGINS cincodoze_api e cincodoze_leitura no master.
 *   2. Roda db/schema.sql no banco (pula se as tabelas já existirem).
 *   3. Grava as credenciais + SESSION_SECRET + PAINEL_SENHA em .env.cincodoze (gitignored).
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import crypto from "node:crypto";
import sql from "mssql";

const SERVER = "dev-free-helper.database.windows.net";
const BANCO = "studio-cincodoze";

const token = execSync("az account get-access-token --resource https://database.windows.net/ --query accessToken -o tsv", {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
}).trim();
if (!token) throw new Error("Não consegui obter token do Azure (az login?)");

const senha = () => crypto.randomBytes(24).toString("base64url").replace(/[-_]/g, "x") + "!9a";
const senhaApi = senha();
const senhaLeitura = senha();

const conectar = (database) =>
  new sql.ConnectionPool({
    server: SERVER,
    database,
    options: { encrypt: true },
    authentication: { type: "azure-active-directory-access-token", options: { token } },
  }).connect();

console.log("→ master: logins cincodoze_api e cincodoze_leitura");
let pool = await conectar("master");
for (const [u, s] of [["cincodoze_api", senhaApi], ["cincodoze_leitura", senhaLeitura]]) {
  await pool.request().batch(`
    IF NOT EXISTS (SELECT 1 FROM sys.sql_logins WHERE name = '${u}') CREATE LOGIN ${u} WITH PASSWORD = '${s}';
    ELSE ALTER LOGIN ${u} WITH PASSWORD = '${s}';`);
}
await pool.close();

console.log(`→ ${BANCO}: schema`);
pool = await conectar(BANCO);
const existe = await pool.request().query("SELECT COUNT(*) AS n FROM sys.tables WHERE name = 'leads'");
if (existe.recordset[0].n > 0) console.log("   tabelas já existem — só atualizei as senhas dos logins");
else await pool.request().batch(readFileSync(new URL("./schema.sql", import.meta.url), "utf8"));
const check = await pool.request().query(`
  SELECT name FROM sys.tables ORDER BY name;
  SELECT name FROM sys.database_principals WHERE type = 'S' AND name LIKE 'cincodoze_%';`);
console.log("   tabelas:", check.recordsets[0].map((r) => r.name).join(", "));
console.log("   usuários:", check.recordsets[1].map((r) => r.name).join(", "));
await pool.close();

// mantém SESSION_SECRET e PAINEL_SENHA se o arquivo já existir (trocar derruba sessões / muda a senha do painel)
const destino = new URL("../../.env.cincodoze", import.meta.url);
const antigo = existsSync(destino) ? readFileSync(destino, "utf8") : "";
const manter = (k, gerar) => (antigo.match(new RegExp(`^${k}=(.+)$`, "m")) || [])[1] || gerar();
writeFileSync(
  destino,
  [
    "# Gerado por scripts/provisionar-azure.mjs — NÃO commitar",
    `C512_DB_SERVER=${SERVER}`,
    `C512_DB_DATABASE=${BANCO}`,
    "C512_DB_USER=cincodoze_api",
    `C512_DB_PASSWORD=${senhaApi}`,
    "C512_DB_READ_USER=cincodoze_leitura",
    `C512_DB_READ_PASSWORD=${senhaLeitura}`,
    `C512_SESSION_SECRET=${manter("C512_SESSION_SECRET", () => crypto.randomBytes(32).toString("base64url"))}`,
    `C512_PAINEL_SENHA=${manter("C512_PAINEL_SENHA", () => "c512-" + crypto.randomBytes(6).toString("base64url"))}`,
    "",
  ].join("\n")
);
console.log("✓ credenciais em .env.cincodoze (gitignored)");
