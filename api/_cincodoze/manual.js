/**
 * Manual interno da Campanha 5.12 — só sai pela API do painel, depois da senha
 * (o site é estático/público, então preços e estratégia não podem ficar em /cincodoze/).
 *
 * Itens marcados com <span class="m-todo">…</span> ainda precisam de validação do Pedro.
 */

const PRECOS = {
  talk: { nome: "Talk de Impacto", valor: 10000, texto: "R$ 10 mil" },
  embaixadores: { nome: "Jornada de Embaixadores", valor: 30000, texto: "R$ 30 mil" },
  hub: { nome: "Hub de Impacto", valor: 50000, texto: "R$ 50 mil" },
};

const SECOES = [
  {
    id: "porque",
    titulo: "Por que essa campanha existe",
    html: `
<p class="m-lead">Fim de ano é quando as empresas procuram <b>engajamento, solidariedade e cultura</b>, e quando ainda existe <b>orçamento de 2026 para usar</b>. A Campanha 5.12 transforma isso num produto simples de comprar: 3 formatos de 1 dia, com escopo fechado, ancorados no <b>Dia Internacional do Voluntariado (05/12)</b> de <b>2026, o Ano Internacional do Voluntariado</b> da ONU.</p>
<div class="m-grid m-grid--3">
  <div class="m-card"><h4>O discurso</h4><p><b>"Time sem propósito não dá resultado."</b> Cultura interna se constrói através de impacto social, não de mais uma confraternização.</p></div>
  <div class="m-card"><h4>O problema que atacamos</h4><p>− turnover, − burnout, + engajamento, + resultado. Falamos a língua do RH e do negócio, não de caridade.</p></div>
  <div class="m-card"><h4>A oportunidade</h4><p>Budget de fim de ano + data simbólica + produto pronto = ciclo de venda curto.</p></div>
</div>
<h3>O desafio: ciclo curto de verdade</h3>
<p>Queremos quebrar a "escadinha reversa" do ciclo de vendas B2B (lead em out → reunião em nov → proposta em dez → assinatura em fev). Aqui tudo acontece em ~2 meses:</p>
<ol class="m-steps">
  <li><b>Gerar lead</b> (LP + Mapa de Propósito + prospecção ativa)</li>
  <li><b>Reunião de apresentação</b> em até 48h (show and tell, 30 min)</li>
  <li><b>Negociar, fechar e faturar</b> na mesma semana</li>
  <li><b>Receber até 20/12</b>: fim do ciclo</li>
</ol>
<p>Por isso <b>produto fechado</b>: escopo, etapas e preço definidos. Não fazemos projeto sob medida nesta campanha; adaptamos dentro do formato.</p>
<h3>Metas da campanha <span class="m-todo">definir números</span></h3>
<table class="m-table"><tr><th>Indicador</th><th>Meta</th></tr>
<tr><td>Leads (LP + ativo)</td><td>—</td></tr><tr><td>Reuniões realizadas</td><td>—</td></tr>
<tr><td>Propostas enviadas</td><td>—</td></tr><tr><td>Contratos fechados</td><td>—</td></tr><tr><td>Receita contratada</td><td>—</td></tr></table>`,
  },
  {
    id: "calendario",
    titulo: "Calendário e prazos",
    html: `
<table class="m-table">
<tr><th>Data</th><th>Marco</th><th>O que significa pra venda</th></tr>
<tr><td><b>13/10</b> (ter)</td><td>Lançamento</td><td>LP no ar, ads e prospecção ativa começam.</td></tr>
<tr><td><b>05/11</b> (qui)</td><td>Fim do bônus</td><td>Quem fecha até aqui ganha kit de comunicação interna + prioridade na agenda. Use como gatilho de urgência.</td></tr>
<tr><td><b>17/11</b> (ter)</td><td>Último fechamento</td><td>Último dia para assinar e faturar. NF na assinatura + boleto 30 dias = pagamento em 17/12.</td></tr>
<tr><td><b>05/12</b> (sáb)</td><td>Dia Internacional do Voluntariado</td><td>Data símbolo. Execuções podem acontecer de 01 a 18/12. Cuidado: 05/12 é sábado, a maioria das empresas vai preferir 04/12 (sex) ou a semana seguinte.</td></tr>
<tr><td><b>20/12</b></td><td>Fim do ciclo</td><td>Todo o dinheiro recebido.</td></tr>
</table>
<h3>Regra de ouro dos prazos</h3>
<ul>
<li><b>Hub de Impacto:</b> mínimo de <b>3 semanas</b> entre assinatura e o dia (curadoria das ONGs e desafios).</li>
<li><b>Jornada de Embaixadores:</b> mínimo de <b>2 semanas</b> (pesquisa de causas com o time roda 1 semana).</li>
<li><b>Talk de Impacto:</b> mínimo de <b>1 semana</b>.</li>
</ul>
<p>Nunca prometa data sem checar a agenda de dezembro no Monday. <span class="m-todo">definir capacidade: quantos Hubs/Jornadas/Talks o time executa por semana</span></p>`,
  },
  {
    id: "formatos",
    titulo: "Os 3 formatos (bíblia de produto)",
    html: `
<p class="m-lead">Pense nos formatos como uma <b>escada de maturidade</b>: <b>Despertar → Mobilizar → Transformar</b>. O Mapa de Propósito indica o degrau; a gente vende o degrau certo e planta o próximo para 2027.</p>

<div class="m-prod">
  <div class="m-prod__head"><span>01 · Despertar</span><h3>Talk de Impacto</h3><b>R$ 10 mil</b></div>
  <p><b>Em uma frase:</b> uma palestra inspiradora e prática sobre voluntariado e engajamento, feita sob medida, que planta a semente e descobre quem quer puxar o movimento.</p>
  <div class="m-grid m-grid--2">
    <div><h4>Para quem</h4><ul><li>Empresas que nunca fizeram nada estruturado</li><li>Públicos grandes (150+ pessoas) ou pouco tempo de agenda</li><li>Quem quer abrir a conversa antes de investir mais</li></ul></div>
    <div><h4>Formato</h4><ul><li>60 a 90 min, presencial ou online</li><li>Público ilimitado</li><li>Palestrante studio.fh + história de ONG parceira</li></ul></div>
  </div>
  <h4>Etapas</h4>
  <ol class="m-steps"><li><b>Briefing</b> (30 min): cultura, causas que a empresa já apoia, público.</li><li><b>Personalização</b>: dados do setor, exemplos e cases próximos da realidade do cliente.</li><li><b>Talk</b> com dinâmica ao vivo: enquete por QR code ("qual causa te move?").</li><li><b>Pesquisa pós-talk</b>: quem quer se engajar e em quais causas.</li><li><b>Resumo executivo</b>: mapa de interesse do time + recomendação de próximos passos.</li></ol>
  <p class="m-tip"><b>Gancho de upsell:</b> a pesquisa pós-talk entrega a lista de futuros embaixadores. É o argumento pronto para a Jornada ou o Hub em 2027.</p>
  <p><b>Não inclui:</b> deslocamento fora da Grande SP, gravação profissional, tradução.</p>
</div>

<div class="m-prod">
  <div class="m-prod__head"><span>02 · Mobilizar</span><h3>Jornada de Embaixadores</h3><b>R$ 30 mil</b></div>
  <p><b>Em uma frase:</b> uma dinâmica de co-criação que alinha colaboradores, empresa e sociedade, define as causas da empresa e forma o grupo que vai liderar o movimento.</p>
  <div class="m-grid m-grid--2">
    <div><h4>Para quem</h4><ul><li>Empresas com ações pontuais (campanha do agasalho, doações), sem dono nem direção</li><li>Quem precisa de um plano de impacto para 2027</li><li>RH que quer envolver as pessoas na decisão</li></ul></div>
    <div><h4>Formato</h4><ul><li>Workshop presencial de meio período (~4h)</li><li>Até 40 futuros embaixadores</li><li>2 facilitadores studio.fh</li></ul></div>
  </div>
  <h4>Etapas</h4>
  <ol class="m-steps"><li><b>Pesquisa rápida de causas</b> com todo o time (5 min, 1 semana no ar).</li><li><b>Convocação e seleção</b> dos embaixadores (convite aberto + indicação dos líderes).</li><li><b>Workshop de co-criação</b>: "minha causa" → mapa coletivo de causas → priorização → compromissos.</li><li><b>Carta de Propósito + plano de causas 2027</b>: 1 página com 2–3 causas prioritárias e as primeiras ações.</li><li><b>Kit do embaixador + relatório final</b>.</li></ol>
  <h4>Roteiro do workshop (4h)</h4>
  <table class="m-table"><tr><td>0:00</td><td>Abertura: por que propósito importa para o negócio</td></tr><tr><td>0:20</td><td>"Minha causa": dinâmica individual e em duplas</td></tr><tr><td>0:50</td><td>Mapa de causas coletivo (resultado da pesquisa + o que surgiu na sala)</td></tr><tr><td>1:30</td><td>Priorização com votação: impacto × conexão com o negócio × energia do time</td></tr><tr><td>2:00</td><td>Intervalo</td></tr><tr><td>2:15</td><td>Squads por causa desenham as primeiras ações de 2027</td></tr><tr><td>3:15</td><td>Compromissos públicos + leitura da Carta de Propósito</td></tr><tr><td>3:40</td><td>Fechamento e foto oficial dos embaixadores</td></tr></table>
  <p class="m-tip"><b>Gancho de upsell:</b> o plano de 2027 já nasce com ações. A primeira delas pode ser um Hub de Impacto ou um programa contínuo de voluntariado studio.fh.</p>
</div>

<div class="m-prod m-prod--hl">
  <div class="m-prod__head"><span>03 · Transformar</span><h3>Hub de Impacto</h3><b>R$ 50 mil</b></div>
  <p><b>Em uma frase:</b> o team building que deixa legado. Em vez de massa de pizza, o time usa o que sabe fazer de melhor para resolver desafios reais de ONGs, num formato de lab de 1 dia.</p>
  <div class="m-grid m-grid--2">
    <div><h4>Para quem</h4><ul><li>Empresas que querem desenvolver soft skills e liderança</li><li>Times com silos, turnover ou clima em queda</li><li>Quem já tem programa e quer subir o nível</li><li>Quem precisa de relatório de impacto/ESG robusto</li></ul></div>
    <div><h4>Formato</h4><ul><li>1 dia (~6h), presencial</li><li>Até 60 colaboradores em squads de 5 a 6</li><li>3 a 5 ONGs com desafios reais</li><li>Facilitadores + mentores studio.fh</li></ul></div>
  </div>
  <h4>Etapas</h4>
  <ol class="m-steps"><li><b>Curadoria das ONGs</b> alinhadas às causas e ao território da empresa.</li><li><b>Seleção dos desafios</b> (marketing, finanças, processos, tecnologia, captação…) validados com as ONGs.</li><li><b>Design conjunto</b> da sessão com o RH: squads, mix de áreas, agenda, local.</li><li><b>O dia do Hub</b>: imersão, mão na massa com mentoria, pitch das soluções para as ONGs.</li><li><b>Relatório final</b>: participantes, horas, soluções entregues, ODS, depoimentos, fotos.</li></ol>
  <h4>Agenda do dia (6h)</h4>
  <table class="m-table"><tr><td>9:00</td><td>Abertura: a causa, as ONGs e as regras do jogo</td></tr><tr><td>9:30</td><td>ONGs apresentam seus desafios ao vivo</td></tr><tr><td>10:00</td><td>Squads mistos: entendimento do problema com a ONG</td></tr><tr><td>11:00</td><td>Mão na massa com mentoria (almoço no meio)</td></tr><tr><td>14:00</td><td>Refino e preparação do pitch</td></tr><tr><td>15:00</td><td>Pitch das soluções para as ONGs</td></tr><tr><td>15:45</td><td>Celebração, entrega simbólica e compromisso</td></tr></table>
  <p><b>Não inclui:</b> espaço e alimentação (podemos indicar), deslocamento fora da Grande SP, implementação das soluções após o dia. <span class="m-todo">confirmar o que entra no preço: espaço? coffee? brindes?</span></p>
</div>

<h3>Combos</h3>
<table class="m-table"><tr><th>Combo</th><th>Quando oferecer</th><th>Preço</th></tr>
<tr><td>Talk (todo o time) + Hub (grupo de 60)</td><td>Empresa grande que quer engajar todo mundo e aprofundar com um grupo</td><td>R$ 55 mil <span class="m-todo">validar</span></td></tr>
<tr><td>Talk + Jornada de Embaixadores</td><td>Abre para todos e já forma os embaixadores com quem levantou a mão</td><td>R$ 36 mil <span class="m-todo">validar</span></td></tr></table>`,
  },
  {
    id: "icp",
    titulo: "Quem compra e com quem falar",
    html: `
<div class="m-grid m-grid--2">
<div class="m-card"><h4>Empresa ideal</h4><ul><li>100+ colaboradores (para o Hub, 300+)</li><li>Tem RH/People estruturado e alguma pauta ESG</li><li>Já faz ação de fim de ano (confraternização, campanha solidária)</li><li>Sede ou operação relevante na Grande SP</li><li>Sinais quentes: pesquisa de clima recente, vagas em aberto, relatório de sustentabilidade, post sobre voluntariado</li></ul></div>
<div class="m-card"><h4>Quem decide e quem influencia</h4><ul><li><b>Decisor:</b> Diretor(a) de RH/People, Head de Cultura, Diretor(a) de Sustentabilidade/ESG</li><li><b>Influenciador:</b> Comunicação Interna, Endomarketing, Instituto/Fundação da empresa</li><li><b>Libera o dinheiro:</b> Financeiro/Compras. Pergunte cedo como funciona cadastro de fornecedor.</li></ul></div>
</div>
<h3>Pitch em 30 segundos</h3>
<blockquote>"Todo fim de ano as empresas fazem a mesma confraternização, que diverte por uma noite e não muda nada em janeiro. A gente propõe usar o Dia Internacional do Voluntariado, 05/12, para construir cultura de verdade: em um dia, seu time resolve desafios reais de ONGs, ou co-cria as causas da empresa, ou começa a conversa com um talk. Escopo fechado, a gente opera tudo, e o investimento entra no orçamento de 2026."</blockquote>`,
  },
  {
    id: "reuniao",
    titulo: "Roteiro da reunião (show and tell, 30 min)",
    html: `
<p class="m-lead">A reunião é <b>conduzida pela apresentação interativa</b> (aba Apresentação). O lead não assiste: ele <b>participa</b>. O ponto alto é responder o Mapa de Propósito ao vivo e ver o formato ideal aparecer na tela.</p>
<table class="m-table">
<tr><th>Min</th><th>Momento</th><th>O que fazer</th></tr>
<tr><td>0–3</td><td>Abertura</td><td>Agradeça, confirme o tempo e combine o objetivo: "sair daqui sabendo qual formato faz sentido e se dá tempo para dezembro".</td></tr>
<tr><td>3–8</td><td>Descoberta</td><td>2 ou 3 perguntas abertas (abaixo). Escute mais, fale menos. Anote as palavras que o cliente usa: você vai devolvê-las na proposta.</td></tr>
<tr><td>8–10</td><td>A dor + por que agora</td><td>Slides do problema e do 05/12. Conecte com o que ele acabou de falar.</td></tr>
<tr><td>10–15</td><td><b>Mapa ao vivo</b></td><td>Compartilhe a tela e peça para ele escolher as respostas. Se ele já fez o Mapa na LP, revise as respostas junto ("ainda faz sentido?").</td></tr>
<tr><td>15–22</td><td>Como seria o seu dia</td><td>Mostre o formato indicado passo a passo: etapas, agenda do dia, o que o time vive, o que sai no relatório. Use o nome da empresa e as causas que ele citou.</td></tr>
<tr><td>22–26</td><td>Investimento e prazos</td><td>Apresente o preço do formato indicado (e o combo, se fizer sentido). Mostre a linha do tempo até o dia e o prazo do bônus (05/11).</td></tr>
<tr><td>26–30</td><td>Próximo passo</td><td>Feche um compromisso com data: "posso te mandar a proposta hoje e a gente conversa quinta com quem aprova?". Nunca termine sem data marcada.</td></tr>
</table>
<h3>Perguntas de descoberta</h3>
<ul>
<li>"O que vocês costumam fazer no fim de ano com o time? O que funcionou e o que não funcionou?"</li>
<li>"Como está o clima hoje? Teve pesquisa recente? O que apareceu?"</li>
<li>"Se em janeiro alguém perguntar 'o que mudou depois daquela ação de dezembro?', o que você gostaria de responder?"</li>
<li>"Vocês já apoiam alguma causa ou ONG? Existe uma causa que tem a cara da empresa?"</li>
<li>"Ainda tem orçamento de 2026 para engajamento/cultura? Como funciona a aprovação?"</li>
<li>"Além de você, quem precisa estar nessa decisão?"</li>
</ul>`,
  },
  {
    id: "objecoes",
    titulo: "Objeções e como responder",
    html: `
<div class="m-obj"><b>"Está caro."</b><p>Compare com o que já gastam: uma confraternização para 60 pessoas custa facilmente R$ 20–40 mil e não deixa nada. Aqui o time se desenvolve, as ONGs recebem soluções reais e a empresa ganha relatório de impacto. Se o orçamento for o limite, desça um degrau da escada (Hub → Jornada → Talk) em vez de dar desconto.</p></div>
<div class="m-obj"><b>"Não tenho orçamento."</b><p>"É orçamento de 2026 ou de 2027?" Muitas áreas têm verba que vence em dezembro. Se não houver mesmo, o Talk (R$ 10 mil) costuma caber em verba de endomarketing ou evento.</p></div>
<div class="m-obj"><b>"Dezembro é muito corrido."</b><p>Por isso é 1 dia e a gente opera tudo. Do lado de vocês, só precisamos de um ponto focal e do espaço. E a data não precisa ser 05/12: executamos de 01 a 18/12.</p></div>
<div class="m-obj"><b>"Vou deixar para o ano que vem."</b><p>O 05/12 de 2026 é o Dia Internacional do Voluntariado no Ano Internacional do Voluntariado: não se repete. E começar 2027 com embaixadores e causas definidas adianta o ano inteiro.</p></div>
<div class="m-obj"><b>"Meu time não vai querer participar."</b><p>Por isso o formato é prático e com desafio real, não palestra motivacional. No Hub, o time usa as próprias habilidades e vê o resultado no mesmo dia. Mostre o case Mapfre ou Red Bull Bragantino.</p></div>
<div class="m-obj"><b>"Já fazemos campanha de doação."</b><p>Ótimo, já existe a vontade. A Jornada de Embaixadores transforma ações pontuais em um movimento com causas, donos e plano.</p></div>
<div class="m-obj"><b>"Preciso falar com meu chefe."</b><p>"Faz sentido. Quer que eu prepare um resumo de 1 página para ele, ou prefere marcar 20 min com nós dois?" Ofereça o link da apresentação (sem preço) e marque a data.</p></div>`,
  },
  {
    id: "negociacao",
    titulo: "Negociação e fechamento",
    html: `
<h3>Regras</h3>
<ul>
<li><b>Ancore no Hub.</b> Apresente sempre os 3 formatos; o Hub como referência faz a Jornada parecer acessível.</li>
<li><b>Troque, não dê.</b> Desconto só em troca de algo: fechar até 05/11, pagamento à vista, autorização para virar case, combo.</li>
<li><b>Desconto máximo:</b> <span class="m-todo">definir (sugestão: 10%, só com aprovação do Pedro)</span></li>
<li><b>Bônus até 05/11:</b> kit de comunicação interna (convite, lembretes e pós-evento) + prioridade na escolha da data.</li>
<li><b>Pagamento:</b> NF na assinatura, boleto 30 dias. Último fechamento: 17/11 para receber até 17/12. <span class="m-todo">validar condições (50/50? à vista?)</span></li>
</ul>
<h3>Checklist para fechar</h3>
<ol class="m-steps"><li>Formato e data escolhidos (data checada na agenda do Monday)</li><li>Proposta enviada em até 24h após a reunião</li><li>Cadastro de fornecedor iniciado (pergunte já na 1ª reunião)</li><li>Aceite / contrato assinado</li><li>NF emitida e enviada</li><li>Kick-off agendado</li></ol>`,
  },
  {
    id: "execucao",
    titulo: "Do fechamento à execução",
    html: `
<table class="m-table">
<tr><th>Quando</th><th>Hub de Impacto</th><th>Jornada de Embaixadores</th><th>Talk de Impacto</th></tr>
<tr><td>D-21</td><td>Kick-off com RH: causas, público, local</td><td>—</td><td>—</td></tr>
<tr><td>D-18</td><td>Shortlist de ONGs (2 por causa) para aprovação</td><td>—</td><td>—</td></tr>
<tr><td>D-14</td><td>Desafios validados com as ONGs</td><td>Kick-off + pesquisa de causas no ar</td><td>—</td></tr>
<tr><td>D-10</td><td>Design da sessão aprovado (squads, agenda)</td><td>Convocação dos embaixadores</td><td>—</td></tr>
<tr><td>D-7</td><td>Comunicação interna e inscrições</td><td>Resultado da pesquisa + lista de embaixadores</td><td>Briefing (30 min)</td></tr>
<tr><td>D-3</td><td>Briefing de facilitadores, mentores e ONGs; materiais</td><td>Materiais do workshop</td><td>Talk personalizado e enquete prontos</td></tr>
<tr><td>D0</td><td>O dia do Hub</td><td>Workshop</td><td>Talk</td></tr>
<tr><td>D+15</td><td>Relatório de impacto</td><td>Carta de Propósito + plano 2027 + relatório</td><td>Resumo executivo + mapa de interesse</td></tr>
<tr><td>D+30</td><td colspan="3">Conversa de resultados e proposta de continuidade para 2027</td></tr>
</table>`,
  },
  {
    id: "mensagens",
    titulo: "Mensagens prontas",
    html: `
<h4>Primeiro contato com lead da LP (WhatsApp, em até 2h úteis)</h4>
<pre>Oi, {nome}! Aqui é {seu nome}, do studio.fh. Vi que você fez o Mapa de Propósito da {empresa}: deu {formato indicado}. Posso te mostrar em 30 min como ficaria o 5.12 de vocês? Tenho {dia} às {hora} ou {dia} às {hora}.</pre>
<h4>Prospecção ativa (LinkedIn / e-mail)</h4>
<pre>{nome}, 05/12 é o Dia Internacional do Voluntariado, e 2026 é o Ano Internacional do Voluntariado da ONU. Estamos ajudando empresas a trocar a confraternização de fim de ano por 1 dia que constrói cultura de verdade: o time resolve desafios reais de ONGs. Faz sentido para a {empresa}? Em 2 min dá para ver o formato ideal: studio.freehelper.com.br/cincodoze</pre>
<h4>Pós-reunião (no mesmo dia)</h4>
<pre>{nome}, obrigado pela conversa! Como combinamos, segue a proposta do {formato} para {data}. Lembrando que até 05/11 entra o kit de comunicação interna e vocês escolhem a data antes. Falamos {dia combinado}?</pre>
<h4>Follow-up de urgência (a partir de 10/11)</h4>
<pre>{nome}, passando porque a agenda de dezembro está fechando: o último dia para garantir uma data é 17/11. Quer que eu segure {data} para vocês até sexta?</pre>`,
  },
];

module.exports = { precos: PRECOS, secoes: SECOES };
