# Plano de Gerenciamento de Configuração — MoneyMap

**Versão:** 1.0  
**Data:** 09/09/2026  
**Projeto:** MoneyMap — Aplicação Web de Gestão Financeira Pessoal  
**Desenvolvedor:** Cauê P.

---

## 1. Introdução

O presente documento define como o sistema MoneyMap será gerenciado do ponto de vista de configuração ao longo do seu desenvolvimento e operação. Ele estabelece diretrizes para controle de versão, rastreabilidade de mudanças e automação de processos, alinhando o projeto a práticas modernas de desenvolvimento como CI/CD e Infraestrutura como Código (IaC). O objetivo central é garantir que o sistema evolua de forma organizada, previsível e segura, independentemente do porte da equipe envolvida.

### 1.1 Finalidade

Este plano tem como propósito definir e documentar os procedimentos que orientam o ciclo de vida dos artefatos do MoneyMap — desde o código-fonte até a infraestrutura de banco de dados. Com ele, busca-se garantir que toda mudança aplicada ao sistema seja identificada, registrada e implantada de maneira controlada, reduzindo riscos e facilitando a recuperação diante de eventuais falhas. A automação ocupa papel central nesse processo, substituindo etapas manuais por pipelines reproduzíveis e auditáveis.

### 1.2 Escopo

Este PGC aplica-se ao desenvolvedor **Cauê P.**, único responsável pelo desenvolvimento e manutenção do **MoneyMap** — aplicação web voltada ao controle financeiro pessoal, que oferece funcionalidades como registro de receitas e despesas, gestão de parcelamentos, categorização de gastos e autenticação de usuários via conta Google. O plano cobre os arquivos de código-fonte (`index.html`, `app.js`, `style.css`), o banco de dados hospedado no Supabase e os processos relacionados ao versionamento, controle de mudanças e implantação da aplicação.

### 1.4 Referências

- Documento base: Processos de Desenvolvimento de Software e a Integração com GCS.
- Template do Plano de Gerenciamento de Configuração (RUP 7.0, IBM) — adaptado.
- Documentação oficial do Supabase — autenticação, banco de dados e Row Level Security (RLS). Disponível em: https://supabase.com/docs
- Documentação oficial do Git — controle de versão e fluxo de branches. Disponível em: https://git-scm.com/doc
- Conventional Commits — padrão de mensagens de commit adotado no projeto. Disponível em: https://www.conventionalcommits.org
- Semantic Versioning (SemVer) — esquema de versionamento adotado. Disponível em: https://semver.org
- Documentação do Chart.js — biblioteca de gráficos utilizada no frontend. Disponível em: https://www.chartjs.org/docs
- Documentação do jsPDF — biblioteca de exportação em PDF. Disponível em: https://artskydj.github.io/jsPDF/docs
- Vercel — plataforma de hospedagem e deploy contínuo. Disponível em: https://vercel.com/docs

### 1.5 Visão Geral

No contexto do MoneyMap, a Gestão de Configuração de Software não é tratada como uma etapa isolada do desenvolvimento, mas como uma prática contínua integrada ao fluxo de trabalho diário. A cada alteração realizada no sistema — seja uma correção pontual, uma nova funcionalidade ou uma mudança no schema do banco de dados — o processo de GCS entra em ação de forma automatizada, garantindo que o código seja validado, versionado e implantado sem depender de intervenções manuais.

Essa abordagem se apoia em pipelines de CI/CD que, a partir de cada commit integrado à branch principal, executam automaticamente as etapas de verificação e entrega. Como resultado, cada mudança gera evidências concretas de rastreabilidade: logs de execução do pipeline, tags de versão semântica e artefatos publicados na plataforma de hospedagem. Isso permite que o histórico completo do sistema seja consultado a qualquer momento, com clareza sobre o que foi alterado, quando e por quem.

Por se tratar de um projeto desenvolvido individualmente, o plano prioriza leveza e automação, eliminando etapas burocráticas sem abrir mão do rigor necessário para manter a estabilidade e a confiabilidade da aplicação em produção.

---

## 2. Cultura DevOps e Papéis na Gerência de Configuração

A GCS do MoneyMap é conduzida dentro de uma cultura DevOps, onde desenvolvimento e operação são responsabilidade de uma mesma pessoa. Seguindo o princípio "você constrói, você executa", o desenvolvedor acompanha o sistema em todas as suas etapas — da escrita do código ao monitoramento em produção — apoiado por automação para reduzir esforço manual e minimizar erros. Os papéis descritos abaixo refletem as responsabilidades envolvidas no processo, todas exercidas pelo mesmo indivíduo no contexto deste projeto.

| Papel | Responsabilidades |
|---|---|
| **Desenvolvedor** | Implementar funcionalidades e correções, criar branches seguindo a convenção definida, escrever mensagens de commit no padrão Conventional Commits e abrir Pull Requests para integração |
| **Revisor de Código** | Avaliar as mudanças propostas antes do merge, verificar impacto no código existente, no banco de dados e na experiência do usuário |
| **Engenheiro de Configuração** | Manter o repositório organizado, gerenciar as regras de proteção de branches, definir e atualizar o pipeline de CI/CD e garantir que os itens de configuração estejam devidamente versionados |
| **Responsável pelo Deploy** | Validar o ambiente de homologação antes de promover mudanças para produção, aplicar tags de versão e monitorar a estabilidade após cada implantação |
| **Administrador de Infraestrutura** | Gerenciar o projeto no Supabase — schema do banco, políticas de segurança (RLS), backups e credenciais de acesso |

---

## 3.2 Ambientes e Infraestrutura

Os ambientes do MoneyMap são provisionados de forma simples e rastreável, aproveitando a natureza estática do frontend e os recursos gerenciados do Supabase. Por se tratar de uma aplicação sem servidor de aplicação próprio, a infraestrutura é enxuta e toda configuração sensível é mantida fora do código-fonte.

| Ambiente | Finalidade | Gatilho de promoção |
|---|---|---|
| **Desenvolvimento** | Ambiente local do desenvolvedor, utilizado para implementação e testes iniciais de funcionalidades | Commit na branch `feature/*` ou `fix/*` |
| **Homologação / Staging** | Validação funcional da aplicação antes de ir a produção, com dados de teste isolados | Pipeline de CI aprovado após merge na branch `develop` |
| **Produção** | Ambiente acessado pelos usuários finais, com dados reais e monitoramento ativo | Aprovação manual após validação em staging, com merge na branch `main` e geração de tag de versão |

**Detalhamento por ambiente:**

**Desenvolvimento**
- Execução local via browser (arquivo aberto diretamente ou servidor local simples)
- Conectado ao projeto Supabase de desenvolvimento (projeto separado do de produção)
- Credenciais armazenadas em variável no topo do `app.js` — nunca comitadas com a chave de produção

**Homologação / Staging**
- Hospedado na Vercel, vinculado à branch `develop`
- URL de preview gerada automaticamente pela Vercel a cada push (ex: `moneymap-git-develop.vercel.app`)
- Conectado ao projeto Supabase de staging, com banco isolado
- Credenciais (`SUPABASE_URL`, `SUPABASE_KEY`) armazenadas como variáveis de ambiente no painel da Vercel — nunca expostas no repositório

**Produção**
- Hospedado na Vercel, vinculado à branch `main`
- URL fixa (ex: `moneymap.vercel.app` ou domínio customizado)
- Conectado ao projeto Supabase de produção
- Credenciais armazenadas como variáveis de ambiente no painel da Vercel
- Políticas de Row Level Security (RLS) ativas no Supabase, garantindo isolamento total dos dados por usuário
- Backups automáticos gerenciados pelo próprio Supabase

**Topologia geral:**

```
Usuário (browser)
      │
      ▼
  Vercel CDN
(index.html + app.js + style.css)
      │
      ▼
  Supabase
  ├── Auth (OAuth Google)
  ├── PostgreSQL (items, parcelas, feedbacks, feedback_respostas)
  └── RLS (isolamento por user_id)
```

---

## 3.3 Estratégia de Branching e Versionamento

O MoneyMap adota o **GitHub Flow** como estratégia de branching, modelo adequado para projetos com desenvolvedor único e ciclos de entrega contínuos. A premissa central é manter a branch principal sempre em estado implantável, com mudanças integradas por meio de branches de vida curta e revisadas antes do merge.

**Estrutura de branches:**

A branch `main` representa o código em produção e é protegida — só aceita merge via Pull Request com pipeline verde. Todo desenvolvimento parte dela e retorna a ela pelo mesmo caminho.

Para novas funcionalidades, cria-se uma branch `feature/<descrição-curta>`, com vida idealmente inferior a dois dias. Correções de bugs seguem o mesmo padrão, usando o prefixo `fix/`. Em situações emergenciais, uma branch `hotfix/<descrição>` é criada diretamente de `main`, corrigida e retro-integrada imediatamente após o merge. A branch `release/x.y` é opcional e utilizada apenas quando há necessidade de congelar o escopo antes de uma entrega maior.

Exemplos de nomes de branch:
```
feature/exportar-csv
feature/filtro-por-categoria
fix/calculo-saldo-incorreto
hotfix/login-google-quebrado
release/1.2
```

**Versionamento Semântico (SemVer):**

O projeto segue o esquema `MAJOR.MINOR.PATCH`. O número `MAJOR` é incrementado em mudanças incompatíveis, como troca de banco de dados ou reestruturação do schema. O `MINOR` sobe a cada nova funcionalidade entregue, como uma nova tela ou tipo de gráfico. O `PATCH` cobre correções de bug sem adição de funcionalidade. As tags são aplicadas diretamente na branch `main` a cada entrega, gerando um histórico rastreável de versões.

**Conventional Commits:**

Todas as mensagens de commit seguem o padrão `<tipo>(<escopo opcional>): <descrição curta>`, viabilizando a geração automática de changelog pelo pipeline. Os tipos aceitos são `feat` para novas funcionalidades, `fix` para correções, `hotfix` para emergências em produção, `refactor` para reestruturações sem mudança de comportamento, `style` para ajustes visuais, `docs` para documentação e `chore` para configurações e scripts de pipeline.

Exemplos de commits:
```
feat(parcelas): adicionar edição do valor total do parcelamento
fix(dashboard): corrigir exibição do saldo negativo no card
hotfix(auth): corrigir loop de redirecionamento no login Google
chore(ci): configurar pipeline de deploy automático na Vercel
docs: atualizar README com instruções de configuração
```

---

## 4.3 Estrutura do Repositório

O repositório do MoneyMap é organizado de forma simples, refletindo a natureza estática da aplicação. A estrutura atual contempla os artefatos de código-fonte e será expandida para incluir diretórios de documentação, pipelines e migrações de banco de dados à medida que o projeto evolui.

```
moneymap/
│
├── index.html              # Estrutura da página, modais e views da aplicação
├── app.js                  # Lógica da aplicação: CRUD, autenticação, gráficos, parcelas, feedback
├── style.css               # Design system, temas dark/light e responsividade
│
├── .github/
│   └── workflows/
│       ├── ci.yml          # Pipeline de integração contínua (lint, validação)
│       └── cd.yml          # Pipeline de entrega contínua (deploy na Vercel)
│
├── docs/
│   ├── PGC.md              # Plano de Gerenciamento de Configuração
│   ├── CHANGELOG.md        # Histórico de versões e mudanças
│   └── schema.md           # Documentação das tabelas do banco de dados
│
├── migrations/
│   ├── 001_create_items.sql
│   ├── 002_create_parcelas.sql
│   ├── 003_create_feedbacks.sql
│   └── 004_create_feedback_respostas.sql
│
├── .gitignore              # Arquivos e diretórios ignorados pelo Git
└── README.md               # Visão geral do projeto, instruções de configuração e execução
```

Por se tratar de uma aplicação frontend pura, sem processo de build ou dependências instaláveis, não há diretórios como `/node_modules`, `/dist` ou arquivos como `package.json`. A ausência de um servidor de aplicação próprio também dispensa um diretório `/infra` com IaC tradicional — a infraestrutura é inteiramente gerenciada pelo Supabase e pela Vercel.

---

## 5.3 Critérios de Qualidade (Quality Gate)

Para que uma mudança seja promovida entre ambientes — de desenvolvimento para staging, ou de staging para produção — ela deve satisfazer os critérios objetivos abaixo. O pipeline bloqueia automaticamente a promoção em caso de falha em qualquer um deles.

**Lint e formatação**
- Zero erros de lint bloqueantes no `app.js` — avisos são permitidos, erros não
- Máximo de 5 avisos de lint acumulados — acima disso, o pipeline emite alerta para revisão

**Segurança**
- Zero vulnerabilidades classificadas como críticas ou altas nas dependências externas (Chart.js, jsPDF, Supabase JS SDK)
- Zero segredos ou credenciais detectados no código-fonte — qualquer ocorrência bloqueia o pipeline imediatamente
- 100% das tabelas do Supabase com RLS ativa antes de qualquer promoção para produção

**Testes funcionais**
- Zero erros registrados no console do browser durante validação em staging
- 100% dos fluxos críticos validados manualmente antes do merge para `main`: login, criação de lançamento, edição, remoção, cálculo de saldo, geração de PDF e fluxo de parcelamentos
- Tempo de carregamento inicial da página em staging inferior a 3 segundos em conexão padrão (medido via DevTools — aba Network)

**Build e entrega**
- 100% dos recursos estáticos carregados sem erro HTTP (nenhum status 4xx ou 5xx nos assets)
- Deploy de preview gerado pela Vercel com status de sucesso — falhas de build bloqueiam o merge

**Versionamento**
- Zero commits fora do padrão Conventional Commits na branch `main` — verificado automaticamente via commitlint no pipeline
- Tag de versão semântica obrigatória antes de cada deploy em produção

---

## 8. Controle de Configuração e Mudança

### 8.1 Processo de Solicitação de Mudança

Mudanças de rotina no MoneyMap — novas funcionalidades, correções de bug e ajustes visuais — seguem o fluxo padrão do GitHub Flow, que por si só já constitui o registro formal e rastreável da mudança:

1. Abertura de issue no repositório descrevendo a mudança, seu impacto e os arquivos envolvidos
2. Criação de branch `feature/` ou `fix/` a partir de `main`
3. Implementação e commit seguindo o padrão Conventional Commits
4. Abertura de Pull Request com descrição da mudança e referência à issue
5. Execução automática do pipeline de CI — lint, segurança e validação de commits
6. Revisão e aprovação do PR
7. Merge na branch `main` e execução automática do pipeline de CD
8. Verificação do deploy em produção e fechamento da issue

### 8.2 Comitê de Controle de Mudança (CCM)

Por se tratar de um projeto individual, o CCM é composto pelo próprio desenvolvedor em conjunto com o professor orientador, que atua como revisor externo nas situações de maior impacto. A aprovação por revisão de PR substitui o comitê formal em situações rotineiras.

**Composição do CCM:**

- **Desenvolvedor (Cauê P.)** — propõe, implementa e documenta a mudança
- **Professor orientador** — revisa e aprova mudanças de alto impacto antes da implantação em produção

**Critérios objetivos para acionamento do CCM:**

O CCM deve ser acionado obrigatoriamente quando a mudança se enquadrar em ao menos um dos critérios abaixo:

- Alteração no schema do banco de dados em produção — adição, remoção ou modificação de tabelas e colunas
- Mudança nas políticas de segurança (RLS) do Supabase
- Troca ou atualização de credenciais de acesso ao Supabase ou à Vercel
- Substituição ou atualização de dependência externa (Chart.js, jsPDF, Supabase JS SDK) para versão com breaking changes
- Aplicação de hotfix emergencial diretamente sobre a branch `main` sem passagem por staging
- Qualquer mudança que afete o fluxo de autenticação dos usuários ou o isolamento de dados entre contas

Fora desses critérios, o fluxo padrão de PR com pipeline verde é suficiente para autorizar a mudança.

---

## 11. Marcos

Os marcos abaixo representam as entregas internas relacionadas ao esforço de GCS e DevOps do MoneyMap, organizados em ordem cronológica de execução ao longo do ciclo de vida do projeto.

**Marco 1 — Baseline inicial do repositório**
Estruturação do repositório com a organização de diretórios definida no plano, configuração do `.gitignore`, criação do `README.md` e registro da primeira tag de versão (`v1.0.0`) na branch `main`. Este marco representa o ponto de partida formal do controle de configuração.

**Marco 2 — Documentação do schema do banco de dados**
Criação dos arquivos de migração SQL no diretório `/migrations`, documentando todas as tabelas existentes no Supabase (`items`, `parcelas`, `feedbacks`, `feedback_respostas`) com suas colunas, tipos e políticas de RLS. A partir deste marco, qualquer alteração no banco passa a ser versionada junto ao código.

**Marco 3 — Implantação do pipeline de CI**
Configuração do workflow de integração contínua (`.github/workflows/ci.yml`), com execução automática de lint, verificação de segredos no código e validação do padrão de commits a cada Pull Request aberto.

**Marco 4 — Implantação do pipeline de CD**
Configuração do workflow de entrega contínua (`.github/workflows/cd.yml`), com deploy automático na Vercel a partir do merge na branch `main`. A partir deste marco, toda mudança aprovada chega a produção sem intervenção manual.

**Marco 5 — Primeira release automatizada**
Execução completa do fluxo de ponta a ponta pela primeira vez: commit seguindo Conventional Commits → PR aprovado → CI verde → merge → CD executado → tag de versão gerada automaticamente → changelog atualizado. Este marco valida o funcionamento integral do pipeline.

**Marco 6 — Adoção completa do processo de GCS**
Confirmação de que todas as mudanças do projeto passam pelo fluxo definido neste plano, o CCM está operacional para mudanças de alto impacto e os critérios de quality gate estão sendo aplicados consistentemente a cada entrega.

---

## 12. Treinamento e Recursos

**Ferramentas utilizadas**

O conjunto de ferramentas necessário para implementar e manter as práticas descritas neste plano é composto por:

- **Git e GitHub** — controle de versão, gestão de branches, Pull Requests e histórico de mudanças
- **GitHub Actions** — automação dos pipelines de CI e CD, execução de lint, verificação de segredos e deploy
- **Vercel** — hospedagem da aplicação e deploy contínuo integrado ao repositório GitHub
- **Supabase** — banco de dados PostgreSQL gerenciado, autenticação OAuth e políticas de segurança (RLS)
- **ESLint** — análise estática do código JavaScript para detecção de erros e inconsistências
- **commitlint** — validação automática do padrão Conventional Commits nas mensagens de commit
- **truffleHog ou git-secrets** — detecção de credenciais e segredos expostos no código-fonte
- **jsPDF e Chart.js** — bibliotecas externas utilizadas na aplicação, monitoradas quanto a atualizações e vulnerabilidades
- **Kiro IDE / VS Code** — ambiente de desenvolvimento local

**Pessoal**

Por se tratar de um projeto individual, todas as responsabilidades técnicas e operacionais são exercidas pelo desenvolvedor **Cauê P.**, com suporte e revisão do professor orientador nos momentos definidos pelo CCM.

**Treinamento necessário**

Os conhecimentos necessários para implementar e manter as práticas deste plano são:

- **GitHub Actions** — criação e manutenção de workflows de CI/CD, sintaxe YAML, uso de actions do marketplace e configuração de variáveis de ambiente e segredos no repositório
- **Conventional Commits e SemVer** — aplicação consistente do padrão de commits e geração de tags de versão semântica
- **Supabase** — gerenciamento de schema via painel e SQL, configuração de políticas RLS, uso de variáveis de ambiente para isolamento de credenciais por ambiente
- **Vercel** — configuração de projetos, definição de variáveis de ambiente por ambiente (desenvolvimento, staging e produção) e integração com GitHub
- **ESLint** — configuração de regras de lint para JavaScript puro (sem framework), integração com o pipeline de CI
- **Segurança básica em aplicações web** — boas práticas de exposição de credenciais, funcionamento do OAuth 2.0 e isolamento de dados por usuário

Todos os recursos de treinamento estão disponíveis gratuitamente nas documentações oficiais das ferramentas listadas, referenciadas na seção 1.4 deste plano.

---

## 13. Controle de Software de Subcontratados, Fornecedores e Dependências de Terceiros

O MoneyMap não possui subcontratados ou fornecedores de software customizado, porém depende de serviços gerenciados e bibliotecas externas que são tratados como itens de configuração e controlados com o mesmo rigor aplicado ao código-fonte do projeto.

**Dependências externas identificadas**

As bibliotecas são carregadas via CDN diretamente no `index.html`, com versões fixas declaradas explicitamente nas URLs de importação:

```html
<!-- Versões fixas — nunca usar @latest em produção -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
<script type="module">
  import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm";
</script>
```

A fixação explícita de versões nas URLs substitui o papel do lockfile em projetos que não utilizam gerenciador de pacotes, garantindo que o ambiente de produção sempre carregue exatamente a versão validada pelo pipeline.

**Análise de vulnerabilidades (SCA)**

A análise de composição de software é integrada ao pipeline de CI e executada a cada Pull Request. Por não haver `package.json`, a verificação é realizada consultando o banco de dados de vulnerabilidades do OSV (Open Source Vulnerabilities) para as versões fixadas das bibliotecas. Qualquer vulnerabilidade classificada como alta ou crítica bloqueia o merge automaticamente.

**Atualização de dependências**

Atualizações de versão das bibliotecas externas são tratadas como mudanças formais no projeto e seguem o mesmo fluxo de PR definido na seção 8.1. O processo ocorre da seguinte forma:

- Verificação periódica de novas versões das bibliotecas (mensal ou mediante alerta de vulnerabilidade)
- Abertura de issue documentando a versão atual, a nova versão e o changelog relevante
- Atualização da URL no `index.html` em branch `chore/atualizar-<biblioteca>`
- Validação funcional completa em staging antes do merge — dado que atualizações de bibliotecas podem introduzir breaking changes
- Merge somente após pipeline verde e confirmação de que todos os fluxos críticos continuam funcionando

**Serviços gerenciados**

O Supabase e a Vercel são fornecedores de infraestrutura gerenciada. Ambos possuem seus próprios ciclos de atualização, que ocorrem de forma transparente. As responsabilidades do projeto em relação a esses serviços são monitorar comunicados de depreciação, manter as credenciais de acesso atualizadas e validar o comportamento da aplicação após qualquer atualização anunciada pelos fornecedores.

Não há software desenvolvido por subcontratados externos incorporado ao projeto.

---

## 14. Quadro-Resumo do Pipeline CI/CD

Resumo do fluxo padrão do MoneyMap, do commit à produção:

| Etapa | Descrição | Gatilho |
|---|---|---|
| **CI** | Lint do `app.js` via ESLint, validação do padrão Conventional Commits via commitlint, verificação de segredos expostos via truffleHog e análise de vulnerabilidades nas dependências externas | Abertura ou atualização de Pull Request |
| **Merge** | Integração da mudança na branch `main` após aprovação do PR com pipeline CI verde | Aprovação do PR + CI verde |
| **CD — Staging** | Deploy automático na Vercel gerando URL de preview para validação funcional manual dos fluxos críticos | Merge na branch `develop` |
| **Gate de Release** | Confirmação manual de que todos os fluxos críticos foram validados em staging e que os critérios de quality gate foram atendidos | Sucesso da validação em staging |
| **CD — Produção** | Deploy automático na Vercel em produção, geração de tag de versão semântica e atualização do `CHANGELOG.md` | Aprovação do gate de release |

*Por se tratar de uma aplicação estática com frontend puro, não há etapa de build ou publicação de imagem de container. Os quatro pilares da GCS — identificação, controle de versão, controle de mudanças e auditoria — são suportados integralmente pela automação dos pipelines descritos acima.*
