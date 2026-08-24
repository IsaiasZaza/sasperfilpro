import type { ApiTheme } from "@/lib/theme";
import type { BlockType } from "@/lib/types/profile";

export type TemplateBlock = {
  type: BlockType;
  content: Record<string, unknown>;
};

export type TemplateService = {
  name: string;
  description?: string;
  priceCents: number;
};

export type TemplateTestimonial = {
  authorName: string;
  text: string;
  rating: number;
};

export type PageTemplate = {
  id: string;
  label: string;
  /** Para quem é o modelo, em linguagem de cliente. */
  audience: string;
  tagline: string;
  theme: ApiTheme;
  blocks: TemplateBlock[];
  services?: TemplateService[];
  testimonials?: TemplateTestimonial[];
};

const WHATSAPP_MESSAGE = "Oi! Vi sua página e quero saber mais.";

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: "beleza",
    label: "Beleza e estética",
    audience: "Salão, barbearia, unhas, sobrancelhas",
    tagline: "Serviços com preço, depoimentos e agenda no WhatsApp.",
    theme: {
      backgroundColor: "#f4efe6",
      textColor: "#3b2f27",
      primaryColor: "#9a7048",
      buttonStyle: "pill",
      font: "sans",
      atmosphere: "none",
    },
    blocks: [
      {
        type: "HERO",
        content: {
          name: "",
          headline: "Atendimento com hora marcada",
          bio: "Sem fila e sem pressa. Escolha o serviço e chame no WhatsApp.",
          avatarSize: "lg",
        },
      },
      {
        type: "WHATSAPP",
        content: {
          phone: "",
          message: WHATSAPP_MESSAGE,
          label: "Agendar no WhatsApp",
          pulse: true,
        },
      },
      { type: "SERVICES", content: { heading: "Serviços e preços" } },
      { type: "TESTIMONIALS", content: { heading: "O que dizem" } },
      {
        type: "SOCIAL",
        content: {
          layout: "icons",
          items: [
            { network: "instagram", url: "https://instagram.com/" },
            { network: "tiktok", url: "https://www.tiktok.com/@" },
          ],
        },
      },
      {
        type: "LOCATION",
        content: { address: "", label: "Ver no mapa" },
      },
    ],
    services: [
      {
        name: "Corte e finalização",
        description: "Lavagem, corte e escova",
        priceCents: 9000,
      },
      {
        name: "Design de sobrancelhas",
        description: "Mapeamento facial",
        priceCents: 6000,
      },
      {
        name: "Coloração",
        description: "Retoque de raiz incluso",
        priceCents: 18000,
      },
    ],
    testimonials: [
      {
        authorName: "Juliana R.",
        text: "Melhor atendimento da região. Saí de lá me sentindo outra pessoa.",
        rating: 5,
      },
      {
        authorName: "Camila S.",
        text: "Pontual, cuidadosa e o resultado durou semanas.",
        rating: 5,
      },
    ],
  },
  {
    id: "saude",
    label: "Saúde e bem-estar",
    audience: "Personal, nutrição, fisioterapia, psicologia",
    tagline: "Planos, prova social e primeira consulta pelo WhatsApp.",
    theme: {
      backgroundColor: "#eef2ea",
      textColor: "#1f2a1c",
      primaryColor: "#3d5a40",
      buttonStyle: "rounded",
      font: "sans",
      atmosphere: "none",
    },
    blocks: [
      {
        type: "HERO",
        content: {
          name: "",
          headline: "Acompanhamento individual",
          bio: "Avaliação inicial, plano sob medida e ajustes toda semana.",
          avatarSize: "lg",
        },
      },
      {
        type: "WHATSAPP",
        content: {
          phone: "",
          message: "Oi! Quero agendar uma avaliação.",
          label: "Falar comigo",
          pulse: true,
        },
      },
      { type: "SERVICES", content: { heading: "Planos" } },
      { type: "TESTIMONIALS", content: { heading: "Resultados" } },
      {
        type: "SOCIAL",
        content: {
          layout: "icons",
          items: [{ network: "instagram", url: "https://instagram.com/" }],
        },
      },
    ],
    services: [
      {
        name: "Avaliação inicial",
        description: "Anamnese e metas",
        priceCents: 15000,
      },
      {
        name: "Acompanhamento mensal",
        description: "4 encontros e ajustes",
        priceCents: 48000,
      },
      {
        name: "Plano trimestral",
        description: "Melhor custo por sessão",
        priceCents: 129000,
      },
    ],
    testimonials: [
      {
        authorName: "Rafael M.",
        text: "Em três meses mudei minha rotina inteira. Acompanhamento muito próximo.",
        rating: 5,
      },
    ],
  },
  {
    id: "servicos",
    label: "Serviços e reformas",
    audience: "Elétrica, pintura, diarista, montagem",
    tagline: "Orçamento rápido, área de atendimento e avaliações.",
    theme: {
      backgroundColor: "#f0f4f8",
      textColor: "#0f2744",
      primaryColor: "#1e3a5f",
      buttonStyle: "rounded",
      font: "sans",
      atmosphere: "none",
    },
    blocks: [
      {
        type: "HERO",
        content: {
          name: "",
          headline: "Orçamento sem compromisso",
          bio: "Atendimento rápido, serviço com garantia e preço fechado antes de começar.",
          avatarSize: "md",
        },
      },
      {
        type: "WHATSAPP",
        content: {
          phone: "",
          message: "Oi! Quero um orçamento.",
          label: "Pedir orçamento",
          pulse: true,
        },
      },
      { type: "SERVICES", content: { heading: "O que eu faço" } },
      { type: "LOCATION", content: { address: "", label: "Área de atendimento" } },
      { type: "TESTIMONIALS", content: { heading: "Clientes atendidos" } },
    ],
    services: [
      {
        name: "Visita técnica",
        description: "Diagnóstico no local",
        priceCents: 8000,
      },
      {
        name: "Instalação simples",
        description: "Até 2 horas de serviço",
        priceCents: 15000,
      },
      {
        name: "Reparo completo",
        description: "Material à parte",
        priceCents: 35000,
      },
    ],
    testimonials: [
      {
        authorName: "Marcos A.",
        text: "Chegou na hora marcada, resolveu rápido e deixou tudo limpo.",
        rating: 5,
      },
    ],
  },
  {
    id: "imoveis",
    label: "Imóveis e vendas",
    audience: "Corretor, consultor, representante",
    tagline: "Catálogo, contato direto e região de atuação.",
    theme: {
      backgroundColor: "#111111",
      textColor: "#f5f5f5",
      primaryColor: "#ffffff",
      buttonStyle: "square",
      font: "sans",
      atmosphere: "none",
    },
    blocks: [
      {
        type: "HERO",
        content: {
          name: "",
          headline: "Imóveis selecionados",
          bio: "Te ajudo a encontrar, negociar e fechar sem dor de cabeça.",
          avatarSize: "md",
        },
      },
      {
        type: "WHATSAPP",
        content: {
          phone: "",
          message: "Oi! Quero ver os imóveis disponíveis.",
          label: "Falar com o corretor",
          pulse: true,
        },
      },
      {
        type: "LINK_BUTTON",
        content: {
          label: "Ver catálogo completo",
          subtitle: "Fotos e valores atualizados",
          url: "https://instagram.com/",
          icon: "auto",
        },
      },
      { type: "SERVICES", content: { heading: "Como eu trabalho" } },
      { type: "LOCATION", content: { address: "", label: "Região de atuação" } },
    ],
    services: [
      {
        name: "Assessoria na compra",
        description: "Busca, visitas e negociação",
        priceCents: 0,
      },
      {
        name: "Avaliação do seu imóvel",
        description: "Relatório de preço de mercado",
        priceCents: 0,
      },
    ],
  },
  {
    id: "criador",
    label: "Criador de conteúdo",
    audience: "Instagram, TikTok, YouTube, podcast",
    tagline: "Todas as redes, links do momento e parcerias.",
    theme: {
      backgroundColor: "#080612",
      textColor: "#fce7f3",
      primaryColor: "#ff2d95",
      buttonStyle: "pill",
      font: "sans",
      atmosphere: "cosmic",
    },
    blocks: [
      {
        type: "HERO",
        content: {
          name: "",
          headline: "Todos os meus links",
          bio: "Conteúdo novo toda semana. Escolhe por onde quer me acompanhar.",
          avatarSize: "lg",
        },
      },
      {
        type: "SOCIAL",
        content: {
          layout: "icons",
          items: [
            { network: "instagram", url: "https://instagram.com/" },
            { network: "tiktok", url: "https://www.tiktok.com/@" },
            { network: "youtube", url: "https://youtube.com/@" },
          ],
        },
      },
      {
        type: "LINK_BUTTON",
        content: {
          label: "Vídeo novo",
          subtitle: "Assista agora",
          url: "https://youtube.com/",
          icon: "auto",
        },
      },
      {
        type: "LINK_BUTTON",
        content: {
          label: "Meus produtos",
          subtitle: "Cupom na página",
          url: "https://instagram.com/",
          icon: "auto",
        },
      },
      {
        type: "CTA_BUTTON",
        content: {
          label: "Falar sobre parceria",
          url: "https://wa.me/",
          style: "primary",
        },
      },
    ],
  },
  {
    id: "consultoria",
    label: "Consultoria e aulas",
    audience: "Mentoria, aula particular, professor",
    tagline: "Pacotes, depoimentos e agendamento em um clique.",
    theme: {
      backgroundColor: "#faf6f2",
      textColor: "#2b211c",
      primaryColor: "#2b211c",
      buttonStyle: "pill",
      font: "serif",
      atmosphere: "none",
    },
    blocks: [
      {
        type: "HERO",
        content: {
          name: "",
          headline: "Aulas e mentoria individual",
          bio: "Plano de estudo sob medida, com material e acompanhamento.",
          avatarSize: "lg",
        },
      },
      {
        type: "CTA_BUTTON",
        content: {
          label: "Agendar conversa",
          url: "https://wa.me/",
          style: "primary",
        },
      },
      { type: "SERVICES", content: { heading: "Pacotes" } },
      { type: "TESTIMONIALS", content: { heading: "Depoimentos de alunos" } },
      {
        type: "LINK_BUTTON",
        content: {
          label: "Material gratuito",
          subtitle: "Baixe e comece hoje",
          url: "https://drive.google.com/",
          icon: "auto",
        },
      },
    ],
    services: [
      {
        name: "Aula individual",
        description: "1 hora, online",
        priceCents: 12000,
      },
      {
        name: "Pacote de 4 aulas",
        description: "Validade de 60 dias",
        priceCents: 44000,
      },
      {
        name: "Mentoria mensal",
        description: "Encontros semanais e material",
        priceCents: 89000,
      },
    ],
    testimonials: [
      {
        authorName: "Beatriz L.",
        text: "Aula direta ao ponto. Em um mês destravei o que travava há anos.",
        rating: 5,
      },
    ],
  },
];
