-- Retratos da API do Clarity (Data Export: máx. 10 consultas/dia, dados dos últimos 1–3 dias).
-- O painel lê o retrato mais recente e só busca um novo a cada 3h.
CREATE TABLE dbo.clarity_snapshots (
  id         INT IDENTITY(1,1) PRIMARY KEY,
  criado_em  DATETIME2(0)  NOT NULL DEFAULT SYSUTCDATETIME(),
  dias       TINYINT       NOT NULL,
  dados      NVARCHAR(MAX) NOT NULL
);
GRANT INSERT ON dbo.clarity_snapshots TO cincodoze_api;
GRANT SELECT ON dbo.clarity_snapshots TO cincodoze_leitura;
