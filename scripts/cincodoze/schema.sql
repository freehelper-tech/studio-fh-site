-- Campanha 5.12 (/cincodoze) — base isolada studio-cincodoze (dev-free-helper)
CREATE TABLE dbo.leads (
  id             INT IDENTITY(1,1) PRIMARY KEY,
  criado_em      DATETIME2(0)   NOT NULL DEFAULT SYSUTCDATETIME(),
  nome           NVARCHAR(160)  NOT NULL,
  cargo          NVARCHAR(160)  NOT NULL,
  empresa        NVARCHAR(200)  NOT NULL,
  colaboradores  NVARCHAR(40)   NOT NULL,
  email          NVARCHAR(200)  NOT NULL,
  telefone       NVARCHAR(40)   NOT NULL,
  formato        NVARCHAR(20)   NOT NULL,      -- escolhido no form: talk | embaixadores | hub | combo
  recomendacao   NVARCHAR(20)   NULL,          -- indicado pelo Mapa (NULL = contato direto)
  origem         NVARCHAR(20)   NOT NULL,      -- mapa | contato-direto
  respostas      NVARCHAR(1000) NULL,          -- JSON com as respostas do Mapa
  pontos_t       TINYINT NULL, pontos_e TINYINT NULL, pontos_h TINYINT NULL,
  utm_source     NVARCHAR(100) NULL, utm_medium NVARCHAR(100) NULL, utm_campaign NVARCHAR(160) NULL,
  utm_content    NVARCHAR(160) NULL, utm_term NVARCHAR(160) NULL, gclid NVARCHAR(200) NULL,
  pagina         NVARCHAR(200) NULL,
  lgpd           BIT NOT NULL,
  monday_id      NVARCHAR(40)  NULL,
  monday_erro    NVARCHAR(300) NULL
);
CREATE INDEX ix_leads_criado ON dbo.leads (criado_em);

CREATE USER cincodoze_api FROM LOGIN cincodoze_api;
CREATE USER cincodoze_leitura FROM LOGIN cincodoze_leitura;
GRANT INSERT ON dbo.leads TO cincodoze_api;
GRANT SELECT ON dbo.leads TO cincodoze_leitura;
