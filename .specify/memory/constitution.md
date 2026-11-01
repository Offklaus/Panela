<!--
Sync Impact Report
- Versão: template sem versão → 1.0.0 (primeira ratificação)
- Princípios definidos (substituem os placeholders do template):
  - [PRINCIPLE_1_NAME] → I. Frontend e Backend Separados
  - [PRINCIPLE_2_NAME] → II. Backend como Fonte da Verdade
  - [PRINCIPLE_3_NAME] → III. Sorteio Justo e Verificável
  - [PRINCIPLE_4_NAME] → IV. Testes nas Regras de Negócio (INEGOCIÁVEL)
  - [PRINCIPLE_5_NAME] → V. Interface Fiel ao Design, Acessível e em pt-BR
- Princípios adicionados: VI. Simplicidade
- Seções adicionadas:
  - Restrições Técnicas (era [SECTION_2_NAME])
  - Fluxo de Desenvolvimento (era [SECTION_3_NAME])
- Seções removidas: nenhuma
- Templates em .specify/templates (não alterados por este comando):
  - plan-template.md ✅ compatível: "Constitution Check" e "Complexity Tracking" já existem;
    usar a opção "Web application" (backend/ + frontend/).
  - spec-template.md ✅ compatível.
  - checklist-template.md ✅ sem impacto.
  - tasks-template.md ⚠ atenção no uso: o template trata testes como opcionais; pelo
    Princípio IV, tarefas de backend/src/services e de endpoints DEVEM incluir testes.
- TODOs adiados:
  - TODO(DATABASE): banco de dados ainda não escolhido.
-->

# Times de Society Constitution

## Core Principles

### I. Frontend e Backend Separados

- `frontend/` e `backend/` são projetos independentes: cada um tem o próprio `package.json`,
  as próprias dependências e scripts, e sobe sozinho.
- A comunicação entre os dois acontece SOMENTE por API HTTP REST com JSON. Nenhum lado
  importa código do outro.
- O backend é dividido em camadas: `routes/` → `controllers/` → `services/` → `models/`.
  Regra de negócio fica SÓ em `services/`; `routes/` NÃO DEVE acessar dados direto;
  `controllers/` só traduz HTTP para chamadas de serviço e de volta.
- No frontend, `components/` só renderiza e captura eventos; `services/` é o ÚNICO lugar
  que chama a API; `state/` guarda o estado da tela.

Razão: os dois lados evoluem e são testados de forma independente, e o contrato da API é o
único ponto de acoplamento.

### II. Backend como Fonte da Verdade

- Toda regra de negócio (cadastro de jogadores, nível de 1 a 5, presença, sorteio, banco de
  espera) é executada no backend.
- O frontend NÃO DEVE recalcular times, equilíbrio ou banco; ele exibe o que a API devolve.
- O backend DEVE validar toda entrada em `validators/` (por exemplo: nome não vazio, nível
  inteiro de 1 a 5), mesmo que o frontend também valide.
- Dados persistentes ficam no backend. No frontend, `localStorage` só guarda preferências de
  tela, nunca dados do elenco.

Razão: com uma única implementação de cada regra, o que a tela mostra nunca diverge do que o
servidor guarda.

### III. Sorteio Justo e Verificável

- Só jogadores marcados como presentes entram no sorteio; ausentes nunca aparecem em times
  nem no banco.
- O tamanho do time (hoje 5) é uma constante única no backend; nenhum outro lugar repete
  esse número.
- São necessários pelo menos 2 times completos. Abaixo disso a API devolve zero times e
  informa quantos jogadores faltam.
- Todo jogador presente aparece exatamente uma vez: em um time ou no banco ("aguardando
  vaga"). Todo time tem exatamente o tamanho definido.
- O sorteio DEVE distribuir os jogadores para equilibrar a soma de estrelas dos times; o
  critério exato de equilíbrio é definido na spec do sorteio e coberto por teste. A resposta
  DEVE informar a diferença de estrelas entre o time mais forte e o mais fraco.
- A fonte de aleatoriedade DEVE ser injetável (semente ou função), para que os testes sejam
  determinísticos.

Razão: times equilibrados são a promessa central do produto; essas regras tornam a promessa
verificável por teste.

### IV. Testes nas Regras de Negócio (INEGOCIÁVEL)

- Todo módulo em `backend/src/services/` DEVE ter testes unitários em `backend/tests/` antes
  de ser considerado pronto.
- O sorteio DEVE ter testes para cada regra do Princípio III, incluindo: menos de 10
  presentes, número de presentes múltiplo exato de 5, sobra para o banco e ausentes excluídos.
- Todo endpoint DEVE ter teste de integração HTTP cobrindo o caso de sucesso e pelo menos um
  erro de validação.
- No frontend, a lógica em `utils/` e `state/` DEVERIA ter testes unitários; a parte visual é
  conferida manualmente contra o design.
- Esta regra prevalece sobre o `tasks-template.md`, que trata testes como opcionais.

Razão: o valor do app está na regra do sorteio, e um erro ali passa despercebido na tela.

### V. Interface Fiel ao Design, Acessível e em pt-BR

- A referência visual é o canvas "Times de Society"
  (https://claude.ai/artifact/U1GkVhnNWnChkpdAkkT7Cg): fontes Barlow e Barlow Condensed,
  fundo #F5F5F1, verde-escuro #0D1B12 e destaque #33FF00. Mudança visual relevante DEVE ser
  feita primeiro no canvas.
- Todo texto exibido ao usuário é em português do Brasil; números decimais usam vírgula
  (por exemplo, "3,5").
- Controles DEVEM ser elementos nativos (`<button>`, `<input>` com `<label>`); botões só com
  ícone DEVEM ter `aria-label`; alvos de toque DEVEM ter no mínimo 44×44 px; texto DEVE ter
  contraste de pelo menos 4,5:1.
- A tela DEVE funcionar em largura de celular (360 px) sem rolagem horizontal.

Razão: o app tende a ser usado no celular, na hora de montar os times, por quem organiza o jogo.

### VI. Simplicidade

- O frontend é JavaScript puro com Vite e NÃO DEVE usar framework de UI (React, Vue etc.) sem
  emenda a esta constituição.
- Toda dependência nova, no frontend ou no backend, DEVE ser justificada no `plan.md` da
  feature.
- Nenhuma camada, pasta ou abstração além da estrutura do Princípio I é criada sem uma
  necessidade concreta registrada em "Complexity Tracking" no plano.

Razão: o escopo é pequeno, e cada peça extra é custo de manutenção sem retorno.

## Restrições Técnicas

- Runtime: Node.js 22 LTS ou superior (máquina de desenvolvimento atual: v22.18.0), com npm
  como gerenciador de pacotes.
- Módulos: ES Modules (`import`/`export`) no frontend e no backend.
- Backend: Express, com as rotas da API sob o prefixo `/api`. Respostas de erro seguem um
  formato único, definido no contrato da API (`contracts/`) da primeira feature.
- Idioma do código: nomes de variáveis, funções, arquivos, rotas e campos JSON em inglês;
  textos exibidos ao usuário em pt-BR.
- Configuração por variáveis de ambiente, lidas em `backend/src/config/`. Arquivos `.env` e
  credenciais NUNCA são versionados.
- Banco de dados: TODO(DATABASE): ainda não escolhido. A escolha DEVE ser registrada no
  `plan.md` da primeira feature que persistir dados.

## Fluxo de Desenvolvimento

- Toda feature segue o fluxo Spec Kit: `/speckit-specify` → (`/speckit-clarify`) →
  `/speckit-plan` → `/speckit-tasks` → (`/speckit-analyze`) → `/speckit-implement`.
- A spec DEVE dizer se a feature mexe no frontend, no backend ou nos dois.
- Toda mudança na API DEVE ser descrita em `contracts/` no plano antes de qualquer
  implementação.
- O `plan.md` DEVE usar a estrutura "Web application" (`backend/` + `frontend/`) do template
  de plano.
- Uma tarefa só está concluída quando os testes exigidos pelo Princípio IV passam.

## Governance

- Esta constituição prevalece sobre qualquer outra prática do projeto. Um conflito se resolve
  seguindo a constituição ou emendando-a.
- Emendas são feitas com `/speckit-constitution`, sempre com Sync Impact Report e com a data
  de última emenda atualizada.
- Versionamento semântico: MAJOR para remover ou redefinir um princípio de forma
  incompatível; MINOR para novo princípio ou seção, ou orientação ampliada de forma relevante;
  PATCH para esclarecimentos e ajustes de redação.
- Conformidade: todo `plan.md` passa pelo "Constitution Check", e uma violação só é aceita se
  justificada em "Complexity Tracking". O `/speckit-analyze` trata conflito com esta
  constituição como problema CRÍTICO.

**Version**: 1.0.0 | **Ratified**: 2026-11-01 | **Last Amended**: 2026-11-01
