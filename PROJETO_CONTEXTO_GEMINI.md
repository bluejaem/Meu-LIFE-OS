# 🧠 DOSSIÊ TÉCNICO E DE PRODUTO — MEU LIFE OS
> **Documento de Contexto para Inteligência Artificial (Gemini Pro / Claude / GPT-4)**  
> **Versão do Sistema:** 2.0 (Cloud-Sync & Real-Time)  
> **Repositório Base:** `bluejaem/Meu-LIFE-OS`  
> **Propósito:** Alimentar modelos de IA com a totalidade da visão de produto, regras de negócio, dados, stack e fluxos do aplicativo.

---

## 1. VISÃO GERAL E INTUITO DO PROJETO

### O que é o "Meu LIFE OS"?
O **Meu LIFE OS** é uma Single Page Application (SPA) progressiva e altamente performática que funciona como um **Segundo Cérebro (Second Brain)** e ecossistema definitivo de organização pessoal, acadêmica e profissional.

### Qual o problema que o projeto resolve?
Usuários produtivos sofrem com a **fragmentação de ferramentas**: utilizam Trello para projetos, Pomofocus para cronômetro, Todoist/TickTick para tarefas diárias, Notion para faculdade e diário, Google Calendar para datas e planilhas para monitorar livros lidos e certificações.
O **Meu LIFE OS unifica todos esses subsistemas em uma única interface ultrarrápida, fluida e integrada**, onde um módulo alimenta o outro:
- Concluir um ciclo de Pomodoro gera métricas automáticas no gráfico de produtividade do Dashboard e alimenta o contador de estudo semanal.
- Concluir tarefas filhas de um projeto atualiza em tempo real a barra de progresso do projeto-pai.
- O calendário agrega automaticamente eventos manuais, tarefas com prazo iminente e blocos de rotina recorrente do dia selecionado.
- A rotina diária pode ser importada via texto bruto em linguagem natural e agrupada de forma inteligente.

### Arquitetura de Dados: Local-First com Sincronização em Tempo Real (Multi-Device)
- **Zero Latency UI:** A interface lê e grava os dados de forma instantânea.
- **Camada Híbrida (Firestore + LocalStorage):** Através do Zustand `persist` associado a um storage customizado (`firestoreStorage.ts`), os dados são cacheados no `localStorage` do navegador e persistidos no **Firebase Cloud Firestore**.
- **Real-Time Multi-Aparelho:** Um listener `onSnapshot` do Firestore escuta alterações na nuvem em tempo real (`db.collection('userState').doc(userId)`). Se o usuário fizer uma alteração no celular, ela reflete instantaneamente no computador sem recarregar a página.

---

## 2. STACK TECNOLÓGICO COMPLETO

| Camada | Tecnologia | Função no Projeto |
| :--- | :--- | :--- |
| **Core** | React 18 & TypeScript | Estrutura declarativa com tipagem estática rigorosa de todas as entidades |
| **Build Tool** | Vite 5 | Bundling rápido, Hot Module Replacement (HMR) e compilação otimizada |
| **Estado Global** | Zustand 5 | Gerenciamento atômico de fatias de estado sem rerenders desnecessários |
| **Estilização** | Tailwind CSS 3 | Design System utilitário, layouts flexíveis e responsividade mobile-first |
| **Identidade Visual** | Glassmorphism Custom | Backdrop-blur intenso, painéis translúcidos, paleta dark mode premium |
| **Backend / BaaS** | Firebase 12 (Auth + Firestore) | Autenticação por usuário, banco NoSQL na nuvem e sync em tempo real |
| **Gráficos** | Recharts | Renderização de gráficos de área interativos com duplo gradiente em SVG |
| **Animações** | Framer Motion 11 | Microinterações, transições de aba e efeito de layoutId na barra lateral |
| **Acessibilidade / UI** | Radix UI Primitives | Modais, popovers e controles acessíveis com WAI-ARIA |
| **Ícones** | Lucide React | Mais de 30 ícones modernos vetorizados |
| **Datas** | date-fns 3 | Manipulação de datas, cálculo de semana ISO e internacionalização (pt-BR) |
| **Deploy & CI/CD** | Vercel | Hospedagem contínua com roteamento configurado via `vercel.json` |

---

## 3. MAPA DE MÓDULOS E FUNCIONALIDADES DETALHADAS

### 🚪 0. Autenticação & Gestão de Usuário (`AuthScreen.tsx` & `authStore.ts`)
- **Login e Registro Customizado:** Usuário cria uma conta informando Nome, Username (sem necessidade de e-mail real) e Senha. Por baixo dos panos, o sistema mapeia o username para `{username}@meulifeos.app` no Firebase Authentication.
- **Validação de Credenciais:** Trata erros de nome de usuário em uso, complexidade mínima de senha (mínimo 6 dígitos) e credenciais incorretas.
- **Avatar Dinâmico & Upload com Compressão:**
  - Gera avatar inicial com as iniciais do usuário via `ui-avatars.com`.
  - Permite upload de fotos locais personalizadas, processadas via HTML5 Canvas (redimensionadas para no máximo 256x256px e compactadas em JPEG 0.8) para otimizar espaço no banco de dados.
- **Persistência de Sessão:** `onAuthStateChanged` mantém o usuário autenticado entre sessões e recarregamentos.

---

### 📊 1. Dashboard Holístico — Centro de Comando (`Dashboard.tsx`)
- **Saudação & Relógio Vivo:**
  - Identifica o horário atual para exibir "Bom dia", "Boa tarde" ou "Boa noite", seguido pelo primeiro nome do usuário.
  - Exibe data completa em português (ex: "Quarta-feira, 10 de Setembro"), número da semana no ano (ex: "Semana 37") e relógio digital dinâmico atualizado a cada segundo.
- **Cartões de Métricas (KPIs Principais):**
  - **Tarefas:** Quantidade de tarefas concluídas hoje / total de tarefas agendadas para hoje + total acumulado no sistema.
  - **Projetos:** Projetos em status 'Concluído' em relação ao total de projetos criados.
  - **Estudo Semanal:** Horas e minutos estudados na semana atual vs meta de 20 horas (1200 minutos), com badge percentual de atingimento. Clicar no card abre o modal para inserir horas de estudo manuais.
  - **Sequência (Streak 🔥):** Algoritmo que varre os últimos 365 dias conferindo se houve pelo menos uma tarefa concluída ou sessão de estudo/pomodoro em cada dia, calculando a sequência ininterrupta.
- **Gráfico de Produtividade Semanal (Recharts):**
  - Gráfico de área bidimensional com duas curvas suaves (Monotone Area):
    - Curva Roxa (`#6366f1`): Quantidade de tarefas finalizadas em cada um dos últimos 7 dias.
    - Curva Verde (`#10b981`): Horas totais dedicadas a estudos/pomodoro no mesmo período.
  - Tooltip customizada translúcida com visual dark blur.
- **Quick Pomodoro Widget:**
  - Mini-player do cronômetro Pomodoro direto no Dashboard.
  - Permite alternar entre os modos, iniciar, pausar, resetar e editar a duração sem precisar sair da visão geral.
- **Metas em Destaque:**
  - Exibe as 3 principais metas em andamento com barras de preenchimento proporcional animadas.
- **Tarefas de Hoje (Lista Rápida):**
  - Checklist das tarefas marcadas para a data atual, permitindo marcar como feitas com 1 clique (com efeito de riscado e animação visual).
- **Próximos Eventos Unificados:**
  - Junção inteligente dos próximos compromissos para os próximos 7 dias (eventos manuais, tarefas agendadas e rotinas de estudo).
- **Citação Motivacional:**
  - Frase inspiradora ("Disciplina hoje, liberdade amanhã.") em painel de vidro com destaque em gradiente.

---

### ✅ 2. Gestão de Tarefas (`Tarefas.tsx`)
- **Organização Temporal Automática:**
  - **Hoje:** Tarefas cuja data seja exatamente hoje e ainda estejam pendentes.
  - **Próximos:** Tarefas agendadas para datas futuras ainda pendentes.
  - **Concluídas:** Histórico de tarefas finalizadas com opção de visualização colapsada.
- **Metadados Completos por Tarefa:**
  - Título e Descrição detalhada.
  - **Prioridades:** Baixa (cinza), Média (amarelo), Alta (vermelho).
  - **Tags / Categorias Temáticas:** Projeto, Faculdade, Pessoal, Leitura, Trabalho, Saúde, Outro (cada uma com sua própria paleta de cor).
  - **Subtarefas (Checklist):** Suporte a lista aninhada de itens a fazer dentro de uma tarefa. O usuário pode expandir a tarefa e marcar cada subtarefa individualmente.
  - Data de execução programada.
  - Vínculo opcional com um Projeto existente.
- **Ações Rápidas & Menu de Contexto:**
  - Concluir/Desmarcar com um clique.
  - Editar dados via modal.
  - **Duplicar Tarefa:** Cria instantaneamente uma cópia idêntica com o sufixo `(cópia)`.
  - Exclusão com modal de confirmação de segurança.

---

### 📂 3. Gestão de Projetos (`Projetos.tsx`)
- **Visão de Iniciativas de Médio/Longo Prazo:**
  - Título, Descrição e Cor de identificação.
  - **Status do Projeto:** `Planejamento`, `Em progresso`, `Pausado`, `Concluído`.
- **Cálculo Automático de Progresso:**
  - O sistema calcula a porcentagem de conclusão do projeto ($0\%$ a $100\%$) com base na relação:
    $$\text{Progresso} = \left(\frac{\text{Tarefas Concluídas do Projeto}}{\text{Total de Tarefas Vinculadas ao Projeto}}\right) \times 100$$
  - Se o projeto for movido manualmente para `Concluído`, o progresso passa a ser considerado $100\%$ automaticamente.
- **Ações:** Criar, editar, arquivar (move para status 'Pausado') e excluir.

---

### 📅 4. Calendário Integrado (`Calendario.tsx`)
- **Visão Mensal Completa:**
  - Renderiza o grid de dias do mês atual, com destaque para o dia de hoje e seleção interativa de qualquer data.
  - Navegação entre meses (anterior/próximo).
- **Agregação Multi-Fonte Tripla:** Ao clicar em um dia específico, o painel lateral exibe:
  1. **Eventos Específicos:** Criados diretamente no calendário (com horário, cor e subtítulo).
  2. **Tarefas Agendadas:** Tarefas do módulo de tarefas cuja data coincida com o dia selecionado.
  3. **Rotina Semanal Recorrente:** Blocos do módulo de rotina que estejam configurados para acontecer naquele dia da semana!
- **Criação Rápida de Eventos:** Botão direto para adicionar novo compromisso para o dia clicado.

---

### ⏱️ 5. Pomodoro & Foco Profundo (`Pomodoro.tsx` & `useStore.ts`)
- **4 Modos de Operação:**
  - **Foco:** Padrão de 25 minutos (configurável).
  - **Pausa Curta:** Padrão de 5 minutos (configurável).
  - **Pausa Longa:** Padrão de 15 minutos (configurável).
  - **Estudo Personalizado:** Permite digitar livremente o tempo em formato `HH:MM:SS` (ex: 50 minutos, 1h30).
- **Persistência em Segundo Plano:**
  - O cronômetro reside no estado global do Zustand e é atualizado a cada segundo em `App.tsx`. O usuário pode navegar entre abas do LIFE OS, criar tarefas ou escrever no diário sem interromper o tempo de foco!
- **Feedback Sensorial Nativo:**
  - **Áudio Sintetizado (Web Audio API):** Dispara uma sequência harmônica de bipes senoidais ao término do ciclo sem depender de arquivos MP3 externos.
  - **Notificações de Sistema (Desktop Notifications):** Alerta o usuário mesmo que a janela do navegador esteja minimizada.
- **Associação com Tarefa:** O usuário pode selecionar qual tarefa específica está realizando durante aquele ciclo.
- **Contabilização Automática:**
  - Concluir um ciclo de Foco ou Estudo Personalizado registra automaticamente uma sessão na lista de `pomodoroSessions`, atualizando os gráficos semanais e somando os minutos de hoje.
- **Estudo Manual (`ModalAddStudy.tsx`):**
  - Permite adicionar blocos de estudo realizados offline (ex: 2h lendo um livro físico ou assistindo aula na faculdade) para não perder o rastreamento da meta semanal de 20h.

---

### 🔁 6. Rotina & Importador Inteligente por IA/Regex (`Rotina.tsx`)
- **Organização Semanal de Hábitos:**
  - Visualização filtrada por dia da semana (Segunda a Domingo) ou visualização global.
  - Ordenação cronológica automática dos horários ao longo do dia.
- **Categorização Automática com Cores:**
  - `Estudo` (`#6366f1`)
  - `Exercício` (`#10b981`)
  - `Trabalho` (`#f59e0b`)
  - `Alimentação` (`#ec4899`)
  - `Sono` (`#8b5cf6`)
  - `Lazer` (`#3b82f6`)
  - `Outro` (`#64748b`)
- **O Importador Inteligente (Smart Natural Language Parser):**
  - Permite colar horários copiados de planilhas, mensagens de WhatsApp ou anotações (ex: `06:30 - 07:00 Café da manhã`, `08:00 - 12:00 Trabalho`, `14:00 às 16:00 Estudo de Engenharia`, cabeçalhos como `SEGUNDA A SEXTA`, `FINAIS DE SEMANA`).
  - **Parser Semântico:** Identifica termos como "dormir", "almoço", "academia", "reunião", "leitura", "faculdade", atribuindo automaticamente a categoria e cor correspondente.
  - **Deduplicação e Mescla Inteligente:** Se o usuário importar eventos coincidentes em vários dias, o sistema agrupa os dias da semana (`Seg`, `Ter`, `Qua`...) no mesmo bloco em vez de criar duplicatas poluídas.

---

### 🎯 7. Metas e Objetivos (`Metas.tsx`)
- **Estrutura por Horizonte de Tempo:**
  - **Curto Prazo:** Metas imediatas (semanas a poucos meses).
  - **Médio Prazo:** Metas de desenvolvimento (semestres, projetos de médio porte).
  - **Longo Prazo:** Grandes aspirações e visões de futuro (anos).
- **Indicadores Quantitativos:**
  - Alvo descritivo (ex: `"100 páginas"`, `"3 horas por dia"`, `"R$ 10.000 acumulados"`).
  - Data limite estimada (Deadline).
  - Controle deslizante para atualizar a porcentagem de evolução com feedback visual instantâneo.

---

### 📚 8. Biblioteca & Leitura (`Livros.tsx`)
- **Catálogo de Leituras Pessoais:**
  - Título, Autor, Total de Páginas e Página Atual.
  - **Cálculo de Progresso Dinâmico:** Percentual lido do livro exibido em barra de progresso.
  - **Status:** `Quero ler`, `Lendo`, `Concluído`, `Abandonado`.
  - **Classificação por Estrelas (Rating 1 a 5):** Permite avaliar o livro após o término.
  - Campo dedicado para notas, anotações de insights e citações marcantes.
  - Filtros rápidos no topo por status e contadores de livros lendo/concluídos.

---

### 🎓 9. Faculdades & Gestão Acadêmica (`Faculdades.tsx`)
- **Multi-Cursos:** Permite acompanhar mais de uma faculdade/graduação ou curso técnico em simultâneo.
- **Hierarquia Acadêmica:**
  - Instituição de Ensino e Nome do Curso.
  - Período / Semestre atual.
  - Grade de Disciplinas cadastradas.
  - Para cada disciplina: Progresso da ementa (0% a 100%), Nota final/média obtida e anotações sobre provas e trabalhos.
  - **Média Global Automática:** O sistema calcula a média de conclusão de todas as matérias para dar a porcentagem geral de avanço no curso.

---

### 🏆 10. Certificações & Conquistas (`Certificacoes.tsx`)
- **Hub de Certificados e Cursos:**
  - Registro de cursos livres, certificações técnicas e conquistas acadêmicas (ex: Harvard CS50, certificações UNINTER, Bradesco, etc.).
  - Plataforma emissora do certificado.
  - Status: `Planejado`, `Em andamento`, `Concluído`.
  - Data de emissão / conclusão e data de expiração (para certificações da indústria com validade).
  - Link direto para a URL de verificação da credencial.

---

### 📖 11. Diário & Mood Tracker (`Diario.tsx`)
- **Registro Pessoal & Introspecção:**
  - Criação de entradas diárias de texto livre para journaling, reflexão, vitórias do dia e descarrego mental.
- **Rastreador de Humor (Mood Tracker):**
  - Seleção de estados emocionais:
    - 😊 Feliz
    - 😐 Neutro
    - 😔 Triste
    - 🔥 Motivado
    - 😴 Cansado
    - 💪 Forte
  - Visualização em timeline cronológica decrescente (mais recentes primeiro) com modal de leitura expandida.

---

### ⚙️ 12. Configurações & Personalização (`Configuracoes.tsx`)
- **Papel de Parede Dinâmico:**
  - Galeria de wallpapers de alta resolução integrados da Unsplash (Biblioteca, Montanhas, Cidade à Noite, Floresta, Oceano, Espaço).
  - Campo para colar qualquer URL de imagem externa para servir como background do LIFE OS.
  - O background é aplicado como variável CSS global (`--bg-image`) e se funde com a camada de Glassmorphism da interface.
- **Perfil do Usuário:**
  - Edição do nome de exibição.
  - Upload de foto de perfil com corte inteligente e compressão via Canvas.
- **Notificações:** Chave para habilitar/desabilitar notificações no navegador.

---

### ⚡ 13. Command Palette Global (`CommandPalette.tsx`)
- **Atalho Rápido:** Acionado por `Cmd + K` (Mac) ou `Ctrl + K` (Windows/Linux) ou pelo botão na barra lateral.
- **Busca Omnibox Unificada:**
  - Filtra instantaneamente **Módulos** da plataforma, **Tarefas** e **Projetos** enquanto o usuário digita.
  - Permite navegar para qualquer tela do aplicativo sem tirar as mãos do teclado.

---

## 4. MODELO DE DADOS (TypeScript Interfaces Principais)

```typescript
// Tarefas
interface Task {
  id: string;
  title: string;
  description?: string;
  tag: 'Projeto' | 'Faculdade' | 'Pessoal' | 'Leitura' | 'Trabalho' | 'Saúde' | 'Outro';
  priority: 'low' | 'medium' | 'high';
  date: string; // YYYY-MM-DD
  done: boolean;
  subtasks: { id: string; title: string; done: boolean }[];
  projectId?: string;
  createdAt: string;
}

// Projetos
interface Project {
  id: string;
  title: string;
  description?: string;
  status: 'Planejamento' | 'Em progresso' | 'Pausado' | 'Concluído';
  color: string;
  createdAt: string;
}

// Sessões de Estudo / Pomodoro
interface PomodoroSession {
  id: string;
  date: string; // YYYY-MM-DD
  duration: number; // minutos
  taskId?: string;
  label?: string;
  createdAt: string;
}

// Rotina
interface RoutineBlock {
  id: string;
  time: string; // "07:00"
  title: string;
  duration: number; // minutos
  category: string;
  days: ('Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex' | 'Sáb' | 'Dom' | 'Todos')[];
  color: string;
}

// Metas
interface Goal {
  id: string;
  title: string;
  description?: string;
  type: 'short' | 'medium' | 'long';
  progress: number; // 0-100
  target: string;
  deadline?: string;
  createdAt: string;
}

// Livros
interface Book {
  id: string;
  title: string;
  author: string;
  status: 'Quero ler' | 'Lendo' | 'Concluído' | 'Abandonado';
  currentPage: number;
  totalPages: number;
  rating?: number; // 1-5
  notes?: string;
  createdAt: string;
}

// Faculdades
interface College {
  id: string;
  name: string;
  course: string;
  period: string;
  subjects: { id: string; name: string; progress: number; grade?: number; notes?: string }[];
  createdAt: string;
}

// Diário
interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood: '😊' | '😐' | '😔' | '🔥' | '😴' | '💪';
  createdAt: string;
}
```

---

## 5. COMO ALIMENTAR E DAR ACESSO AO GEMINI PRO COM ESTE PROJETO

Você pode fornecer o contexto deste projeto ao Gemini Pro de 4 formas recomendadas:

### Opção 1: Upload Direto deste Arquivo Markdown (Mais Prático)
- Este arquivo foi salvo no seu computador em:  
  `Meu LIFE OS/Meu-LIFE-OS-main/PROJETO_CONTEXTO_GEMINI.md`
- No **Gemini Advanced** (ou **Google AI Studio**), clique no botão de anexo (**+** ou ícone de clipe) e selecione este arquivo `.md`. O Gemini Pro vai ler toda a arquitetura, regras de negócio e stack de uma só vez.

### Opção 2: Google AI Studio com o Repositório do GitHub (Mais Avançado)
- Se você tiver o repositório sincronizado no GitHub (ex: `bluejaem/Meu-LIFE-OS`):
  1. Acesse [aistudio.google.com](https://aistudio.google.com/).
  2. Crie um novo chat selecionando o modelo **Gemini 1.5 Pro** ou **Gemini 2.0 Pro**.
  3. No painel de System Instructions ou no prompt inicial, importe os arquivos ou cole a estrutura deste documento.

### Opção 3: Compactar a pasta `src/` em `.zip` e Anexar
- Modelos como o Gemini Pro suportam a leitura direta de arquivos `.zip`.
- Você pode compactar a pasta `src` do projeto e fazer o upload direto no chat do Gemini. Ele analisará o código-fonte de cada componente em conjunto com este documento descritivo.

### Opção 4: Prompt Inicial Pronto para o Gemini Pro (Copie e Cole)
```text
Olá Gemini Pro! Estou desenvolvendo uma aplicação web chamada "Meu LIFE OS" (um ecossistema de produtividade pessoal, acadêmica e profissional estilo Second Brain, feito em React 18, TypeScript, Vite, Tailwind CSS, Zustand e Firebase).

Estou anexando/enviando a documentação completa de todos os módulos, regras de negócio e estrutura técnica do projeto.

Gostaria de sua orientação como Arquiteto de Software e Product Designer para:
1. Analisar potenciais gargalos ou melhorias na arquitetura e UX.
2. Sugerir novas funcionalidades de alto valor (como integração com IA, analytics avançado, etc.).
3. Tirar dúvidas técnicas sobre evolução do código.
```
