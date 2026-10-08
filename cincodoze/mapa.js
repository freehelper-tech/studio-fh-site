/* ============================================================
   Campanha 5.12 — Mapa de Propósito
   Lógica compartilhada: LP (/cincodoze/) e apresentação de reunião.
   Cada alternativa soma pontos para os 3 formatos:
     T = Talk de Impacto · E = Jornada de Embaixadores · L = Hub de Impacto
   ============================================================ */
(function (global) {
  "use strict";

  const FORMATOS = {
    T: {
      id: "talk",
      nome: "Talk de Impacto",
      nivel: "Despertar",
      duracao: "60 a 90 min",
      frase: "Plante a semente: abra a conversa sobre propósito com o time inteiro.",
      porque: "Seu time ainda está no começo da conversa sobre impacto. O passo certo agora é inspirar, criar repertório e descobrir quem quer puxar o movimento em 2027.",
    },
    E: {
      id: "embaixadores",
      nome: "Jornada de Embaixadores",
      nivel: "Mobilizar",
      duracao: "meio período",
      frase: "Co-crie com o time as causas da empresa e forme quem vai liderar o movimento.",
      porque: "Já existe vontade, mas falta direção e dono. O passo certo é co-criar as causas da empresa com quem está na linha de frente e sair com embaixadores e um plano para 2027.",
    },
    L: {
      id: "hub",
      nome: "Hub de Impacto",
      nivel: "Transformar",
      duracao: "1 dia",
      frase: "O team building que deixa legado: seu time resolve desafios reais de ONGs.",
      porque: "Seu time está pronto para colocar a mão na massa. O passo certo é um dia de imersão em que as competências do time viram entregas reais para ONGs, com relatório de impacto no final.",
    },
  };

  const PERGUNTAS = [
    {
      id: "desafio",
      titulo: "Qual é o maior desafio do seu time hoje?",
      opcoes: [
        { id: "clima", txt: "Engajamento e clima em queda", pts: { E: 2, L: 1 }, motivo: "clima e engajamento pedem participação ativa, não só discurso" },
        { id: "turnover", txt: "Turnover: gente boa indo embora", pts: { L: 2, E: 1 }, motivo: "quem vive propósito no trabalho tem mais motivo pra ficar" },
        { id: "silos", txt: "Áreas desconectadas, cada um no seu quadrado", pts: { L: 2, E: 1 }, motivo: "squads mistos resolvendo um problema real quebram silos rápido" },
        { id: "causa", txt: "Falta uma causa que una todo mundo", pts: { T: 2, E: 2 }, motivo: "antes de agir, o time precisa enxergar uma causa em comum" },
        { id: "skills", txt: "Desenvolver soft skills e liderança", pts: { L: 3 }, motivo: "desafio real de ONG é o melhor laboratório de liderança" },
      ],
    },
    {
      id: "pessoas",
      titulo: "Quantas pessoas você quer envolver no dia?",
      opcoes: [
        { id: "ate40", txt: "Até 40 pessoas", pts: { L: 2, E: 1 } },
        { id: "40a150", txt: "De 40 a 150", pts: { E: 2, L: 1, T: 1 } },
        { id: "150a500", txt: "De 150 a 500", pts: { T: 2, E: 1 } },
        { id: "500mais", txt: "Mais de 500", pts: { T: 3 } },
      ],
    },
    {
      id: "tempo",
      titulo: "Quanto da agenda do time dá pra dedicar?",
      opcoes: [
        { id: "1h", txt: "1 a 2 horas", pts: { T: 3 }, motivo: "cabe na agenda de qualquer fim de ano" },
        { id: "meio", txt: "Meio período", pts: { E: 3 }, motivo: "meio período é o tempo ideal para uma co-criação de verdade" },
        { id: "dia", txt: "Um dia inteiro", pts: { L: 3 }, motivo: "um dia inteiro permite sair com entregas prontas" },
      ],
    },
    {
      id: "saida",
      titulo: "O que precisa sair disso?",
      opcoes: [
        { id: "inspirar", txt: "Inspirar o time e abrir a conversa sobre propósito", pts: { T: 3 } },
        { id: "plano", txt: "Um grupo de embaixadores e um plano de causas para 2027", pts: { E: 3 } },
        { id: "entregas", txt: "Entregas reais para ONGs e um relatório de impacto", pts: { L: 3 } },
      ],
    },
    {
      id: "maturidade",
      titulo: "Como está o voluntariado na sua empresa?",
      opcoes: [
        { id: "nunca", txt: "Nunca fizemos nada estruturado", pts: { T: 2, E: 1 } },
        { id: "pontual", txt: "Fazemos ações pontuais (campanhas, doações)", pts: { E: 2, L: 1 } },
        { id: "programa", txt: "Já temos um programa e queremos subir o nível", pts: { L: 2, E: 1 } },
      ],
    },
  ];

  /** respostas: { [perguntaId]: opcaoId } → { chave, formato, pontos, motivos } */
  function calcular(respostas) {
    const pontos = { T: 0, E: 0, L: 0 };
    const motivos = [];
    PERGUNTAS.forEach((p) => {
      const op = p.opcoes.find((o) => o.id === respostas[p.id]);
      if (!op) return;
      Object.entries(op.pts).forEach(([k, v]) => (pontos[k] += v));
      if (op.motivo) motivos.push(op.motivo);
    });
    // empate → formato mais completo
    const chave = ["L", "E", "T"].reduce((best, k) => (pontos[k] > pontos[best] ? k : best), "L");
    return { chave, formato: FORMATOS[chave], pontos, motivos };
  }

  global.MapaProposito = { FORMATOS, PERGUNTAS, calcular };
})(typeof window !== "undefined" ? window : globalThis);
