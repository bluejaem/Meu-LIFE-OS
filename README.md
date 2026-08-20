# Meu LIFE OS - Plataforma de Produtividade e Gestão Pessoal

O Meu LIFE OS é uma Single Page Application (SPA) abrangente, projetada para atuar como um ecossistema definitivo de organização pessoal e profissional. Focado em unificar gestão de tempo, rotinas diárias, vida acadêmica e projetos sob um único painel interativo, o projeto resolve o problema da fragmentação de ferramentas (ter que utilizar aplicativos diferentes para tarefas, cronômetros, calendários e anotações).

Este documento detalha as decisões técnicas, a arquitetura da aplicação e o conjunto de funcionalidades que tornam este sistema robusto, performático e altamente adaptável às necessidades do usuário.

## Índice

1. [Visão Geral do Projeto](#visao-geral-do-projeto)
2. [Arquitetura e Decisões Técnicas](#arquitetura-e-decisoes-tecnicas)
3. [Módulos e Funcionalidades Detalhadas](#modulos-e-funcionalidades-detalhadas)
4. [Princípios de Interface e Experiência do Usuário (UI/UX)](#principios-de-interface-e-experiencia-do-usuario-uiux)
5. [Stack Tecnológico](#stack-tecnologico)
6. [Estrutura do Repositório](#estrutura-do-repositorio)
7. [Guia de Execução Local](#guia-de-execucao-local)
8. [Build e Deploy](#build-e-deploy)

---

## Visão Geral do Projeto

Construído inicialmente como um painel simples, o projeto evoluiu para um ecossistema complexo voltado para o rastreamento integral da vida do usuário. O desenvolvimento foi direcionado por três pilares fundamentais: performance no cliente (client-side), persistência autônoma de dados em ambiente de navegador e design responsivo (Mobile-First). Toda a lógica de negócios da aplicação roda diretamente na máquina do usuário, eliminando a dependência de servidores de backend ou bancos de dados externos lentos.

---

## Arquitetura e Decisões Técnicas

O projeto segue uma arquitetura orientada a componentes modulares sob o ecossistema React. As decisões estruturais mais relevantes incluem:

- **Gerenciamento de Estado Distribuído (Zustand):** Em vez de centralizar dados em contextos complexos do React (Context API) que poderiam causar renderizações desnecessárias, a aplicação adota o Zustand. Ele permite acesso atômico a fatias de estado, sendo ideal para conectar módulos paralelos, como o cronômetro do Pomodoro e o preenchimento em tempo real do gráfico de produtividade do Dashboard.
- **Persistência Local (Local-First):** Através do middleware de persistência do Zustand associado ao localStorage do navegador, todas as interações, configurações, credenciais de acesso e progressos de tarefas são imediatamente salvos de forma assíncrona.
- **Sistema de Roteamento Baseado em Estado:** Para manter o comportamento rigoroso de uma Single Page Application, a navegação entre os módulos ocorre por meio da troca de estados internos da interface, evitando o recarregamento total de scripts ou o uso de bibliotecas pesadas de rotas tradicionais.

---

## Módulos e Funcionalidades Detalhadas

O escopo do sistema abrange múltiplos módulos dedicados, todos conectados pelo mesmo banco de dados local.

### 1. Barreira de Autenticação (AuthScreen)
Um portal de acesso seguro desenvolvido para isolar o ecossistema. 
- Permite Registro e Login simulado, salvando credenciais, nome e preferências no navegador.
- Suporte a geração automática de avatar (iniciais via API de ui-avatars) para novos usuários ou opção de upload de fotos personalizadas com compressão automatizada de imagens (via Canvas) antes do armazenamento.

### 2. Dashboard Holístico e Visualização de Dados
Um centro de comando analítico.
- Reúne informações em tempo real sobre tarefas do dia, eventos iminentes e progresso acadêmico.
- Renderiza gráficos complexos de área (através da biblioteca Recharts) que correlacionam tarefas finalizadas com as horas dedicadas a estudos na respectiva semana.

### 3. Gestão de Foco (Pomodoro Avançado)
Cronômetro de estudo e produtividade totalmente customizável.
- Suporta múltiplos perfis: Foco, Pausa Curta, Pausa Longa e Estudo Personalizado.
- Integra-se diretamente ao Dashboard: ao finalizar um ciclo, as horas estudadas são processadas e adicionadas automaticamente às métricas semanais.

### 4. Importador Inteligente de Rotinas (Planner)
Módulo projetado para automação de cronogramas.
- Possui um analisador (parser) de texto nativo que permite importar blocos de cronograma via "Copiar e Colar".
- Agrupa inteligentemente eventos coincidentes entre diferentes dias da semana, categorizando-os automaticamente de acordo com palavras-chave predefinidas (Trabalho, Lazer, Estudos, Exercícios).

### 5. Gestão Acadêmica e Conhecimento
Subsistemas dedicados ao acompanhamento contínuo de aprendizado:
- **Faculdades:** Rastreamento simultâneo de múltiplos cursos, semestres, disciplinas e evolução das notas.
- **Livros e Certificações:** Catálogo de leituras, progresso de páginas concluídas e registro de certificados obtidos.

### 6. Produtividade e Organização (Projetos e Tarefas)
Suporte ao método Kanban e visualização em lista.
- Hierarquia estrita: Projetos abrigam tarefas, e tarefas podem possuir sub-tarefas.
- O progresso de cada componente superior é calculado automaticamente com base no índice de conclusão das instâncias filhas.

### 7. Diário Pessoal
Ferramenta para registro textual de insights e rastreamento de humor diário (Mood Tracker).

---

## Princípios de Interface e Experiência do Usuário (UI/UX)

A identidade visual da aplicação foi desenhada visando sessões prolongadas de uso.

- **Glassmorphism:** Uso intencional de fundos translúcidos, filtros de desfoque (backdrop-blur) e bordas sutis para separar a hierarquia de componentes.
- **Responsividade (Mobile-First):** Estruturas de grade flexíveis que se reordenam automaticamente. A interface converte complexos painéis em layouts em coluna nos dispositivos móveis, e substitui barras de navegação fixas por menus acessíveis (Hambúrguer).
- **Personalização Dinâmica:** Opções acessíveis na aba de configurações para alterar a imagem do papel de parede principal, atualizando toda a paleta sensorial do ambiente.
- **Microinterações:** Emprego da biblioteca Framer Motion para orquestrar transições suaves entre módulos, *hover states* em botões e feedbacks de validação nos formulários.

---

## Stack Tecnológico

As tecnologias selecionadas visam performance de processamento e agilidade no desenvolvimento front-end:

- **React 18:** Biblioteca central para construção da interface declarativa.
- **Vite:** Ferramenta de build de última geração para bundling ultra-rápido e Hot Module Replacement (HMR) eficiente.
- **TypeScript:** Linguagem base para assegurar tipagem estática e coesão dos modelos de dados em todo o código.
- **Tailwind CSS:** Framework utilitário escalável que substitui folhas de estilo tradicionais para montagem rápida de UI e responsividade.
- **Zustand:** Gerenciamento de estado rápido e minimalista.
- **Recharts:** Renderização de gráficos dinâmicos usando SVG.
- **Framer Motion:** Animações baseadas em física e controle espacial da interface.
- **Radix UI:** Primitivos sem estilo predefinido voltados para a criação de modais e componentes interativos altamente acessíveis (WAI-ARIA).
- **Lucide React:** Iconografia vetorizada projetada especificamente para o ecossistema React.
- **Date-fns:** Manipulação matemática de datas com baixo custo de performance.

---

## Estrutura do Repositório

O projeto segue um padrão arquitetural organizado, separando as preocupações lógicas, visuais e estruturais de forma clara:

- **`src/components/`**: Peças de interface reutilizáveis.
  - **`modules/`**: Páginas e painéis principais (Dashboard, Rotina, Tarefas).
  - **`ui/`**: Componentes atômicos genéricos (Modais, Inputs, Botões).
- **`src/lib/`**: Utilitários gerais, funções de formatação de dados e manipuladores condicionais de CSS.
- **`src/store/`**: Definições das fatias de estado global (authStore e useStore) para as regras de negócio via Zustand.
- **`src/types/`**: Interfaces e tipos globais em TypeScript que definem o contrato de dados das Entidades do sistema.

---

## Guia de Execução Local

Este projeto requer a instalação prévia do [Node.js](https://nodejs.org/) na máquina hospedeira.

1. Faça o clone do repositório:
   ```bash
   git clone https://github.com/bluejaem/Meu-LIFE-OS.git
   ```

2. Navegue até o diretório do projeto:
   ```bash
   cd Meu-LIFE-OS
   ```

3. Instale as dependências essenciais:
   ```bash
   npm install
   ```

4. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. O painel estará disponível localmente. Acesse a URL indicada (geralmente `http://localhost:5173`) no navegador de sua preferência.

---

## Build e Deploy

A compilação do projeto para o ambiente de produção utiliza um processo rigoroso de verificação estática de código através do TypeScript.

Para gerar a versão final para produção, execute:

```bash
npm run build
```

Este comando gera uma pasta `dist/` com arquivos minificados, empacotados e altamente otimizados para servidores web estáticos. O projeto possui infraestrutura configurada para Integração Contínua (CI/CD) sendo atualmente hospedado diretamente na plataforma **Vercel**, refletindo as atualizações sempre que houver modificações na branch principal.
