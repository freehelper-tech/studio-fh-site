# Prompt para o Lovable — Site studio.fh

> Cole o bloco abaixo no Lovable. **Antes de enviar, anexe os arquivos de logo** (veja instruções no fim).

---

## PROMPT (copiar a partir daqui)

Crie uma landing page institucional moderna, premium e de alta conversão para o **studio.fh**, o hub corporativo da Freehelper (uma empresa que cria programas de impacto social para grandes marcas).

### Stack técnica (importante)
- **React + Vite + TypeScript + Tailwind CSS** (componentes limpos e reutilizáveis).
- Animações com **Framer Motion** (entradas suaves no scroll, hover states).
- Código organizado por seção em componentes separados, fácil de exportar e editar depois. Sem libs exóticas.

### Direção de design (CRÍTICO)
- Inspiração de **estrutura e layout**: o site **go-lifted.com** (seções de abas, diagrama orbital no hero, cards de cases, blocos com imagem + cartões flutuantes). Quero esse mesmo nível de acabamento e sofisticação.
- **Tema dark premium**, tipo SaaS de ponta. Muito respiro, tipografia grande, micro-interações caprichadas, brilhos/gradientes sutis. Nada genérico — capricha no craft visual.
- Use **exatamente a minha identidade visual** abaixo.

### Identidade visual da marca
**Cores (use como design tokens):**
- Índigo profundo (base/marca): `#03038C`
- Azul royal: `#2A2EE0`
- Azul brilhante (destaques): `#4D54FF`
- Verde-limão (acento principal / CTAs): `#A9E02D` (hover mais claro: `#BDF83F`)
- Fundo escuro: `#06061F` e `#0A0A2E`
- Texto: branco `#FFFFFF` e cinza-claro translúcido para textos de apoio.

**Gradiente de marca** (use em palavras de destaque dos títulos): de azul brilhante `#4D54FF` → roxo-azulado → verde-limão `#A9E02D`.

**Tipografia:**
- Títulos: **Space Grotesk** (bold, tracking levemente negativo).
- Corpo: **Inter**.

**Logo:** vou anexar os arquivos. `logo-white.png` = logo branca para usar sobre fundo escuro (header e rodapé). `logo-blue.png` = logo azul para eventuais fundos claros. A logo é o ícone "ponte de pessoas" + a palavra **studio.fh** + tagline "hub corporativo freehelper". **NÃO redesenhe a logo, use o arquivo que anexei.**

---

### ESTRUTURA DO SITE (na ordem, com os textos exatos)

**1. HEADER fixo (sticky):**
- Esquerda: **logo branca** (`logo-white.png`).
- Centro/direita: links → "Soluções", "Cases", "Por que o Studio", "Tecnologia".
- Botão (verde-limão, pílula): "Fale com especialistas".
- Vira translúcido com blur ao rolar. Menu hambúrguer no mobile.

**2. HERO:**
- Eyebrow (pílula com bolinha verde): "hub corporativo freehelper".
- Título grande: **"Escale seus resultados através de impacto social."** — aplique o gradiente de marca em **"impacto social."**
- Subtítulo: "Criamos programas que fortalecem o relacionamento com comunidades, desenvolvem colaboradores e impulsionam objetivos estratégicos de marcas."
- Botões: "Explore possibilidades" (verde-limão, com seta) + "Ver cases" (contorno).
- À direita: um **gráfico orbital animado** (alta tecnologia) — um núcleo central escrito "studio.fh" e 6 pílulas orbitando lentamente: Colaboradores, Lideranças, Comunidades, Economia Local, ESG, Tecnologia & IA. Anéis concêntricos sutis. Capricha que esse é o destaque do hero.

**3. FAIXA DE CLIENTES (logo abaixo do hero):**
- Texto centralizado: "Empresas que confiam no studio.fh".
- Logos (por enquanto wordmarks em texto, em cinza, que clareiam no hover): **Stone, Ambev, Gestamp, Red Bull Bragantino, Mapfre**. (Vou trocar por logos reais depois.)

**4. SEÇÃO "Uma abordagem. Diversos desafios."** (equivalente ao bloco de abas do go-lifted):
- Título: "Uma abordagem. Diversos desafios." (a segunda frase em tom mais apagado).
- Subtítulo: "Seis frentes de atuação que conectam crescimento profissional, valor para o negócio e impacto real nos territórios."
- **6 abas clicáveis** (a aba ativa fica verde-limão). Ao clicar, troca o painel ao lado, que tem: rótulo + título + parágrafo + botão "Explore esta frente" + uma área de imagem com 2 cartões flutuantes. Conteúdo de cada aba:

  1. **Engajamento de Colaboradores** → "Programas de Voluntariado e Mentoria" → "Desenvolvemos e operamos iniciativas de voluntariado, mentorias e experiências sociais personalizadas, apoiadas por tecnologia e metodologia próprias para garantir escala, engajamento e resultado." (imagem: pessoas em mentoria/voluntariado)

  2. **Desenvolvimento de Lideranças** → "Desenvolva talentos gerando impacto social" → "Criamos programas personalizados que utilizam mentorias e voluntariado skill-based para desenvolver competências de liderança através de desafios reais, conectando crescimento profissional e impacto social." (imagem: liderança/workshop)

  3. **Relacionamento com Comunidades** → "Fortaleça sua conexão com o território" → "Criamos programas de relacionamento comunitário que aproximam empresas, lideranças locais e organizações sociais, fortalecendo a confiança, o diálogo e a geração de valor compartilhado." (imagem: comunidade/território)

  4. **Desenvolvimento Econômico Local** → "Fortaleça renda, empregabilidade e empreendedorismo" → "Desenvolvemos iniciativas para que sua empresa apoie empreendedores, comunidades e stakeholders através de capacitação prática, mentorias e conexões estratégicas, gerando novas oportunidades econômicas e desenvolvimento sustentável nos territórios onde atua." (imagem: pequeno empreendedor)

  5. **Estratégia ESG e Impacto** → "Transforme metas sociais em resultados concretos" → "Apoiamos empresas na construção de diagnósticos, programas e indicadores capazes de transformar compromissos ESG, objetivos de impacto e metas alinhadas aos ODS em iniciativas mensuráveis e conectadas à estratégia do negócio." (imagem: dashboard/indicadores)

  6. **Tecnologia e Inteligência Artificial** → "Amplifique seus resultados com tecnologia e IA" → "Desenhamos e desenvolvemos plataformas, sistemas e automações sob medida para apoiar programas de impacto, combinando tecnologia própria, inteligência artificial e metodologias de gestão para gerar escala, eficiência e melhores resultados." (imagem: plataforma/IA)

**5. SEÇÃO "Como fazemos na prática."** (carrossel de cases, equivalente ao "what they say" do go-lifted):
- Título: "Como fazemos na prática." + subtítulo "Programas que estruturamos e operamos ponta a ponta com grandes marcas." + setas de navegação.
- **Carrossel horizontal** de cards clicáveis (cada um leva a uma futura página de case — por ora link "#"). Cards:
  - **Stone** — "Impulso Stone" — "Criamos uma jornada que combina educação, mentoria, networking e acesso a crédito para fortalecer pequenos empreendedores e aprofundar o relacionamento da Stone com sua comunidade."
  - **Ambev** — "Bora Ambev Empreendedor" — "Transformamos colaboradores em mentores e conectamos conhecimento interno ao desenvolvimento de empreendedores, gerando renda, crescimento econômico local e valor compartilhado para o negócio."
  - **Gestamp** — "Programa Nacional de Voluntariado" — "Estruturamos e operamos uma jornada nacional de voluntariado que fortalece cultura, desenvolve lideranças e conecta colaboradores a desafios reais das comunidades onde a empresa atua."
  - **Red Bull Bragantino** — "Mapeamento Territorial e Comunitário" — "Mapeamos comunidades, lideranças e oportunidades de impacto para construir relações de longo prazo, fortalecer a presença institucional e gerar valor compartilhado para a região."
  - **Mapfre** — "Expert Mapfre" — "Desenvolvemos um programa que conecta colaboradores e organizações sociais em todo o Brasil, fortalecendo engajamento, reputação e geração de impacto mensurável."

**6. SEÇÃO "Por que as empresas escolhem o studio.fh":**
- Subtítulo: "Combinamos estratégia, tecnologia e operação para transformar objetivos sociais em resultados concretos."
- **4 cards** com imagem no topo + número + título + texto:
  1. "Diagnóstico antes da solução" — "Desenvolvemos projetos personalizados a partir dos desafios, objetivos e contexto de cada organização." (imagem: diagnóstico, mapa, post-its, workshop)
  2. "Da estratégia à operação" — "Não apenas desenhamos programas. Estruturamos, operamos e acompanhamos a execução ponta a ponta." (imagem: jornada, processo, dashboard)
  3. "Tecnologia própria para escalar" — "Desenvolvemos plataformas, automações e aplicações de IA para ampliar alcance, eficiência e mensuração." (imagem: dashboard, plataforma, IA)
  4. "Impacto conectado ao negócio" — "Toda iniciativa é construída para gerar valor para comunidades, colaboradores e objetivos estratégicos da organização." (imagem: gráficos, indicadores, ESG)

**7. SEÇÃO "A engrenagem studio.fh" (diagrama high-tech):**
- Eyebrow centralizado: "a engrenagem studio.fh".
- Título centralizado: "Como conectamos método e impacto." (gradiente em "método e impacto").
- Um **diagrama high-tech** sobre fundo azul royal, com: 4 caixas de método à esquerda, fios/linhas animadas convergindo para um núcleo central "FH" (verde-limão, com brilho), e 6 caixas de áreas à direita (cada uma com um botão de seta verde-limão).
  - **Caixas de método (esquerda):** "Projetos personalizados com base em diagnóstico da sua empresa" / "Metodologia escalável e automatizável de gestão de programas" / "Impacto potencializado por IA desenvolvida internamente" / "Tecnologia desenvolvida sob medida para o projeto".
  - **Caixas de áreas (direita):** "Engajamento e Cultura" / "Desenvolvimento de Lideranças" / "Relacionamento Comunitário" / "Desenvolvimento Econômico Local" / "ESG e Impacto" / "Tecnologia e IA".

**8. CTA FINAL:**
- Bloco em destaque (gradiente da marca, com brilho verde-limão no canto).
- Título: "Pronto para transformar impacto social em resultados?" (gradiente em "resultados?").
- Texto: "Vamos construir uma estratégia alinhada aos seus objetivos, colaboradores e comunidades."
- Botão verde-limão: "Fale com nossos especialistas".

**9. RODAPÉ:**
- Logo branca + descrição: "O hub corporativo da Freehelper. Estratégia, tecnologia e operação para transformar objetivos sociais em resultados concretos."
- Colunas: Navegação (Soluções, Cases, Por que o Studio, Tecnologia) e Contato (contato@freehelper.com.br, www.freehelper.com.br).
- Rodapé inferior: "© 2026 studio.fh · um produto Freehelper".

### Imagens
Onde indiquei "(imagem: ...)", use placeholders elegantes (fotos corporativas/de comunidade coerentes, ou blocos com gradiente da marca) que eu troco depois. Mantenha tudo no tom da marca.

### Responsividade
Mobile-first, impecável no celular: header vira menu hambúrguer, grids viram coluna única, o diagrama orbital e a engrenagem se reorganizam sem quebrar.

(fim do prompt)

---

## Como usar no Lovable
1. Abra um novo projeto no Lovable.
2. **Anexe os arquivos de logo** no chat (ícone de clipe/imagem): `assets/img/logo-white.png` e `assets/img/logo-blue.png` desta pasta. Diga: "use estes arquivos como a logo, não redesenhe".
3. Cole o prompt acima e envie.
4. Depois de gerar, peça ajustes finos ("aumente o respiro do hero", "deixe os cards mais altos", etc.).
5. Para trazer o código pra cá: no Lovable use **GitHub** (Connect → cria o repo) ou o export, e a gente puxa pra cá pra fazer os últimos ajustes juntos.
