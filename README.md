# 🥗 ONNutrition — Inteligência Nutricional

ONNutrition é uma plataforma completa para nutricionistas e pacientes, focada na gestão de dietas, prontuários e acompanhamento nutricional impulsionado por IA.

Este projeto foi refatorado para garantir estabilidade local, segurança e uma arquitetura profissional baseada em Next.js 15.

## 🚀 Como Rodar Localmente

Siga os passos abaixo para configurar o ambiente de desenvolvimento em sua máquina.

### 📋 Pré-requisitos
- **Node.js** (v20 ou superior recomendada)
- **npm** ou **yarn**

### 🔧 Instalação e Configuração

1. **Clone o repositório:**
   ```bash
   # (Se já estiver na pasta, pule este passo)
   cd ONNutrition
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```
   *Nota: Se ocorrerem conflitos de peer dependencies (comum em versões muito novas), use `npm install --legacy-peer-deps`.*

3. **Configure as variáveis de ambiente:**
   - Renomeie o arquivo `.env.example` para `.env`.
   - Adicione suas chaves do **Supabase** e do **Google Gemini API**.
   - O projeto funcionará em **Modo Demo** automaticamente se as chaves não forem fornecidas.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tecnologias Utilizadas

- **Core:** Next.js 15 (App Router), TypeScript, React 19
- **Estilização:** Tailwind CSS 4, Motion (para animações)
- **Backend:** Supabase (Auth & DB), Firebase (Opcional/Módulo de Sincronização)
- **IA:** Google Generative AI (Gemini Flash)
- **UI Components:** Lucide React (Ícones), Recharts (Gráficos), React-Hook-Form + Zod (Validação)

---

## 🏗️ Estrutura Atual (Refatorada)

- `app/`: Rotas e layouts principais do Next.js.
- `app/components/`: Componentes da interface (UI).
- `app/modules/`: Lógica de módulos específicos (Diário, Receitas, etc).
- `lib/`: Configurações de clientes (Supabase, Firebase).
- `hooks/`: Hooks customizados para estado e autenticação.
- `supabase/`: Migrações e esquemas do banco de dados.

---

## 🔐 Segurança e Boas Práticas

- **Limpeza de Bypass:** Removidos os scripts de "Nuclear Bypass" em favor de um `loading.tsx` nativo do Next.js.
- **Isolamento de Credenciais:** Todas as chaves agora são geridas via `.env`.
- **Estilos Globais:** Centralizados em `globals.css` para melhor manutenção.

---

*Projeto em constante refatoração para atingir o nível Production-Ready.*
