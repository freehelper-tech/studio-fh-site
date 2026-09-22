# studio.fh — site institucional

Landing page do **studio.fh** (hub corporativo da Freehelper). Estrutura inspirada no go-lifted.com, com a identidade visual da marca (índigo `#03038c` → azul royal `#4448d9` + acento verde-limão `#a9e02d`).

## Como rodar localmente
Site estático puro (HTML/CSS/JS), sem build. Basta um servidor estático:

```bash
cd studio-fh-site
python3 -m http.server 5123
# abre http://localhost:5123
```
Ou só abrir o `index.html` no navegador.

## Estrutura de arquivos
```
index.html        → todo o conteúdo (textos nas seções)
styles.css        → design system (cores nas variáveis :root no topo)
script.js         → tabs, carrossel, animações, menu mobile
assets/img/       → logos (logo-white.png p/ fundo escuro, logo-blue.png)
```

## Seções (na ordem)
1. **Hero** — headline + diagrama orbital animado
2. **Logos de clientes** — Stone, Ambev, Gestamp, Red Bull Bragantino, Mapfre
3. **Uma abordagem. Diversos desafios.** — 6 frentes em abas clicáveis
4. **Como fazemos na prática.** — carrossel de cases (clicáveis → futuras páginas)
5. **Por que escolhem o studio.fh** — 4 diferenciais
6. **A engrenagem** — diagrama high-tech (método → impacto)
7. **CTA final + rodapé**

## O que ainda é placeholder (pra você trocar)
- **Imagens das abas e dos cards "Por que escolhem"**: hoje são gradientes da marca. Para colocar fotos, no `styles.css` use os seletores `.panel__visual` e `.wcard__media` e adicione `background-image:url('assets/img/SEU-ARQUIVO.jpg')`. Os atributos `data-img="..."` no HTML já marcam qual é qual.
- **Logos dos clientes**: hoje são wordmarks em texto. Trocar por PNG/SVG das marcas em `.clients__row`.
- **Cards flutuantes** das abas (ex.: "Mentoria 1:1 · Ativa"): textos ilustrativos, ajuste à vontade.
- **Links dos cases**: só a Mapfre tem página (`case-fh/mapfre/`); os demais apontam para `#contato`.
- **E-mail de contato**: `contato@freehelper.com.br` — confirme/ajuste no `index.html` e no rodapé.

## Páginas de case (`/case-fh/<empresa>/`)
Cada case é uma pasta com `index.html` em `case-fh/`, no layout de go-lifted.com/case-studies
(hero em card com foto, métricas "Em vista", depoimento em destaque, corpo em 3 colunas com índice).
Compartilham `case.css` + `case.js` (carregados depois do `styles.css`).

- Primeiro case: `case-fh/mapfre/` (ligado no card "Expert Mapfre" da home).
- Para criar outro: copie a pasta `mapfre`, troque textos/logo e aponte o card da home (`href="case-fh/<slug>/"`).
- Fotos opcionais em `assets/img/cases/<slug>/` (`hero.jpg`, `champion.jpg`); sem elas a página usa
  fotos ilustrativas com a tag "foto ilustrativa".

## Trocar cores
Tudo está em variáveis CSS no topo do `styles.css` (`:root`). Mudou ali, mudou no site inteiro.

## Publicar (deploy)
Por ser estático, sobe em qualquer lugar:
- **Vercel/Netlify**: arrasta a pasta ou conecta o repositório (zero config).
- **GitHub Pages**: sobe os arquivos e ativa Pages.
```
