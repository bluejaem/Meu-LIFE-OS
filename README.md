# Meu LIFE OS

Aplicação web (Single Page Application) desenvolvida em React e TypeScript voltada para centralização de rotinas, gestão acadêmica, controle de tarefas e métricas de produtividade em uma interface única client-side.

O projeto foi estruturado com abordagem local-first, executando a lógica de negócio e a persistência de dados diretamente no navegador do cliente via LocalStorage, sem dependência de serviços externos de backend.

---

## Sumário

- [Decisões de Arquitetura](#decisões-de-arquitetura)
- [Módulos Implementados](#módulos-implementados)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Execução](#instalação-e-execução)
- [Build](#build)

---

## Decisões de Arquitetura

- **Gerenciamento de Estado Atômico (Zustand):** O estado global da aplicação é particionado em stores dedicadas, evitando re-renderizações desnecessárias comuns no uso amplo de React Context. A sincronização entre módulos (ex: sessões concluídas no Pomodoro refletindo no gráfico do Dashboard) ocorre por subscrições pontuais às fatias do estado.
- **Persistência Local-First:** Utilização do middleware `persist` do Zustand em conjunto com a API de `localStorage`. As alterações de estado são serializadas assincronamente, mantendo os dados preservados entre sessões sem overhead de rede.
- **Roteamento Interno por Estado:** A alternância entre visões é controlada por chaves de estado de interface, reduzindo o bundle size e simplificando o empacotamento estático sem necessidade de roteadores baseados em histórico de navegação.

---

## Módulos Implementados

### Autenticação Local (`AuthScreen`)
- Fluxo de login e cadastro com armazenamento local de credenciais e perfil.
- Tratamento de avatar do usuário via fallback de iniciais ou upload direto de imagem com redimensionamento e compressão em elemento `<canvas>` antes da conversão para base64.

### Dashboard e Métricas
- Agregação de tarefas pendentes, compromissos da semana e progresso acadêmico.
- Gráficos de área desenvolvidos com Recharts correlacionando tarefas concluídas e horas acumuladas de foco ao longo dos dias.

### Temporizador Pomodoro
- Modos pré-configurados: Foco (25 min), Pausa Curta (5 min), Pausa Longa (15 min) e configuração manual.
- Ao término de cada ciclo de foco, o tempo decorrido é computado e despachado para a store de histórico do Dashboard.

### Planejador Semanal e Parser de Rotinas
- Grade horária semanal com categorização de atividades (Estudos, Trabalho, Exercícios, Lazer).
- Parser de texto que processa entradas brutas coladas pelo usuário, identifica padrões de dia e horário via regex e mapeia para a estrutura de dados interna da grade.

### Gestão Acadêmica
- Estrutura hierárquica para acompanhamento de múltiplos cursos simultâneos, semestres, disciplinas e médias ponderadas.
- Módulo complementar para registro de leitura (total de páginas, páginas lidas e status) e catálogo de certificações.

### Gerenciador de Projetos e Tarefas
- Organização em lista e colunas tipo Kanban.
- Estrutura relacional pai-filho (Projetos contêm Tarefas, que contêm Subtarefas). O percentual de conclusão do projeto é calculado dinamicamente com base nas tarefas resolvidas.

### Diário e Registro de Humor
- Interface simples de log diário com campo textual e seletor de escala de humor para correlação com dias de maior ou menor produtividade.

---

## Stack Tecnológica

| Camada / Função | Tecnologia |
| :--- | :--- |
| **Linguagem** | TypeScript |
| **Framework Base** | React 18 |
| **Build Tool** | Vite |
| **Estilização** | Tailwind CSS |
| **Estado Global** | Zustand |
| **Visualização de Dados** | Recharts |
| **Animações / Transições**| Framer Motion |
| **Componentes de Acessibilidade** | Radix UI |
| **Iconografia** | Lucide React |
| **Utilitários de Data** | date-fns |

---

## Estrutura do Projeto

```text
src/
├── components/
│   ├── modules/       # Componentes de cada visão (Dashboard, Planner, Tasks, etc.)
│   └── ui/            # Componentes genéricos primitivos (botões, modais, inputs)
├── lib/               # Funções utilitárias e helpers de formatação
├── store/             # Stores Zustand e lógica de sincronização com localStorage
├── types/             # Declarações de tipos e interfaces TypeScript
├── App.tsx            # Componente raiz e controle de navegação
└── main.tsx           # Entrypoint da aplicação
