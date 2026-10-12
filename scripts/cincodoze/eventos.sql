-- Eventos de interação da LP (pop-up de saída e página /dados/), gravados direto
-- pela API pra não depender das tags do GTM. Sem dado pessoal: só nome do evento + detalhe curto.
CREATE TABLE dbo.eventos (
  id         INT IDENTITY(1,1) PRIMARY KEY,
  criado_em  DATETIME2(0)  NOT NULL DEFAULT SYSUTCDATETIME(),
  evento     NVARCHAR(40)  NOT NULL,
  detalhe    NVARCHAR(40)  NULL
);
CREATE INDEX ix_eventos_evento ON dbo.eventos (evento, criado_em);
GRANT INSERT ON dbo.eventos TO cincodoze_api;
GRANT SELECT ON dbo.eventos TO cincodoze_leitura;
