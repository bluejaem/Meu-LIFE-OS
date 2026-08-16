# Meu LIFE OS

O **Meu LIFE OS** é um ecossistema completo de produtividade e organização acadêmica, projetado para unificar tarefas, estudos, saúde, metas e rotina em um único painel (Dashboard) interativo, moderno e esteticamente apurado. 

Inicialmente construído em Vanilla JS, o projeto foi integralmente refatorado e modernizado para o ecossistema **React + Vite**, garantindo altíssima performance, escalabilidade e uma arquitetura robusta de gerenciamento de estado.

## 🚀 Tecnologias e Stack

- **React 18** + **Vite** (Build ultra-rápido e HMR)
- **TypeScript** (Tipagem forte e prevenção de bugs)
- **Tailwind CSS** (Estilização utilitária de alta customização)
- **Zustand** + **Zustand Persist** (Gerenciamento de estado global flexível e persistente)
- **Recharts** (Visualização de dados para tracking de produtividade)
- **Framer Motion** (Animações polidas e fluidas)
- **Lucide React** (Ícones modernos e vetorizados)
- **date-fns** (Manipulação eficiente de datas e horários)

## ✨ Principais Funcionalidades

- **Dashboard Holístico:** Acompanhe gráficos semanais de produtividade, status do dia, sessões de pomodoro e calendário em uma só tela.
- **Pomodoro Avançado & Tracking de Estudo:** Cronômetro customizável inteligente com integração às horas semanais de estudo, com diferenciação automática de relógio inteligente (suporte a HH:MM:SS) e rotinas personalizadas ("Foco", "Pausas" e "Estudo Personalizado").
- **Organização Acadêmica (Faculdades):** Módulo especialmente criado para tracking triplo de formações simultâneas (Engenharia da Computação, Gestão da TI e Técnico em Informática).
- **Planner de Rotina Inteligente:** Gerenciamento cirúrgico do seu dia a dia. Inclui automações de cronogramas, balanceamento entre aulas presenciais, estudos de deslocamento no ônibus e ciclos de sono/trabalho.
- **Metas e Hábitos:** Acompanhe o progresso de metas semanais (como 20h de estudo mínimo).
- **Personalização Visual:** Troca de planos de fundo via link, paleta de cores Glassmorphism translúcida, totalmente responsiva e agradável para longas sessões de uso.

## ⚙️ Como executar o projeto localmente

Como o projeto agora é construído em React/Vite, não se trata mais de um simples HTML estático. Para executar localmente, certifique-se de ter o [Node.js](https://nodejs.org/) instalado.

1. **Instale as dependências** na raiz do projeto:
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

3. O sistema será iniciado localmente e poderá ser acessado em seu navegador em `http://localhost:5173`.

## 📦 Build e Deploy (GitHub Pages)

Para hospedar o novo projeto no GitHub Pages, você deverá construir o pacote de produção antes.

1. Faça o build do aplicativo:
   ```bash
   npm run build
   ```
2. A pasta `dist` será gerada. Você pode então automatizar o deploy dessa pasta utilizando o GitHub Actions ou qualquer provedor moderno de hospedagem de frontend como Vercel ou Netlify, que possuem suporte nativo ao Vite.
