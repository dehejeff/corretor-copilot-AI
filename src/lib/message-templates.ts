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
  cobrar_documentacao: [
    {
      tone: "Mais consultivo",
      template:
        "Olá, [Nome do lead]. Para conseguirmos avançar com sua análise com mais segurança, você consegue me enviar a documentação pendente? Se quiser, eu também posso te orientar item por item.",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Passando para te ajudar com a documentação que falta. Quer que eu te mande a lista organizada para facilitar o envio?",
    },
    {
      tone: "Mais direto",
      template:
        "Boa tarde, [Nome do lead]. Para seguirmos com seu processo, preciso receber a documentação pendente. Consegue me encaminhar ainda hoje ou prefere que eu te lembre em outro horário?",
    },
    {
      tone: "Mais objetivo",
      template:
        "Oi, [Nome do lead]. Assim que você me enviar os documentos pendentes, eu consigo dar sequência no processo sem perder tempo.",
    },
  ],
  documentacao_pronta_analise: [
    {
      tone: "Mais consultivo",
      template:
        "Olá, [Nome do lead]. Sua documentação está organizada e a pasta está pronta para eu subir na imobiliária. Posso seguir com isso agora para aguardarmos o retorno da análise?",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Deixei sua pasta organizada para subir na imobiliária. Se estiver tudo certo para você, já posso encaminhar e acompanhar o retorno da análise.",
    },
    {
      tone: "Mais direto",
      template:
        "Boa tarde, [Nome do lead]. Sua pasta está pronta. Quer que eu suba os documentos na imobiliária agora para aguardarmos o retorno da análise?",
    },
  ],
  analise_condicionada: [
    {
      tone: "Mais consultivo",
      template:
        "Olá, [Nome do lead]. A imobiliária analisou sua pasta e o retorno veio condicionado, então ainda precisamos complementar algumas informações para validar sua aptidão e o financiamento. Posso te explicar com calma os próximos ajustes?",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Recebi o retorno da imobiliária e tivemos algumas pendências complementares na sua pasta. Fica tranquilo que eu te ajudo a organizar isso para reenviarmos da forma certa.",
    },
    {
      tone: "Mais direto",
      template:
        "Boa tarde, [Nome do lead]. A imobiliária voltou com condicionantes e precisamos complementar a pasta. Posso te passar agora exatamente o que falta?",
    },
  ],
  analise_aprovada: [
    {
      tone: "Mais consultivo",
      template:
        "Olá, [Nome do lead]. Tenho uma boa notícia: a imobiliária aprovou sua análise. Quer que eu te explique os próximos passos e a condição de financiamento liberada para avançarmos com segurança?",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Sua análise foi aprovada, parabéns. Se quiser, já posso te orientar sobre a próxima etapa e a faixa de financiamento liberada para não perdermos ritmo.",
    },
    {
      tone: "Mais direto",
      template:
        "Boa tarde, [Nome do lead]. A imobiliária aprovou sua análise e já temos o retorno sobre sua aptidão. Podemos avançar agora para os próximos passos do processo?",
    },
  ],
  analise_reprovada: [
    {
      tone: "Mais consultivo",
      template:
        "Olá, [Nome do lead]. Recebi o retorno da imobiliária e, neste momento, sua análise não foi aprovada. Quero te explicar com clareza o cenário e ver com você quais alternativas ainda fazem sentido.",
    },
    {
      tone: "Mais acolhedor",
      template:
        "Oi, [Nome do lead]. Tivemos um retorno negativo da imobiliária na análise atual, mas isso não significa que ficamos sem caminhos. Posso te explicar com calma o que aconteceu e o que ainda podemos avaliar?",
    },
    {
      tone: "Mais direto",
      template:
        "Boa tarde, [Nome do lead]. A análise atual foi reprovada. Se fizer sentido, posso te passar o motivo e avaliar com você alternativas possíveis para o próximo passo.",
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
