export const callStepLabels = [
  "Abertura",
  "Quebra de gelo",
  "Qualificação",
  "Diagnóstico",
  "Objeções",
  "Próximo passo",
  "Resumo e salvar",
] as const;

export type CallStepId =
  | "abertura"
  | "quebra_gelo"
  | "qualificacao"
  | "diagnostico"
  | "objecoes"
  | "proximo_passo"
  | "resumo";

export const callStepOrder: CallStepId[] = [
  "abertura",
  "quebra_gelo",
  "qualificacao",
  "diagnostico",
  "objecoes",
  "proximo_passo",
  "resumo",
];

export const callGuideSteps = {
  abertura: {
    title: "Step 1: Abertura",
    objective: "Criar conexão e explicar rapidamente o motivo da ligação.",
    scripts: [
      "Alô, [Nome do lead]? Tudo bem? Aqui é o [Nome do corretor]. Você demonstrou interesse em um imóvel na região de [Região] e resolvi te ligar rapidamente para entender melhor o que você procura.",
      "Oi, [Nome do lead]. Tudo certo? Meu nome é [Nome do corretor], sou corretor especializado em [Região]. Recebi seu contato sobre imóveis na região e queria entender melhor seu momento para conseguir te direcionar da forma certa.",
      "Boa tarde, [Nome do lead]. Aqui é o [Nome do corretor], corretor da região de [Região]. Vi seu interesse em [Tipo de imóvel] e queria fazer algumas perguntas rápidas para entender exatamente o que você busca.",
    ],
    questions: [],
  },
  quebra_gelo: {
    title: "Step 2: Quebra de gelo",
    objective: "Deixar a conversa mais natural antes de qualificar.",
    scripts: [],
    questions: [
      "Você já conhece bem essa região ou ainda está pesquisando?",
      "Hoje você está procurando mais para morar ou investir?",
      "Você já visitou algum imóvel recentemente?",
      "O que mais tem pesado na sua decisão hoje?",
    ],
  },
  qualificacao: {
    title: "Step 3: Qualificação",
    objective: "Entender perfil, orçamento e momento do lead.",
    scripts: [],
    questions: [
      "Você procura casa ou apartamento?",
      "Qual região faz mais sentido para você hoje?",
      "Existe uma faixa de valor que você quer manter?",
      "Você já possui valor de entrada?",
      "Pretende usar financiamento ou FGTS?",
      "Sua intenção é comprar mais rápido ou ainda está avaliando?",
    ],
  },
  diagnostico: {
    title: "Step 4: Diagnóstico",
    objective: "Entender motivação e dor do cliente.",
    scripts: [],
    questions: [
      "O que te motivou a começar essa busca agora?",
      "Hoje o que mais te incomoda no imóvel atual?",
      "O que seria o imóvel ideal para você?",
      "Qual ponto é inegociável para você em um imóvel?",
    ],
  },
  objecoes: {
    title: "Step 5: Objeções",
    objective: "Ajudar o corretor a responder objeções comuns durante a ligação.",
    scripts: [],
    questions: [],
  },
  proximo_passo: {
    title: "Step 6: Próximo passo",
    objective: "Conduzir para uma ação concreta.",
    scripts: [
      "Pelo que você comentou, acredito que consigo te direcionar para opções mais alinhadas e evitar que você perca tempo olhando imóvel fora do perfil.",
      "Tem um imóvel que acredito que pode fazer bastante sentido para você. Faz sentido agendarmos uma visita sem compromisso?",
      "Vou separar algumas opções mais alinhadas e te envio pelo WhatsApp.",
      "Qual melhor dia para você visitar com calma?",
    ],
    questions: [],
  },
  resumo: {
    title: "Step 7: Resumo e salvar",
    objective: "Registrar a ligação e atualizar o lead.",
    scripts: [],
    questions: [],
  },
} satisfies Record<
  CallStepId,
  {
    title: string;
    objective: string;
    scripts: string[];
    questions: string[];
  }
>;

export const leadMotivationOptions = [
  "Sair do aluguel",
  "Morar melhor",
  "Aumentar espaço",
  "Investimento",
  "Casamento/família",
  "Mudança de região",
  "Segurança",
  "Outro",
] as const;

export const callObjectionCards = [
  {
    key: "pesquisando",
    title: "Estou só pesquisando",
    response:
      "Perfeito. Inclusive essa é a melhor fase para entender o mercado com calma. Posso te ajudar filtrando o que realmente vale a pena.",
  },
  {
    key: "caro",
    title: "Está caro",
    response:
      "Entendo perfeitamente. Hoje muita gente está comparando bastante antes de decidir. O importante é avaliar custo-benefício, localização e condição de negociação.",
  },
  {
    key: "vou_pensar",
    title: "Vou pensar",
    response:
      "Claro, é uma decisão importante mesmo. Meu objetivo é te ajudar a tomar a melhor decisão, sem pressa. Posso continuar te atualizando caso apareça algo alinhado?",
  },
  {
    key: "sem_entrada",
    title: "Ainda não tenho entrada",
    response:
      "Isso é mais comum do que parece. Dependendo do caso, conseguimos avaliar possibilidades de financiamento, uso de FGTS e alternativas dentro do seu perfil.",
  },
  {
    key: "nao_posso_falar",
    title: "Não posso falar agora",
    response:
      "Sem problema. Qual é o melhor horário para eu te retornar rapidinho?",
  },
] as const;

export const nextActionOptions = [
  "Enviar opções por WhatsApp",
  "Agendar visita",
  "Fazer simulação de financiamento",
  "Retornar em outro horário",
  "Nutrir lead",
  "Marcar como sem interesse",
  "Atualizar dados do lead",
  "Encaminhar documentação",
  "Criar tarefa de follow-up",
] as const;

export const callResultOptions = [
  "Não atendeu",
  "Atendeu, mas sem interesse",
  "Atendeu e pediu retorno",
  "Atendeu e está pesquisando",
  "Lead qualificado",
  "Visita agendada",
  "Simulação solicitada",
  "Negociação iniciada",
  "Perdido",
] as const;

export function getCallStatusFromResult(result: string) {
  switch (result) {
    case "Visita agendada":
      return "Visita agendada";
    case "Negociação iniciada":
      return "Em negociação";
    case "Lead qualificado":
      return "Qualificado";
    case "Atendeu e está pesquisando":
      return "Respondeu";
    case "Atendeu e pediu retorno":
      return "Primeiro contato enviado";
    case "Atendeu, mas sem interesse":
    case "Perdido":
      return "Perdido";
    default:
      return "Respondeu";
  }
}

export function getCallSuggestionFallback(step: CallStepId, goal?: string, objection?: string) {
  if (step === "objecoes" && objection) {
    return `Entendi, faz sentido. Meu papel aqui é te ajudar sem pressão e encontrar o caminho mais seguro para o seu momento.`;
  }

  if (step === "proximo_passo" && goal) {
    return `Pelo que você me trouxe até aqui, acredito que o próximo passo mais útil é ${goal.toLowerCase()}.`;
  }

  if (step === "diagnostico") {
    return "Quero entender melhor o que realmente faria sentido para você, para não te direcionar para algo fora do perfil.";
  }

  if (step === "qualificacao") {
    return "Se eu alinhar melhor orçamento, região e prazo, consigo te mostrar opções muito mais assertivas.";
  }

  return "Perfeito. Me conta um pouco mais para eu conseguir te orientar da forma mais certeira possível.";
}
