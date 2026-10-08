/**
 * Roda um arquivo .sql (ou uma query) no banco studio-cincodoze como
 * admin Entra ID (usa o token do `az login` do Pedro). Só para administração.
 *
 * Uso:  bun scripts/cincodoze/rodar-sql.mjs scripts/algum-arquivo.sql
 *       bun scripts/cincodoze/rodar-sql.mjs --query "SELECT COUNT(*) n FROM dbo.leads"
 *       DB=master bun scripts/cincodoze/rodar-sql.mjs --query "..."   (para mexer em logins)
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import sql from "mssql";

const SERVER = "dev-free-helper.database.windows.net";
const DATABASE = process.env.DB || "studio-cincodoze";

const args = process.argv.slice(2);
let texto;
if (args[0] === "--query") texto = args.slice(1).join(" ");
else if (args[0]) texto = readFileSync(args[0], "utf8");
else {
  console.error('Informe um arquivo .sql ou --query "..."');
  process.exit(1);
}

const token = execSync(
  "az account get-access-token --resource https://database.windows.net/ --query accessToken -o tsv",
  { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }
).trim();
if (!token) throw new Error("Não consegui obter token do Azure (az login?)");

const pool = await sql.connect({
  server: SERVER,
  database: DATABASE,
  options: { encrypt: true },
  authentication: { type: "azure-active-directory-access-token", options: { token } },
});

const r = await pool.request().batch(texto);
(r.recordsets || []).forEach((rs) => rs.length && console.table(rs));
console.log(`✓ ok (${DATABASE}) — linhas afetadas: ${r.rowsAffected.join(", ") || 0}`);
await pool.close();
