export type UserRole =
  | "admin"
  | "nutricionista_chefe"
  | "nutricionista"
  | "paciente";

export interface UserPermissions {
  role: UserRole;
  permissions: string[];
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    "acesso_total",
    "gerenciar_usuarios",
    "configurar_pagamentos",
    "visualizar_dados",
    "criar_nutricionistas",
    "aprovar_cadastros",
    "criar_conteudos",
    "gerenciar_pacientes",
    "atender_pacientes",
    "acessar_modulo_profissional",
  ],
  nutritionist_chefe: [
    "criar_nutricionistas",
    "aprovar_cadastros",
    "criar_conteudos",
    "gerenciar_pacientes",
    "atender_pacientes",
    "acessar_modulo_profissional",
  ],
  nutritionist: [
    "atender_pacientes",
    "criar_conteudos",
    "acessar_modulo_profissional",
  ],
  paciente: ["acessar_conteudo", "visualizar_plano"],
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  nutritionist_chefe: "Nutricionista Chefe",
  nutritionist: "Nutricionista",
  paciente: "Paciente",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: "bg-red-100 text-red-700",
  nutritionist_chefe: "bg-purple-100 text-purple-700",
  nutritionist: "bg-blue-100 text-blue-700",
  paciente: "bg-green-100 text-green-700",
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

export function canAccess(
  role: UserRole,
  requiredPermissions: string[],
): boolean {
  return requiredPermissions.every((p) => hasPermission(role, p));
}

export const SUBSCRIPTION_PLANS = {
  free: {
    name: "Gratuito",
    price: 0,
    features: [
      "Acesso básico ao conteúdo",
      "Histórico de peso",
      "Plano alimentar básico",
    ],
  },
  premium: {
    name: "Premium",
    price: 49.9,
    features: [
      "Cursos exclusivos",
      "Conteúdos avançados",
      "IA Educacional",
      "ON Scan 3D",
      "Suporte prioritário",
    ],
  },
  professional: {
    name: "Profissional",
    price: 97.0,
    features: [
      "Módulo Profissional completo",
      "Criação de cursos",
      "Biblioteca avançada",
      "Depoimentos controlados",
      "Dashboard profissional",
    ],
  },
};

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export interface UserSubscription {
  userId: string;
  plan: SubscriptionPlan;
  status: "active" | "pending" | "cancelled" | "expired";
  startDate: string;
  endDate?: string;
  paymentId?: string;
}
