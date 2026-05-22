import type { Lead, MessageOption, MessageType, Profile } from "@/lib/types";

type MessageTemplate = {
  tone: string;
  template: string;
};

type TemplateDictionary = Record<MessageType, MessageTemplate[]>;

const templateDictionary: TemplateDictionary = {
  primeiro_contato: [
    {
      tone: "Mais consultivo",
      template:
        "Olá, [Nome do lead], tudo bem?\nMe chamo [Nome do corretor], sou consultor imobiliário especializado na região de [Região]. Vi seu interesse em [Tipo de imóvel] na faixa de [Faixa de preço]. Você pode me contar um pouco melhor o que faz mais sentido para você hoje?",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Oi, [Nome do lead], tudo certo?\nSou [Nome do corretor], consultor imobiliário aqui da região de [Região]. Recebi seu contato sobre imóveis em [Bairro] e queria entender: você está buscando algo para morar, investir ou ainda está avaliando possibilidades?",
    },
    {
      tone: "Mais direto",
      template:
        "Boa tarde, [Nome do lead].\nAqui é [Nome do corretor], consultor especializado em imóveis na região de [Região]. Você ainda está buscando [Tipo de imóvel] nessa faixa de valor?",
    },
    {
      tone: "Mais comercial",
      template:
        "Olá, [Nome do lead].\nSou [Nome do corretor], consultor imobiliário em [Região]. Entraram algumas oportunidades interessantes de [Tipo de imóvel] em [Bairro]. Quer que eu te mostre opções que combinem com o que você procura?",
    },
    {
      tone: "Mais objetivo",
      template:
        "Oi, [Nome do lead].\nMeu nome é [Nome do corretor] e trabalho com imóveis na região de [Região]. Posso te fazer algumas perguntas rápidas para entender o perfil do imóvel que você busca e te enviar opções mais alinhadas?",
    },
  ],
  followup_d1: [
    {
      tone: "Mais consultivo",
      template:
        "Olá, [Nome do lead]. Conseguiu pensar melhor sobre as opções que conversamos?",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Passando para saber se ainda faz sentido para você continuar procurando imóvel em [Bairro].",
    },
    {
      tone: "Mais direto",
      template:
        "Boa tarde, [Nome do lead]. Ainda está buscando [Tipo de imóvel] nessa faixa de valor?",
    },
    {
      tone: "Mais comercial",
      template:
        "Olá, [Nome do lead]. Surgiram algumas opções novas hoje e lembrei do seu perfil.",
    },
    {
      tone: "Mais objetivo",
      template:
        "Oi, [Nome do lead]. Me avisa se quiser que eu continue te enviando oportunidades dentro do que procura.",
    },
  ],
  followup_d3: [
    {
      tone: "Mais consultivo",
      template:
        "Olá, [Nome do lead]. Separei algumas possibilidades interessantes e queria entender se sua busca continua ativa.",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Imagino que a correria do dia a dia atrapalhe um pouco, mas sigo à disposição para te ajudar no que precisar.",
    },
    {
      tone: "Mais direto",
      template:
        "Boa tarde, [Nome do lead]. Você chegou a avançar na procura do imóvel ou ainda está avaliando opções?",
    },
    {
      tone: "Mais comercial",
      template:
        "Olá, [Nome do lead]. Entrou uma oportunidade em [Bairro] com ótimo custo-benefício.",
    },
    {
      tone: "Mais objetivo",
      template:
        "Oi, [Nome do lead]. Caso queira, posso filtrar apenas opções mais alinhadas ao seu orçamento.",
    },
  ],
  followup_d7: [
    {
      tone: "Mais consultivo",
      template:
        "Olá, [Nome do lead]. Passando para entender se sua procura por imóvel continua neste momento.",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Sei que essa decisão exige calma. Quando quiser retomar, estou à disposição.",
    },
    {
      tone: "Mais direto",
      template:
        "Boa tarde, [Nome do lead]. Ainda faz sentido eu continuar te enviando oportunidades?",
    },
    {
      tone: "Mais comercial",
      template:
        "Olá, [Nome do lead]. Algumas condições de financiamento mudaram esta semana e talvez isso possa te ajudar.",
    },
    {
      tone: "Mais objetivo",
      template:
        "Oi, [Nome do lead]. Se quiser, posso te atualizar apenas quando surgir algo realmente dentro do seu perfil.",
    },
  ],
  recuperacao_lead_frio: [
    {
      tone: "Mais consultivo",
      template:
        "Olá, [Nome do lead]. Faz um tempo que conversamos e queria saber se seus planos de compra continuam.",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Passei aqui porque lembrei da sua busca e queria saber como estão as coisas por aí.",
    },
    {
      tone: "Mais direto",
      template:
        "Boa tarde, [Nome do lead]. Você ainda pensa em comprar imóvel este ano?",
    },
    {
      tone: "Mais comercial",
      template:
        "Olá, [Nome do lead]. Surgiram novas oportunidades em [Bairro] e achei que poderia te interessar.",
    },
    {
      tone: "Mais objetivo",
      template:
        "Oi, [Nome do lead]. Se ainda estiver buscando imóvel, consigo te atualizar com opções mais recentes.",
    },
  ],
  convite_visita: [
    {
      tone: "Escritório · Mais consultivo",
      template:
        "Olá, [Nome do lead]. Acho que uma visita ao escritório pode ser útil para alinharmos seu momento, financiamento e próximos passos com calma. Quer agendar esse encontro?",
    },
    {
      tone: "Escritório · Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Se fizer sentido para você, podemos marcar uma visita ao escritório para conversar com tranquilidade sobre opções, processo e próximos passos.",
    },
    {
      tone: "Escritório · Mais objetivo",
      template:
        "Boa tarde, [Nome do lead]. Faz sentido agendarmos uma visita ao escritório para alinhar perfil, valores e estratégia da sua compra?",
    },
    {
      tone: "Empreendimento · Mais consultivo",
      template:
        "Olá, [Nome do lead]. Acho que vale a pena você conhecer este imóvel pessoalmente. Quer agendar uma visita?",
    },
    {
      tone: "Empreendimento · Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Tenho um horário livre esta semana caso queira visitar o imóvel com calma.",
    },
    {
      tone: "Empreendimento · Mais direto",
      template:
        "Boa tarde, [Nome do lead]. Podemos marcar uma visita para você avaliar melhor o imóvel.",
    },
    {
      tone: "Empreendimento · Mais comercial",
      template:
        "Olá, [Nome do lead]. Este imóvel tem tido bastante procura e acredito que uma visita faria sentido antes de qualquer decisão.",
    },
    {
      tone: "Empreendimento · Mais objetivo",
      template:
        "Oi, [Nome do lead]. Qual é o melhor dia para você visitar o imóvel?",
    },
  ],
  objecao_preco: [
    {
      tone: "Mais consultivo",
      template:
        "Entendo seu ponto, [Nome do lead]. Hoje muitos clientes estão comparando bastante antes de decidir. O diferencial deste imóvel acaba sendo localização e condição.",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Claro, [Nome do lead]. É importante que a compra faça sentido financeiramente para você.",
    },
    {
      tone: "Mais direto",
      template:
        "Boa tarde, [Nome do lead]. Dependendo da negociação, talvez exista margem para ajuste.",
    },
    {
      tone: "Mais comercial",
      template:
        "Entendo. Comparando com imóveis parecidos em [Bairro], este acaba ficando competitivo pelo padrão e pela localização.",
    },
    {
      tone: "Mais objetivo",
      template:
        "Posso tentar encontrar uma condição mais alinhada ao valor que você pretende investir.",
    },
  ],
  vou_pensar: [
    {
      tone: "Mais consultivo",
      template:
        "Perfeito, [Nome do lead]. É uma decisão importante mesmo. Qualquer dúvida que surgir, pode me chamar.",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Claro, sem problema. O importante é você tomar a decisão com segurança.",
    },
    {
      tone: "Mais direto",
      template:
        "Sem problemas. Quer que eu te deixe atualizado caso apareça algo parecido?",
    },
    {
      tone: "Mais comercial",
      template:
        "Combinado. Só me avisa porque algumas oportunidades acabam saindo rápido.",
    },
    {
      tone: "Mais objetivo",
      template:
        "Tudo certo. Fico à disposição caso queira retomar depois.",
    },
  ],
  simulacao_financiamento: [
    {
      tone: "Mais consultivo",
      template:
        "Claro, [Nome do lead]. Me passa uma média da sua renda e o valor de entrada que consigo te orientar melhor.",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Perfeito. A simulação ajuda bastante a entender o cenário antes de avançar.",
    },
    {
      tone: "Mais direto",
      template:
        "Consigo simular para você. Tem ideia de quanto pretende dar de entrada?",
    },
    {
      tone: "Mais comercial",
      template:
        "Dependendo do perfil, dá para conseguir condições bem interessantes hoje.",
    },
    {
      tone: "Mais objetivo",
      template:
        "Me envia renda aproximada e valor de entrada que faço uma estimativa para você.",
    },
  ],
  pos_visita: [
    {
      tone: "Escritório · Mais consultivo",
      template:
        "Olá, [Nome do lead]. Queria entender como você se sentiu depois da nossa reunião no escritório e se faz sentido avançarmos para o próximo passo.",
    },
    {
      tone: "Escritório · Mais objetivo",
      template:
        "Oi, [Nome do lead]. Depois da nossa visita ao escritório, ficou alguma dúvida sobre processo, documentação ou financiamento que eu possa te ajudar a resolver?",
    },
    {
      tone: "Empreendimento · Mais consultivo",
      template:
        "Olá, [Nome do lead]. Gostaria de entender sua percepção sobre o imóvel após a visita.",
    },
    {
      tone: "Empreendimento · Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Foi um prazer te acompanhar hoje. O que achou do imóvel?",
    },
    {
      tone: "Empreendimento · Mais direto",
      template:
        "Boa tarde, [Nome do lead]. O imóvel ficou dentro do que você imaginava?",
    },
    {
      tone: "Empreendimento · Mais comercial",
      template:
        "Olá, [Nome do lead]. Achei que o imóvel combinou bastante com o perfil que você comentou.",
    },
    {
      tone: "Empreendimento · Mais objetivo",
      template:
        "Me fala sinceramente o que gostou e o que não gostou para eu conseguir te direcionar melhor.",
    },
  ],
  fechamento: [
    {
      tone: "Mais consultivo",
      template:
        "[Nome do lead], acredito que conseguimos chegar em uma condição muito alinhada ao que você buscava.",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Fico feliz que tenha gostado do imóvel. Vamos seguir com os próximos passos?",
    },
    {
      tone: "Mais direto",
      template:
        "Se fizer sentido para você, podemos iniciar a documentação.",
    },
    {
      tone: "Mais comercial",
      template:
        "Esta pode ser uma excelente oportunidade dentro da região de [Região].",
    },
    {
      tone: "Mais objetivo",
      template:
        "Quer que eu já separe a documentação para avançarmos?",
    },
  ],
};

function getFirstName(value?: string | null) {
  return value?.trim().split(" ")[0] || "Consultor";
}

function buildTemplateContext(lead: Lead, profile: Profile) {
  const region = lead.neighborhood || profile.company_name || "sua região";
  const neighborhood = lead.neighborhood || region;
  const visitType = lead.visit_type === "Escritório" ? "visita ao escritório" : "visita ao empreendimento";

  return {
    "[Nome do lead]": getFirstName(lead.name),
    "[Nome do corretor]": getFirstName(profile.name || profile.email),
    "[Região]": region,
    "[Bairro]": neighborhood,
    "[Tipo de imóvel]": lead.property_type || "imóvel",
    "[Faixa de preço]": lead.price_range || "faixa alinhada ao seu perfil",
    "[Tipo de visita]": visitType,
  };
}

function replacePlaceholders(template: string, context: Record<string, string>) {
  return Object.entries(context).reduce(
    (result, [key, value]) => result.replaceAll(key, value),
    template,
  );
}

export function buildMessageOptions(
  lead: Lead,
  profile: Profile,
  messageType: MessageType,
): MessageOption[] {
  const context = buildTemplateContext(lead, profile);

  return templateDictionary[messageType].map((option, index) => ({
    id: `${messageType}_${index + 1}`,
    tone: option.tone,
    message: replacePlaceholders(option.template, context),
  }));
}
