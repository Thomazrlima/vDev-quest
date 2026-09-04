# Alterações futuras da modelagem — vDev Quest

**Versão:** 1.0  
**Status:** especificação para futura migration  
**Última atualização:** 03/09/2026  
**Modelo de origem:** [`vdev-quest.dbml`](./vdev-quest.dbml)  
**PRD:** [`../PRD-vDev-Quest.md`](../PRD-vDev-Quest.md)  
**Decisões:** [`../decisoes-gamificacao.md`](../decisoes-gamificacao.md)

## 1. Objetivo

Este documento consolida todas as mudanças necessárias no modelo PostgreSQL
atual para implementar as regras finais do vDev Quest. Ele descreve o estado
alvo e os requisitos de integridade, mas não substitui a migration SQL, a
revisão de segurança nem os testes.

## 2. Resumo das mudanças

| Área | Estado atual | Estado alvo |
| --- | --- | --- |
| Missão | `draft` ou `published` | `active` ou `invalidated`; sem publicação. |
| Submissão | Uma linha por tentativa/fase, com aprovação | Uma linha por submissão, com fase atual e XP imediato. |
| Evidência | Payload dentro de `submissions` | Uma linha por submissão/fase em tabela filha, somente quando há evidência. |
| Moderação | Aprovar ou recusar | Invalidar uma submissão já válida. |
| Cancelamento | Não existe | Colaborador cancela a própria submissão. |
| XP | Uma concessão positiva por submissão | Vários movimentos positivos/negativos por submissão. |
| Recorrência | Metadados sem ocorrência persistida | Uma submissão válida por ocorrência agendada. |
| Check-in | Booleano sem regra persistente completa | Uma missão por mês; uma submissão válida por data; bônus recalculável. |
| Badge | Sem imagem | `image_path` obrigatório. |
| Importação | Não modelada | `.xlsx` atômico, sem evidência, com avanço FIFO. |

## 3. Enums

### 3.1 Manter

- `core.user_role`: `collaborator`, `manager`.
- `quests.evidence_type`: `photo`, `pdf`, `link`, `text`.
- `quests.recurrence_type`: `none`, `daily`, `weekly`, `monthly`.
- `quests.weekday`.
- Enums de avatar existentes.

### 3.2 Alterar

Substituir os valores de `quests.mission_status`:

```text
draft, published
→
active, invalidated
```

Substituir os valores de `quests.submission_status`:

```text
pending, approved, rejected
→
active, cancelled, invalidated
```

Criar `gamification.xp_movement_type` com, no mínimo:

```text
phase_reward
checkin_base_reward
checkin_milestone_reward
user_cancellation_reversal
admin_invalidation_reversal
mission_invalidation_reversal
checkin_bonus_correction
```

Os nomes finais podem ser ajustados na migration, desde que cada motivo tenha
semântica estável e não dependa de textos traduzidos.

Criar `quests.submission_status_change_source`:

```text
user_cancellation
admin_invalidation
mission_invalidation
```

## 4. Alterações por tabela

### 4.1 `core.users`

Manter:

- `email` como chave primária normalizada;
- `name`;
- `role`;
- `xp` como saldo materializado;
- datas de criação e atualização.

Novas regras:

- `xp` continua maior ou igual a zero.
- O backend é o único escritor de `xp`.
- Após cada transação, `xp` deve ser igual à soma de
  `gamification.xp_awards.amount` para o usuário.
- O papel `manager` é apresentado como **Administrador** no produto.

Índice novo:

```sql
create index users_xp_desc_idx
on core.users (xp desc);
```

### 4.2 `quests.missions`

Remover:

- `published_at`;
- semântica de rascunho/publicação.

Alterar:

- `status` passa a aceitar somente `active` e `invalidated`.
- O valor padrão de `status` passa a ser `active`.

Adicionar:

| Coluna | Tipo sugerido | Nulabilidade | Finalidade |
| --- | --- | --- | --- |
| `allows_multiple_submissions` | `boolean` | `not null`, padrão `false` | Permitir várias submissões independentes por colaborador, como indicações. |
| `invalidated_at` | `timestamptz` | nulo | Data da exclusão lógica. |
| `invalidated_by_email` | `text` | nulo | Administrador que invalidou a missão. |

Restrições:

- Missão `active`: `invalidated_at` e `invalidated_by_email` nulos.
- Missão `invalidated`: ambos preenchidos.
- A FK de `invalidated_by_email` aponta para `core.users.email` com
  `ON UPDATE CASCADE` e `ON DELETE RESTRICT`.
- Não guardar justificativa para invalidação de missão.
- Toda missão tem pelo menos uma fase.
- Missão recorrente ou check-in tem exatamente uma fase.
- Missão semanal tem ao menos um dia em `mission_weekdays`.
- Missões não semanais não têm registros em `mission_weekdays`.
- Depois da primeira submissão, não permitir mudança em evidência, fases, XP,
  recorrência, dias, datas, check-in ou multiplicidade.

Check-in:

- `is_checkin = true` exige `recurrence_type = monthly`.
- `start_date` deve ser o primeiro dia do mês escolhido.
- `end_date` deve ser o último dia do mesmo mês.
- A fase única recebe XP configurável; o front sugere 1 XP.
- Não criar a coluna `checkin_month`.
- Impedir mais de uma missão de check-in para o mesmo mês e ano, mesmo se a
  missão anterior estiver invalidada.

Índice único sugerido:

```sql
create unique index missions_one_checkin_per_month_uidx
on quests.missions (
  (extract(year from start_date)),
  (extract(month from start_date))
)
where is_checkin = true;
```

### 4.3 `quests.mission_phases`

Manter a chave `(mission_id, phase_number)` e os campos `phase_title` e
`xp_reward`.

Regras adicionais:

- `phase_number` começa em 1.
- Fases são sequenciais e não podem ter lacunas.
- `xp_reward` é inteiro positivo.
- O valor copiado para o livro-razão não muda se a configuração da missão for
  alterada antes de receber submissões.
- Fases não são atualizadas ou removidas após a primeira submissão da missão.

### 4.4 `quests.mission_weekdays`

Manter a estrutura existente.

Semântica final:

- Cada dia selecionado gera uma ocorrência independente.
- Uma missão semanal em segunda e quarta admite uma submissão válida em cada
  segunda e em cada quarta dentro da vigência.

### 4.5 `quests.submissions`

A tabela passa a representar uma submissão completa que avança por fases.

Renomear:

| Atual | Novo | Motivo |
| --- | --- | --- |
| `phase` | `current_phase` | Indicar a fase atual da mesma submissão. |

Remover campos de evidência:

- `evidence_value`;
- `attachment_object_key`;
- `original_file_name`;
- `mime_type`;
- `file_size_bytes`.

Remover campos do fluxo de aprovação:

- `reviewer_email`;
- `reviewed_at`;
- regra de aprovação/recusa;
- justificativa de recusa.

Adicionar:

| Coluna | Tipo sugerido | Nulabilidade | Finalidade |
| --- | --- | --- | --- |
| `occurrence_date` | `date` | nulo para missão não recorrente | Identificar a ocorrência diária, semanal, mensal ou a data escolhida do check-in. |
| `status_changed_at` | `timestamptz` | nulo enquanto `active` | Data do cancelamento ou invalidação. |
| `status_changed_by_email` | `text` | nulo enquanto `active` | Colaborador que cancelou ou administrador que invalidou. |
| `status_change_source` | `quests.submission_status_change_source` | nulo enquanto `active` | Distinguir cancelamento, invalidação direta e invalidação causada pela missão. |
| `invalidation_justification` | `text` | nulo salvo quando `invalidated` diretamente | Justificativa obrigatória da invalidação administrativa de submissão. |

Semântica dos estados:

- `active`: a submissão é válida, esteja em andamento ou na última fase.
- `cancelled`: o próprio colaborador cancelou a submissão inteira.
- `invalidated`: o administrador ou a invalidação da missão retirou sua
  validade.

Restrições:

- `current_phase` deve existir na mesma missão.
- `active` exige campos de encerramento e `status_change_source` nulos.
- `cancelled` exige `user_cancellation`, data e ator iguais ao colaborador da
  submissão; não exige justificativa.
- `invalidated` por ação direta exige `admin_invalidation`, data,
  administrador e justificativa não vazia.
- `invalidated` por invalidação da missão exige `mission_invalidation`, data e
  administrador, mas não exige justificativa.
- Uma submissão encerrada não pode voltar a `active` no MVP.
- `occurrence_date` é obrigatória para recorrências e check-ins.
- Check-in aceita apenas data dentro do mês da missão, entre o primeiro dia e
  o dia atual em `America/Sao_Paulo`.
- Uma submissão cancelada/invalida deixa de bloquear um novo envio da mesma
  ocorrência.

Índices a remover:

- `submissions_one_pending_per_collaborator_mission_phase_uidx`;
- `submissions_one_approval_per_collaborator_mission_phase_uidx`;
- índices voltados à fila por `pending`.

Índices a criar:

```sql
create index submissions_fifo_active_idx
on quests.submissions (
  mission_id,
  collaborator_email,
  current_phase,
  submitted_at asc
)
where status = 'active';

create index submissions_collaborator_history_idx
on quests.submissions (collaborator_email, submitted_at desc);

create unique index submissions_one_active_occurrence_uidx
on quests.submissions (mission_id, collaborator_email, occurrence_date)
where status = 'active' and occurrence_date is not null;
```

A regra de uma submissão válida para missão não recorrente e não múltipla
depende de `missions.allows_multiple_submissions`, que está em outra tabela.
Ela deve ser protegida na função transacional de criação com bloqueio da
missão e consulta da submissão existente. Um índice adicional em
`(mission_id, collaborator_email, status)` deve apoiar essa verificação se os
testes de plano indicarem necessidade.

### 4.6 Nova tabela `quests.submission_phase_evidences`

Esta tabela armazena somente evidências realmente enviadas pelo mural. Uma
fase importada pela planilha não cria uma linha vazia.

Estrutura alvo:

| Coluna | Tipo sugerido | Regra |
| --- | --- | --- |
| `submission_id` | `uuid` | FK para `quests.submissions.id`; parte da PK. |
| `phase_number` | `integer` | Parte da PK; deve pertencer à missão da submissão. |
| `evidence_value` | `text` | Texto ou URL; nulo para arquivo. |
| `attachment_object_key` | `text` | Chave privada do objeto; nulo para texto/link. |
| `original_file_name` | `text` | Obrigatório para arquivo. |
| `mime_type` | `text` | Obrigatório para arquivo. |
| `file_size_bytes` | `bigint` | Obrigatório para arquivo; máximo de 10 MiB. |
| `submitted_at` | `timestamptz` | Momento do envio da evidência. |

Chave e relações:

- PK `(submission_id, phase_number)`.
- FK `submission_id → submissions.id`, com `ON DELETE RESTRICT`.
- Regra transacional garante que `phase_number` pertença à mesma missão.

Payload:

- Exatamente um modo: arquivo ou `evidence_value`.
- Foto: `image/png` ou `image/jpeg`.
- PDF: `application/pdf`.
- Link: URL HTTP/HTTPS válida.
- Texto: valor não vazio após `btrim`.
- O tipo exigido vem de `quests.missions.evidence_type`.

A PK já cria o índice para abrir o histórico de uma submissão em ordem de
fase. Não criar outro índice idêntico.

### 4.7 `gamification.xp_awards`

A tabela existente passa de “uma recompensa por submissão” para um
livro-razão imutável de movimentos de XP.

Estrutura alvo:

| Coluna | Tipo sugerido | Regra |
| --- | --- | --- |
| `id` | `uuid` | Nova PK, preferencialmente UUIDv7. |
| `user_email` | `text` | FK para `core.users.email`; obrigatório. |
| `submission_id` | `uuid` | FK para `quests.submissions.id`; obrigatório para os movimentos do MVP. |
| `phase_number` | `integer` | Fase associada; nulo apenas quando não houver fase aplicável. |
| `amount` | `integer` | Positivo ou negativo; nunca zero. |
| `movement_type` | `gamification.xp_movement_type` | Motivo estável do movimento. |
| `related_award_id` | `uuid` | FK autorreferente para o movimento positivo que está sendo compensado. |
| `created_at` | `timestamptz` | Data do movimento. |

Remover:

- PK atual em `submission_id`;
- check `amount > 0`.

Adicionar:

- check `amount <> 0`;
- FK autorreferente de `related_award_id` com `ON DELETE RESTRICT`;
- índice `(user_email, created_at)` para reconciliação;
- índice `(submission_id, created_at)` para explicar o XP da submissão;
- proteção de idempotência para não reverter o mesmo movimento mais de uma
  vez.

Regras:

- Movimentos não são alterados nem apagados.
- Recompensa usa valor positivo.
- Cancelamento, invalidação e correção usam valor negativo.
- Movimento negativo que desfaz uma concessão aponta para ela por
  `related_award_id`.
- Mês de check-in é obtido por `submissions.occurrence_date`; não duplicar
  `period_month`.
- Ator e justificativa ficam na submissão; não duplicar `actor_email` ou
  `reason` no livro-razão.

Exemplo:

| ID | Submissão | Fase | Tipo | Valor | Relacionado a |
| --- | --- | --- | --- | --- | --- |
| A1 | S42 | 1 | `phase_reward` | +1 | — |
| A2 | S42 | 2 | `phase_reward` | +4 | — |
| A3 | S42 | 2 | `admin_invalidation_reversal` | -4 | A2 |
| A4 | S42 | 1 | `admin_invalidation_reversal` | -1 | A1 |

### 4.8 `gamification.badges`

Adicionar:

```text
image_path text not null
```

O caminho é informado pelo administrador. A aplicação deve validar formato e
existência conforme a estratégia de armazenamento adotada.

### 4.9 Tabelas sem mudança estrutural obrigatória

- `gamification.levels`: administrada diretamente no banco.
- `gamification.titles`: `code` gerado pelo backend na criação.
- `gamification.user_titles`: permanece para leitura; não há atribuição no MVP.
- `gamification.user_badges`: permanece para leitura; não há atribuição no MVP.
- tabelas de avatar: mantêm catálogo e escolhas por usuário.

## 5. Regras transacionais

### 5.1 Enviar evidência e avançar fase

Na mesma transação:

1. Bloquear missão, submissão e usuário relevantes.
2. Validar papel, missão `active`, vigência e ocorrência.
3. Calcular a próxima fase; o cliente não informa XP.
4. Validar e gravar `submission_phase_evidences`.
5. Criar ou atualizar `submissions.current_phase`.
6. Inserir movimento positivo no livro-razão.
7. Incrementar `core.users.xp` pelo mesmo valor.
8. Confirmar tudo ou desfazer tudo.

### 5.2 Avançar fase por importação

1. Ler e validar todas as linhas do arquivo em memória/área temporária.
2. Simular as linhas de cima para baixo.
3. Fase 1 cria submissão conforme a regra de multiplicidade.
4. Fase posterior escolhe a submissão `active` elegível mais antiga do mesmo
   usuário e missão.
5. Não criar registro em `submission_phase_evidences`.
6. Atualizar `current_phase`, inserir XP e atualizar saldo.
7. Qualquer falha cancela a importação inteira.

### 5.3 Cancelar ou invalidar submissão

1. Bloquear submissão e usuário.
2. Confirmar que a submissão ainda está `active`.
3. Gravar estado, ator, data e, quando aplicável, justificativa.
4. Localizar todos os movimentos positivos ainda não compensados da submissão.
5. Inserir um movimento negativo relacionado para cada movimento positivo.
6. Subtrair a soma de `core.users.xp`.
7. Se for check-in, recalcular os marcos do mês e inserir os ajustes adicionais.
8. Confirmar tudo ou desfazer tudo.

### 5.4 Invalidar missão

1. Marcar a missão como `invalidated` e registrar administrador/data.
2. Impedir novas submissões imediatamente.
3. Invalidar todas as submissões `active` vinculadas.
4. Compensar todos os XP ainda válidos.
5. Recalcular bônus de check-in, se aplicável.
6. Não exigir justificativa.

Para grande volume, a execução pode ser feita em lote interno. Mesmo nesse
caso, a missão deve deixar de aceitar envios antes do processamento e a API
deve expor um estado operacional seguro até o término. Se esse processamento
assíncrono for adotado, será necessário modelar seu estado em uma migration
posterior; ele não está detalhado no modelo alvo deste documento.

### 5.5 Recalcular check-in

Para cada usuário e missão de check-in:

1. Contar submissões `active` com datas distintas no mês.
2. Calcular `quantidade × xp_reward`.
3. Adicionar +10 se a quantidade for pelo menos 10.
4. Adicionar +5 se for pelo menos 15.
5. Adicionar +5 se for pelo menos 20.
6. Comparar o saldo devido com os movimentos válidos já registrados.
7. Inserir movimentos compensatórios para chegar ao saldo correto.
8. Atualizar `core.users.xp` pelo delta.

Exemplo com recompensa-base de 1 XP:

```text
20 check-ins válidos = 20 + 10 + 5 + 5 = 40 XP
19 check-ins válidos = 19 + 10 + 5 = 34 XP
Delta ao cancelar um dos 20 = -6 XP
```

## 6. Regras de unicidade e concorrência

- Uma missão tem fases sequenciais e sem lacunas.
- Uma submissão avança apenas para `current_phase + 1`.
- Uma evidência existe no máximo uma vez por submissão/fase.
- Uma ocorrência aceita no máximo uma submissão `active` por usuário.
- Check-in aceita no máximo uma submissão `active` por usuário/data.
- Uma missão de check-in é única por mês/ano.
- A escolha FIFO deve usar `submitted_at` e um desempate estável por `id`.
- Funções de escrita devem bloquear as linhas antes de verificar unicidade.
- Toda operação recebe chave de idempotência no contrato da API ou aplica uma
  chave natural equivalente.
- Uma recompensa ou reversão não pode ser aplicada duas vezes por repetição de
  requisição.

## 7. Projeções de leitura

### 7.1 Ranking

1. Ler `core.users.xp` em ordem decrescente.
2. Contar submissões `active` para o desempate.
3. Ordenar por nome quando XP e contagem forem iguais.
4. Resolver o nível em `gamification.levels`.
5. Anexar title ativo, badges e avatar.
6. Nunca expor e-mail.

### 7.2 Perfil

Consultar submissões do usuário em `submitted_at desc`, anexar evidências por
fase e movimentos de XP. Estados cancelados e invalidados continuam visíveis.

### 7.3 Mural

Consultar apenas missões `active`. A disponibilidade é derivada de vigência,
recorrência, ocorrência, submissão atual e próxima fase.

### 7.4 Gestão administrativa

Consultar submissões por missão, colaborador, estado e data. Não existe fila
de aprovação; a ação disponível sobre submissão `active` é invalidar.

## 8. RLS e privilégios

| Recurso | Colaborador | Administrador (`manager`) | Serviço privilegiado |
| --- | --- | --- | --- |
| Usuários | Ler o próprio perfil e projeções públicas. | Ler dados necessários à gestão. | Criar por SSO, alterar papel e atualizar XP. |
| Missões | Ler missões disponíveis. | Criar, editar e invalidar. | Executar invalidação em lote. |
| Submissões | Criar, ler e cancelar apenas as próprias. | Ler e invalidar conforme gestão. | Executar transações de XP/importação. |
| Evidências | Criar e ler apenas as próprias. | Ler evidências necessárias à invalidação. | Gerar URLs temporárias. |
| Livro-razão | Ler projeção própria, se exposta pela API. | Consultar para auditoria. | Único escritor. |
| Avatar | Ler/escrever o próprio. | Sem acesso especial. | Administrar catálogo fora do MVP. |
| Catálogos | Ler. | Criar titles e badges. | Seeds e manutenção técnica. |

Requisitos:

- Ativar e forçar RLS em tabelas com dados de usuário.
- Revogar privilégios padrão de `public`.
- Funções privilegiadas usam schema privado, `security definer`,
  `search_path = ''` e lista mínima de permissões.
- Colunas usadas em políticas devem ter índices compatíveis.

## 9. Estratégia de migração

### Etapa 1 — Preparação

- Fazer backup e ensaio em cópia anonimizada.
- Medir submissões por estado e verificar divergências atuais de XP.
- Criar novos enums, colunas e tabela filha sem remover os campos antigos.
- Criar novos índices de forma compatível com o volume do ambiente.

### Etapa 2 — Conversão dos dados

- Converter missões `published` para `active`.
- Decidir com Produto como tratar eventuais rascunhos existentes; a sugestão é
  migrá-los para `active` somente após revisão manual.
- Agrupar submissões antigas por colaborador/missão quando representarem fases
  da mesma submissão. Esse pareamento precisa de regra de migração específica,
  pois o modelo antigo não possui identificador de cadeia.
- Copiar payloads antigos para `submission_phase_evidences`.
- Converter aprovações existentes em submissões `active` com movimentos
  positivos no livro-razão.
- Tratar pendências e recusas antigas em rotina de saneamento aprovada pelo
  Produto; o novo domínio não possui esses estados.
- Reconciliar o saldo materializado de cada usuário.

### Etapa 3 — Escrita dupla temporária, se necessária

- Publicar backend capaz de ler estrutura antiga e nova.
- Durante a janela de migração, impedir que dois caminhos concedam XP.
- Validar contagens, saldos, ranking e histórico.

### Etapa 4 — Corte

- Ativar as novas funções transacionais e políticas RLS.
- Alterar o frontend para os estados finais.
- Bloquear escrita nos campos antigos.
- Remover fluxo de aprovação/moderação antiga.

### Etapa 5 — Limpeza

- Remover colunas, enums, checks e índices antigos somente após reconciliação e
  período de observação.
- Atualizar `vdev-quest.dbml` para refletir o modelo implantado.
- Publicar runbook de reconciliação e recuperação.

## 10. Testes obrigatórios

### Estrutura

- Checks e FKs rejeitam fase inexistente e estado inconsistente.
- Uma evidência não pode pertencer duas vezes à mesma submissão/fase.
- Dois check-ins não podem existir para o mesmo mês.
- Badge sem `image_path` é rejeitado.

### Transações

- Falha ao gravar evidência não concede XP.
- Falha ao gravar XP não avança fase.
- Retentativa não duplica recompensa.
- Duas requisições simultâneas não usam a mesma candidata FIFO.
- Cancelamento/invalidação repetidos não retiram XP duas vezes.
- Invalidar missão remove exatamente o XP ainda válido de suas submissões.

### Check-in

- Datas de outro mês e futuras são recusadas.
- Datas passadas do mês atual são aceitas.
- Segundo check-in `active` na mesma data é recusado.
- Cancelamento libera a data para reenvio.
- Marcos 10, 15 e 20 concedem +10, +5 e +5.
- Mudança de 20 para 19 check-ins retira o XP-base cancelado e o bônus de 20.

### Importação

- Cabeçalhos ausentes, UUID inválido, e-mail inexistente, fase inexistente,
  missão recorrente ou check-in rejeitam o arquivo inteiro.
- Fase fora de ordem rejeita o arquivo inteiro.
- Fases 1 repetidas criam submissões distintas quando a missão permite.
- Fases posteriores avançam as submissões na ordem FIFO.
- Nenhuma linha importada cria evidência.

### Reconciliação

- Para cada usuário, a soma do livro-razão é igual a `core.users.xp`.
- Ranking usa somente o saldo materializado consistente.
- Submissões canceladas/invalidadas não contam no desempate.
