/**
 * Conexões com a base isolada studio-cincodoze (Azure SQL, dev-free-helper).
 *   escrita → cincodoze_api      (só INSERT em dbo.leads)
 *   leitura → cincodoze_leitura  (só SELECT em dbo.leads)
 * Variáveis: C512_DB_SERVER, C512_DB_DATABASE, C512_DB_USER, C512_DB_PASSWORD,
 *            C512_DB_READ_USER, C512_DB_READ_PASSWORD
 */
const sql = require("mssql");

const pools = {};

function pool(tipo) {
  if (!pools[tipo]) {
    const e = process.env;
    const leitura = tipo === "leitura";
    pools[tipo] = new sql.ConnectionPool({
      server: e.C512_DB_SERVER || "dev-free-helper.database.windows.net",
      database: e.C512_DB_DATABASE || "studio-cincodoze",
      user: leitura ? e.C512_DB_READ_USER || "cincodoze_leitura" : e.C512_DB_USER || "cincodoze_api",
      password: leitura ? e.C512_DB_READ_PASSWORD : e.C512_DB_PASSWORD,
      options: { encrypt: true },
      pool: { max: 3, idleTimeoutMillis: 30000 },
      connectionTimeout: 20000,
    })
      .connect()
      .catch((err) => {
        delete pools[tipo];
        throw err;
      });
  }
  return pools[tipo];
}

module.exports = { sql, pool };
