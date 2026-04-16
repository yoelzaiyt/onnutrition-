import {
  searchFoods,
  getFoodById,
  getFoodsByCategory,
  calculateNutrition,
  scientificReferences,
  TacoEntry,
} from "../lib/taco";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface UserProfile {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: "lose_weight" | "maintain" | "gain_weight" | "muscle";
  restrictions?: string[];
  preferences?: string[];
}

function generateResponse(userMessage: string, profile: UserProfile): string {
  const message = userMessage.toLowerCase();

  if (message.includes("caloria") || message.includes("kcal")) {
    return `De acordo com a Tabela Brasileira de Composição de Alimentos (TACO - UNICAMP 2011), os alimentos têm sua composição calórica determinada principalmente por carboidratos, lipídios e proteínas. Para uma dieta equilibrada, recomendo consultar as necessidades energéticas individuais baseadas nas Dietary Reference Intakes (DRI - Institute of Medicine, 2011).`;
  }

  if (message.includes("proteina") || message.includes("proteína")) {
    return `As proteínas são essenciais para a construção muscular e manutenção dos tecidos. Segundo o Guide Alimentar para a População Brasileira (Ministério da Saúde, 2014), recomenda-se priorizar fontes proteicas magras como peixes, frango, ovos e leguminosas. A necessidade diária varia de 0,8 a 1,2g/kg de peso corporal, dependendo da atividade física.`;
  }

  if (message.includes("carboidrato") || message.includes("carb")) {
    return `Os carboidratos são a principal fonte de energia do organismo. Os cereais integrais (arroz integral, aveia, quinoa) são opções mais saudáveis por conterem fibras, que auxiliam no controle glicêmico e promovem saciedade. A recomendação é que 45-65% das calorias diárias venham de carboidratos (DRI, 2011).`;
  }

  if (message.includes("fibra") || message.includes("fibra")) {
    return `A fibra alimentar é essencial para a saúde intestinal e controle de glicemia. O Guide Alimentar recomenda mínimo 25g de fibra/dia para adultos. Boas fontes: farelo de aveia (50g = 10g fibras), feijão (100g = 7.9g fibras), frutas com bagaço.`;
  }

  if (message.includes("receita") || message.includes("receitas")) {
    return `Posso sugerir receitas baseadas na TACO! Por exemplo:\n\n🌿 **Salada Proteica**: 100g peito de frango grelhado (165kcal, 31g proteína) + 50g alface (7.5kcal, 0.7g proteína) + 30g tomate (5.4kcal) + 1 colher de sopa azeite (119kcal). Total: ~300kcal.\n\n🍳 **Omelete Nutritivo**: 2 ovos (155kcal, 26g proteína) + 1 tomate (18kcal) + 30g queijo mussarela (91kcal). Total: ~264kcal.`;
  }

  if (
    message.includes("emagrecer") ||
    message.includes("perder peso") ||
    message.includes("dieta")
  ) {
    const calories = profile.weight ? Math.round(25 * profile.weight) : 1800;
    return `Para perda de peso, recomendo um déficit calórico de 300-500kcal.Baseado no seu perfil${profile.weight ? ` (${profile.weight}kg)` : ""}, estimo necessidades de ~${calories}kcal/dia.\n\nDicas principais:\n1. Aumente o consumo de fibras (leguminosas, vegetais)\n2. Priorize proteínas magras (frango, peixe, ovo)\n3. Evite ultraprocessados ( Guia Alimentar, 2014)\n4. Beba 2L de água/dia\n5. Faça 5-6.refeições pequenas`;
  }

  if (
    message.includes("musculação") ||
    message.includes("músculo") ||
    message.includes("hipertrofia")
  ) {
    return `Para hipertrofia muscular, a ingestão proteica deve ser de 1.2-1.6g/kg de peso corporal (Jäger et al., 2017 - Position Stand ACSM).Boas fontes:\n\n🥩 Carnes magras: 100g frango = 31g proteína\n🥚 Ovos: 2 ovos = 26g proteína\n🐟 Salmão: 100g = 20g proteína\n🫘 Feijão: 100g = 8g proteína\n\nRecomendo distribuir em 4-5 refeições ao dia.`;
  }

  if (
    message.includes("vitamina") ||
    message.includes("mineral") ||
    message.includes("nutriente")
  ) {
    return `As vitaminas e minerais são essenciais para o metabolismo. Principais fontes:\n\n🍊 Ferro + Vit C: Carnes vermelhas, feijão, laranja\n🥛 Cálcio: Laticínios, vegetais verdes\n🐟 Vit D: Peixes gordurosos, exposição solar\n🥬 Vit A: Cenoura, batata-doce, folhas verdes\n🥜 Zinco: Carnes, leguminosas, castanhas\n\nA suplementação deve ser orientada por profissional.`;
  }

  if (
    message.includes("qual melhor") ||
    message.includes("qual é o melhor") ||
    message.includes("recomenda")
  ) {
    return `Não existe "melhor" - existe o que é adequado para seu objetivo!Baseado no Guide Alimentar:\n\n✅ Prefira alimentos in natura ou minimamente processados\n✅ Vegetais, frutas, leguminosas daily\n✅ Cereais integrais\n✅ Carnes magras e ovos\n❌ Evite ultra-processados (biscoitos, salgadinhos, refrigerantes)`;
  }

  if (
    message.includes("vegetariano") ||
    message.includes("vegano") ||
    message.includes("planta")
  ) {
    return `Opções vegetais ricas em proteína (TACO):\n\n🫘 Soja: 100g = 16g proteína\n🫘 Grão-de-bico: 100g = 9g proteína\n🫘 Lentilha: 100g = 8g proteína\n🌾 Aveia: 100g = 17g proteína\n🥜 Castanhas: 100g = 15g proteína\n\nCombine fontes vegetais para obter proteína completa!`;
  }

  if (
    message.includes("oi") ||
    message.includes("ola") ||
    message.includes("bom dia")
  ) {
    return `Olá! Sou seu assistente nutricional 🤖\n\nPosso ajudar com:\n🥗 Receitas e sugestões alimentares\n📊 Informações nutricionais (baseadas na TACO)\n⚡ Dietas para emagrecer ou hipertrofia\n💊 Suplementação e vitaminas\n🍎 Escolhas alimentares saudáveis\n\nQual é sua dúvida?`;
  }

  if (
    message.includes("marcar") ||
    message.includes("consulta") ||
    message.includes("agenda")
  ) {
    return `Para marcar uma consulta, você pode:\n\n📞 Ligar para a clínica\n💬 Enviar mensagem WhatsApp\n🌐 Agendar online pelo sistema\n\nPosso帮你 marcar lembrete para amanhã às 14h?`;
  }

  if (
    message.includes("sim") ||
    message.includes("ok") ||
    message.includes("pode")
  ) {
    return `Entendido! Posso帮你 com mais alguma coisa?\n\nPosso também gerar um plano alimentar personalizado baseado nos seus objetivos. É só me dizer!`;
  }

  return `Entendo sua pergunta sobre "${userMessage}"!\n\nPosso ajudar com informações baseadas em artigos científicos e na Tabela Brasileira de Composição de Alimentos (TACO).\n\nTente perguntar sobre:\n🥗 Receitas saudáveis\n⚡ Dietas (emagrecer, hipertrofia)\n💊 Vitaminas e minerais\n🍎 Escolhas alimentares\n\nQual tema te interessa?`;
}

export function processMessage(
  userMessage: string,
  profile: UserProfile = {},
): ChatMessage {
  const response = generateResponse(userMessage, profile);

  return {
    id: Date.now().toString(),
    role: "assistant",
    content: response,
    timestamp: new Date(),
  };
}

export function getSuggestions(): string[] {
  return [
    "Qual é a melhor fonte de proteína?",
    "Receitas saudáveis para o almoço",
    "Dicas para emagrecer",
    "Quantas calorias preciso por dia?",
    "Quais vitaminas são mais importantes?",
    "Como ganhar massa muscular?",
    "Dietas para vegetariandos",
    "Quantas refeições por dia?",
  ];
}

export async function sendWhatsAppMessage(
  message: string,
  phone: string,
): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, "");
  const whatsappLink = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;

  window.open(whatsappLink, "_blank");

  return true;
}
