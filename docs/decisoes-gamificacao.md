# Decisões de produto — Gamificação

Registro vivo das decisões que orientarão o PRD. O modelo em
[`database/vdev-quest.dbml`](./database/vdev-quest.dbml) é a fonte de verdade
para a persistência atual; telas e mocks são apenas evidência de experiência
desejada.

## Premissas herdadas (antes da entrevista)

Itens que já constavam no modelo de banco ou no pedido inicial. Eles não são
decisões tomadas durante a entrevista; as decisões posteriores estão no
histórico abaixo.

| Tema | Decisão / fato confirmado | Fonte |
| --- | --- | --- |
| Papéis | Há dois papéis: `collaborator` e `manager`. O gestor cria/publica missões e modera entregas. | Banco |
| EXP | `core.users.xp` é o total materializado usado no ranking. Cada concessão é auditada em `gamification.xp_awards`. | Banco |
| Níveis | O nível é derivado do XP e da tabela `gamification.levels`; não é armazenado no usuário. | Banco e requisito |
| Missões | Missões possuem rascunho/publicada, período de disponibilidade, tipo de evidência, recorrência, fases e EXP por fase. | Banco |
| Submissões | Uma submissão é pendente, aprovada ou recusada; recusa exige justificativa. A aprovação deve conceder XP na mesma transação. | Banco |
| Perfil | O colaborador personaliza o avatar e acompanha o histórico de entregas. | Banco e requisito |
| Ranking | Exibe usuários com nome, título ativo, badges, nível, XP e avatar; posição e progresso são projeções. | Banco e requisito |
| Titles e badges | O gestor cria catálogos. A atribuição automática/manual ainda não está no escopo inicial. | Requisito |
| Importação | O gestor importará arquivos `.xlsx` com `mission_id`, `email` e `phase`. | Requisito |

## Lacunas a decidir

| Tema | Lacuna | Impacto no PRD / banco |
| --- | --- | --- |
| Invalidação | Não há estado ou trilha de reversão após aprovação. | Exige definir regra e provavelmente evoluir `submissions`/`xp_awards`. |
| Check-in | O esquema impede mais de uma aprovação por pessoa/fase, mas o requisito prevê várias submissões com bônus. | Exige definir ocorrências, limites e cálculo de bônus. |
| Badge | `gamification.badges` não possui `image_path`. | Exige evolução do esquema para cumprir o requisito. |
| Importação | Não está definido o que a planilha cria, como valida, nem se concede XP. | Exige fluxo, feedback e idempotência. |
| Ranking | O mockup cita temporada, enquanto o XP modelado é acumulado. | Exige definir escopo, empates e atualização. |

## Histórico de decisões

### 2026-09-03 — Rodada 1

| Tema | Decisão | Impacto |
| --- | --- | --- |
| Papel administrativo | `manager` é o administrador do MVP. | Não criar um terceiro papel. |
| Submissões | Não há aprovação/reprovação. Toda submissão é criada válida e concede a recompensa imediatamente; o administrador poderá invalidá-la depois. | O atual enum `pending/approved/rejected`, a fila de moderação e o fluxo de aprovação não atendem ao produto. Será necessário um estado de invalidação auditável e uma concessão de XP no envio. |
| Check-in | Há, no máximo, um check-in válido por usuário por dia. | A modelagem precisa de uma ocorrência/data de check-in, pois a unicidade atual é por missão/fase e não por dia. |
| Bônus de check-in | O backend aplica regras fixas no mês-calendário: 10º check-in: +10 XP; 15º: +5 XP; 20º: +5 XP. O bônus não usa fases. | O cálculo deve contar os check-ins válidos anteriores no mês, conceder o bônus somente nos marcos e registrar as concessões para permitir reversão. |
| Importação | Cada linha válida do `.xlsx` cria uma conclusão sem evidência e concede a recompensa; entradas inválidas recebem relatório. | É necessário definir idempotência, autoria/auditoria da importação e compatibilidade com check-ins. |
| Ranking | É global, por XP acumulado, sem temporadas no MVP. Empates são ordenados por número de submissões e, persistindo, por nome em ordem alfabética. | O mockup não representa uma regra de temporada. A projeção do ranking precisa de contagem de submissões e ordenação determinística. |
| Catálogos e avatar | Badges exigem `image_path`; não haverá atribuição de badges/titles neste escopo. Todo o catálogo de avatar fica disponível a todos. | Incluir `image_path` em `gamification.badges`; não criar inventário/desbloqueio nem fluxo de atribuição. |
| Níveis | As faixas são administradas diretamente no banco; não haverá interface de gestão. | O PRD deve cobrir somente a leitura/derivação do nível. |
| Fases normais | O usuário conclui as fases em ordem e pode ter uma conclusão válida por fase. Se ela for invalidada, pode enviar novamente a mesma fase. | A regra de unicidade deverá considerar somente a conclusão ainda válida. |
| Check-in: XP-base | O check-in usa 1 XP-base, pré-preenchido ao criar a missão. No esquema atual, este valor só pode morar em `mission_phases.xp_reward`, não em `quests.missions`; portanto, check-in deve iniciar com uma fase 1 única de 1 XP. | O bônus continua independente das fases. |
| Acesso | O MVP utiliza SSO corporativo, criando/atualizando o usuário no primeiro acesso com papel `collaborator`; o papel administrativo é alterado diretamente no banco. | O e-mail normalizado permanece a identidade canônica. |
| Invalidação | A invalidação subtrai de `core.users.xp` exatamente o `amount` da recompensa original. Não haverá uma tabela nem um lançamento negativo adicional. | Persistir na submissão o estado de invalidada, administrador, data e justificativa; manter o `xp_awards` positivo original como prova do XP concedido. A transação deve impedir invalidar duas vezes e não pode permitir XP negativo. |
| Importação | Não haverá tela de prévia/confirmação. Check-ins e missões recorrentes são rejeitados; as linhas avançam submissões elegíveis em FIFO. | O arquivo é validado integralmente antes da gravação: qualquer erro o rejeita sem gerar submissão ou XP. |
| Recorrência | Missões recorrentes criam oportunidades de conclusão por ocorrência agendada. Em uma missão semanal, cada dia selecionado é uma ocorrência: ao selecionar segunda e quarta, há uma submissão válida possível em cada uma dessas datas. Check-in mensal é uma exceção submetível diariamente. | As submissões precisam identificar a ocorrência/data para que a unicidade não bloqueie recompensas futuras. |
| Ciclo de vida da missão | Não haverá rascunho nem publicação: a criação torna a missão visível. Regras de negócio ficam bloqueadas após a primeira submissão. | Remover `draft/published/published_at` do esquema e adaptar a UI. |
| Invalidação | A invalidação é definitiva e exige justificativa do administrador. | Não criar fluxo de restauração no MVP. |
| Importação: atomicidade | Um arquivo que contenha ao menos uma linha inválida é rejeitado integralmente; nenhuma linha gera submissão ou XP. | Validar todas as linhas antes da transação que efetiva a importação e devolver os erros ao administrador. |
| Calendário | Períodos e ocorrências usam `America/Sao_Paulo`: dia civil local, semana de segunda a domingo e mês civil. | Backend, consulta de mural e cálculo de bônus devem usar o mesmo fuso. |
| Bônus após invalidação | O saldo de check-in é recalculado para todo o mês quando uma submissão de check-in deixa de ser válida. O usuário fica com o XP-base de cada check-in válido e somente os bônus dos marcos ainda atingidos. | A invalidação de um check-in pode retirar também bônus que haviam sido concedidos por check-ins posteriores. A persistência de XP não pode tratar esses bônus como concessões irrevogáveis. |
| Fases e recorrência | Fases são permitidas apenas em missões não recorrentes. Missões recorrentes e check-ins têm uma fase única. | Simplifica a unicidade por ocorrência e evita progressão de fase ambígua. |
| Desempate do ranking | Conta apenas submissões válidas. | Submissões invalidadas não melhoram a posição de ninguém. |
| Catálogos | `code` de title/badge é gerado pelo backend a partir do nome. Title recebe nome e descrição opcional; badge recebe nome, descrição opcional e `image_path` obrigatório. | Administrador não preenche identificadores técnicos. |
| Cancelamento pelo colaborador | O colaborador pode cancelar diretamente a própria submissão; não há solicitação nem aprovação. O registro permanece para auditoria e o XP é revogado. | Distinguir o ator e o motivo entre cancelamento pelo colaborador e invalidação pelo administrador. |
| Dependência entre fases | Invalidar ou cancelar uma fase invalida automaticamente todas as fases posteriores já concluídas na mesma missão e revoga os respectivos XP. | A operação deve descobrir a cadeia de fases, preservar as submissões e executar as reversões atomicamente. |
| Ledger de XP | `gamification.xp_awards` será evoluída, sem criar tabela adicional, para registrar movimentos positivos e negativos de XP. Cada movimento identifica usuário, submissão quando aplicável, fase, tipo, valor, referência ao movimento revertido e data. | Nunca alterar ou apagar um movimento de XP: cancelamentos, invalidações e recálculos inserem movimentos compensatórios. `core.users.xp` é atualizado na mesma transação e permanece o total de leitura do ranking. |
| Importação: escopo | A planilha aceita apenas missões não recorrentes; check-ins e outras missões recorrentes são rejeitados. | As três colunas atuais não identificam uma ocorrência recorrente. |
| Importação: usuários | Todo e-mail precisa pertencer a um colaborador existente via SSO. | A planilha não cria contas; um único e-mail inválido rejeita o arquivo inteiro. |
| Transparência | Perfil e mural exibem também submissões canceladas e invalidadas, incluindo data, motivo e XP revertido. | Alterações de XP, nível e ranking ficam explicáveis ao colaborador. |
| Missões repetíveis por entidade | Missões não recorrentes podem ter várias submissões independentes para o mesmo colaborador (ex.: várias indicações). A planilha não recebe identificador externo: uma linha de fase 1 cria uma submissão; fases seguintes avançam, em FIFO, a submissão elegível mais antiga. | A mesma submissão é atualizada para a fase atual; o sistema a exibe como `Indicação #1`, `#2` etc., mas não identifica a pessoa indicada. A trilha dos XP por fase fica no ledger. |
| Cancelamento/invalidação de submissão multifase | A ação sempre afeta a submissão inteira: marca-a como cancelada/inválida e reverte todas as recompensas acumuladas nas fases que ela alcançou. | Não há rebaixamento de fase nem reativação no MVP. |
| Importação FIFO | Linhas são processadas na ordem da planilha. Uma fase só avança a submissão válida elegível que esteja exatamente na fase anterior; sem candidata, o arquivo inteiro é rejeitado. | A validação simula o arquivo inteiro antes de gravar qualquer linha. |
| Progressão de fases | Em todas as missões multifase, inclusive no mural, uma única submissão progride por suas fases. | A modelagem precisa guardar a fase atual sem perder as evidências e os eventos das fases anteriores. |
| Evidências por fase | A evidência deixa de ficar em `quests.submissions`. Será criada a tabela filha `quests.submission_phase_evidences`, uma linha por submissão e fase que tenha evidência. | `submissions` guarda a fase atual e o estado da submissão; o histórico de evidências de cada etapa não é sobrescrito. Todas as missões já possuem fase 1. |
| Etapas importadas | A importação não cria registro na tabela de evidências. | Ela atualiza a fase atual da submissão e registra o XP/auditoria no ledger. Etapas enviadas pelo mural continuam exigindo a evidência definida na missão. |
| Check-in mensal | Na criação, o administrador ativa a opção de check-in. A missão vem preenchida com o mês/ano atual e recompensa-base de 1 XP, mas ambos podem ser editados. Só pode existir um check-in por mês/ano. | O front usa seletor de mês/ano e deriva as datas existentes. Backend e banco validam a unicidade mensal a partir de `start_date`, sem criar a coluna `checkin_month`. |
| Avanço no mural | O colaborador vê e envia somente a próxima fase elegível; não pode escolher/pular etapas. | O backend deriva a fase seguinte da submissão ativa. |
| Reenvio por ocorrência | Uma submissão cancelada ou invalidada libera novamente a ocorrência diária/semanal/check-in enquanto ela estiver vigente. | A unicidade é aplicada apenas à submissão válida. |
| Exclusão de missão | O administrador pode “excluir” uma missão por invalidação lógica; ela não é apagada fisicamente. | A missão deixa de ser disponível e todas as submissões válidas vinculadas são invalidadas, com reversão de todo XP. Para check-ins, o saldo e os bônus mensais são recalculados. |
| Data do check-in | O colaborador escolhe a data de competência somente na missão de check-in do mês/ano corrente. Pode escolher do primeiro dia do mês até o dia atual, nunca uma data futura. | Guardar a data na etapa da submissão, além de `submitted_at`; a unicidade diária e os bônus mensais usam a data escolhida. |
| Invalidação de missão | Não exige justificativa. O front exibe aviso e confirmação antes de o administrador confirmar a ação. | A missão e seus registros continuam no histórico como invalidados. |

## Alterações necessárias no banco

Esta seção traduz as decisões de produto em mudanças no modelo conceitual. Ela
é o checklist para a futura migration; não é SQL executável.

### `quests.missions`

- Substituir o ciclo `draft`/`published` por estado operacional `active` e
  `invalidated`. Remover `published_at`, pois a missão se torna disponível ao
  ser criada.
- Adicionar `invalidated_at` e `invalidated_by_email` para auditar a exclusão
  lógica feita pelo administrador. Justificativa não é obrigatória para este
  caso.
- Adicionar `allows_multiple_submissions boolean not null default false`. Ele
  permite casos como “Indicação de pessoas”, em que o mesmo colaborador possui
  várias submissões independentes na mesma missão; nas demais missões não
  recorrentes, continua existindo uma submissão por colaborador.
- Para `is_checkin = true`, manter `start_date` no primeiro e `end_date` no
  último dia do mês escolhido. Criar uma restrição/índice único que impeça duas
  missões de check-in para o mesmo mês e ano, inclusive se uma delas tiver sido
  invalidada. Não criar a coluna `checkin_month`.
- Check-ins continuam com uma única fase. O valor de `xp_reward` dessa fase é
  pré-preenchido com `1` no front, mas pode ser alterado pelo administrador.

### `quests.submissions`

- Transformar a linha em uma submissão única: renomear `phase` para
  `current_phase`. Cada avanço atualiza esse campo na mesma submissão.
- Substituir `pending`/`approved`/`rejected` por estados que representem o
  fluxo real: `active`, `cancelled` e `invalidated`.
- Remover os campos de aprovação/reprovação (`reviewer_email`, `reviewed_at`,
  `justification`) e os campos de payload de evidência
  (`evidence_value`, `attachment_object_key`, `original_file_name`,
  `mime_type`, `file_size_bytes`), que passam para a tabela filha de fases.
- Adicionar auditoria de encerramento: data, ator e tipo da ação. O
  cancelamento é feito pelo próprio colaborador; a invalidação é feita pelo
  administrador e exige justificativa.
- Adicionar `occurrence_date`: nulo em missões não recorrentes e obrigatório
  em recorrências/check-ins. No check-in, guarda a data escolhida pelo
  colaborador e sustenta a unicidade diária e o cálculo dos bônus mensais.
- Remover os índices únicos parciais de pendência/aprovação. Eles não suportam
  múltiplas indicações nem recorrências. A unicidade deverá considerar somente
  submissões `active`, a ocorrência aplicável e o modo de submissão da missão.

### Nova tabela `quests.submission_phase_evidences`

Uma linha representa uma fase alcançada dentro de uma submissão. Ela preserva
o histórico sem transformar cada fase em uma nova submissão.

- Chave única: `submission_id + phase_number`.
- Campos de evidência que saem de `submissions`: texto/link ou chave privada
  do anexo, nome original, MIME type e tamanho.
- `submitted_at`: momento em que a etapa foi registrada.
- Cada registro deve obedecer ao `evidence_type` da missão. Avanços de fase
  por importação não criam registros nesta tabela.

### `gamification.xp_awards`

Evoluir a tabela existente para um ledger imutável de movimentos de XP; não
criar uma segunda tabela de ajustes.

- Trocar a PK atual `submission_id` por `id` próprio, permitindo vários
  movimentos para a mesma submissão.
- Adicionar `user_email`, `phase_number`, `movement_type`,
  `related_award_id` e `created_at`.
- `related_award_id` liga uma reversão ao movimento positivo exato que ela
  compensa. Mês do check-in vem de `submissions.occurrence_date`; ator e
  justificativa ficam na submissão que foi cancelada ou invalidada, sem
  duplicá-los no ledger.
- Permitir `amount` positivo e negativo, nunca zero.
- Tipos mínimos: recompensa de fase, XP-base de check-in, bônus de marco de
  check-in, cancelamento pelo colaborador, invalidação pelo administrador,
  reversão por dependência de fase e correção de bônus de check-in.
- Não atualizar nem apagar movimentos: toda reversão insere uma linha de valor
  negativo ligada ao movimento original quando houver um único alvo.
- `core.users.xp` permanece materializado para o ranking e é atualizado na
  mesma transação que cada novo movimento do ledger.

### `gamification.badges`

- Adicionar `image_path text not null`, pois a imagem do badge é um caminho de
  arquivo informado pelo administrador.

### Regras transacionais e índices

- Quando o usuário envia a evidência para concluir a próxima fase
  disponível da sua submissão, o sistema grava a evidência daquela fase,
  atualiza `current_phase`, registra o XP correspondente no ledger e atualiza
  `users.xp`, tudo na mesma transação.
- Ao importar um arquivo, validar todas as linhas antes de gravar qualquer
  dado. Se uma falhar, rejeitar o arquivo inteiro. A importação aceita apenas
  missões não recorrentes, e-mails de colaboradores já existentes e fases
  alcançáveis na ordem FIFO das linhas.
- Para uma missão de múltiplas submissões, o arquivo é processado de cima para
  baixo. Cada linha de fase 1 cria uma nova submissão; uma linha de fase
  posterior avança a submissão `active` elegível mais antiga que esteja
  exatamente na fase anterior. Esse é o FIFO das linhas e das submissões: se a
  fase posterior vier antes de existir uma candidata, o arquivo é rejeitado.
- Ao cancelar ou invalidar uma submissão, marcá-la com o estado correspondente
  e registrar no ledger os movimentos negativos necessários para retirar do
  total do usuário todos os XP concedidos por ela, na mesma transação.
  Invalidar uma missão executa essa operação para todas as submissões ativas
  vinculadas.
- Ao invalidar/cancelar um check-in, recalcular o saldo do mês: XP-base de
  check-ins válidos e bônus de `+10` no 10º, `+5` no 15º e `+5` no 20º.
- Criar os seguintes índices:

  | Nome | Tabela | Definição | Finalidade |
  | --- | --- | --- | --- |
  | `users_xp_desc_idx` | `core.users` | `(xp DESC)` | Leitura do ranking global por XP. |
  | `submissions_fifo_active_idx` | `quests.submissions` | `(mission_id, collaborator_email, current_phase, submitted_at ASC) WHERE status = 'active'` | Encontrar, na importação, a submissão ativa mais antiga que pode avançar para a fase seguinte. |
  | `submissions_collaborator_history_idx` | `quests.submissions` | `(collaborator_email, submitted_at DESC)` | Exibir no perfil o histórico de submissões do colaborador. |

  A chave única/primária `(submission_id, phase_number)` de
  `quests.submission_phase_evidences` já é o índice usado para abrir o
  histórico de fases e evidências de uma submissão; não é necessário criar
  outro índice para essa consulta.
- Atualizar políticas RLS: colaborador escreve e cancela apenas as próprias
  submissões/fases; administrador cria, edita, importa, invalida e consulta o
  conjunto necessário para gestão. Clientes nunca escrevem diretamente em
  `users.xp` ou no ledger.

### Decisões derivadas ainda abertas

Nenhuma lacuna de regra de negócio identificada na entrevista atual.
