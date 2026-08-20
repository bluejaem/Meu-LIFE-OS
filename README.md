# Meu LIFE OS

O Meu LIFE OS é um ecossistema completo de produtividade e organização acadêmica, projetado para unificar tarefas, estudos, saúde, metas e rotinas em um único painel interativo, moderno e esteticamente apurado. 

Este sistema foi concebido para resolver o problema da fragmentação de ferramentas de organização, centralizando todas as necessidades do dia a dia do usuário em uma única plataforma adaptável e robusta.

## Visão Geral do Projeto

Inicialmente construído com JavaScript puro (Vanilla JS), o projeto cresceu exponencialmente em escopo e complexidade, o que motivou uma refatoração integral. A aplicação foi completamente modernizada e migrada para o ecossistema React com Vite, garantindo altíssima performance, escalabilidade na adição de novas funcionalidades e uma arquitetura sólida de componentes.

## Arquitetura e Gerenciamento de Estado

O projeto utiliza uma arquitetura orientada a componentes modulares. O coração da aplicação é o gerenciamento de estado distribuído via Zustand. Em vez de depender de contextos de React complexos ou prop-drilling, o Zustand garante atualizações de estado fluidas na interface. A persistência dos dados é gerida nativamente pela aplicação (via Zustand Persist), permitindo que todo o progresso, configurações e tarefas permaneçam salvos no armazenamento do navegador de forma eficiente, dispensando o uso de um banco de dados externo nesta versão inicial.

## Principais Funcionalidades

- **Dashboard Holístico:** Um painel central que fornece uma visão imediata dos gráficos semanais de produtividade, status atual do dia, sessões de pomodoro concluídas e integração com o calendário.
- **Autenticação e Segurança:** Tela inicial de controle de acesso (AuthScreen) responsável por restringir a entrada ao ambiente principal do dashboard.
- **Command Palette:** Sistema de busca e navegação rápida por atalhos de teclado (inspirado no Spotlight), facilitando a transição ágil entre módulos sem a necessidade de uso do mouse.
- **Pomodoro Avançado e Rastreamento de Estudos:** Cronômetro inteligente e customizável integrado às horas semanais de estudo. Conta com suporte a formatos precisos de tempo e rotinas pré-configuradas (Foco, Pausa, Estudo Personalizado).
- **Organização Acadêmica Multidisciplinar:** Módulo exclusivo desenvolvido para o rastreamento simultâneo de diferentes formações acadêmicas (Engenharia da Computação, Gestão da TI e Técnico em Informática), estruturando os estudos de acordo com as necessidades específicas de cada curso.
- **Planner Inteligente de Rotina:** Ferramenta para o gerenciamento detalhado do dia a dia, incluindo automações de cronogramas e balanceamento entre aulas presenciais, estudos em trânsito e ciclos de sono e descanso.
- **Sistema de Metas e Hábitos:** Ferramentas integradas para a consolidação e monitoramento contínuo de metas de médio e longo prazo, além da validação de hábitos diários.
- **Personalização Visual e Glassmorphism:** Interface desenvolvida com foco absoluto em UI/UX e conforto visual para longas sessões de uso. Apresenta tipografia moderna, componentes com efeitos translúcidos e permite a troca dinâmica do plano de fundo pelo usuário.

## Tecnologias e Ferramentas

- **React 18** e **Vite**: Formam a base estrutural, garantindo renderização otimizada de interface e processos de build de alta velocidade.
- **TypeScript**: Adotado em toda a base de código para garantir tipagem estática rigorosa e prevenção de falhas em tempo de desenvolvimento.
- **Tailwind CSS**: Framework utilitário responsável por toda a estilização, design responsivo e padronização visual da interface.
- **Zustand** e **Zustand Persist**: Gerenciadores de estado flexíveis para lidar com o ciclo de vida dos dados e o armazenamento local.
- **Recharts**: Biblioteca de renderização gráfica utilizada para desenhar as estatísticas de produtividade, progresso acadêmico e distribuição de horas.
- **Framer Motion**: Motor de física e animação adotado para criar feedbacks visuais complexos, interações de componentes naturais e transições de página fluidas.
- **Radix UI**: Componentes primitivos sem estilo, focados em acessibilidade (como caixas de diálogo, modais e popovers), que servem de fundação técnica para a interface gráfica.
- **Lucide React**: Pacote de iconografia minimalista e vetorizada, garantindo nitidez em qualquer resolução de tela.
- **Date-fns**: Biblioteca leve e especializada no cálculo complexo e na formatação de datas.

## Como Executar Localmente

Para rodar o ambiente de desenvolvimento em sua máquina local, certifique-se de possuir o Node.js instalado.

1. Instale todas as dependências do projeto executando o comando na raiz da pasta:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Acesse a aplicação abrindo o endereço exibido no terminal (por padrão, `http://localhost:5173`) no seu navegador.

## Build e Hospedagem

Para gerar os arquivos estáticos de produção da aplicação:

```bash
npm run build
```

Este comando gerará a pasta `dist` contendo o código transpilado, minificado e pronto para hospedagem. Esta versão final pode ser facilmente enviada para plataformas modernas de hospedagem contínua para projetos de front-end, como Vercel, Netlify ou GitHub Pages.
