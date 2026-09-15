# Banco de dados do vDev Quest

Este diretório descreve o futuro banco PostgreSQL a partir do domínio do produto e do modelo em [`vdev-quest.dbml`](./vdev-quest.dbml). O DBML é a fonte única para o diagrama no dbdiagram e para a documentação publicada no dbdocs.

O modelo é conceitual e ainda não é uma migration executável. As regras finais confirmadas estão em [`alteracoes-modelagem-vdev-quest.md`](./alteracoes-modelagem-vdev-quest.md); o DBML já reflete esse estado alvo.

## Artefatos

| Arquivo | Finalidade |
| --- | --- |
| `vdev-quest.dbml` | Entidades, enums, restrições, índices, relações, notas e grupos visuais em DBML. |
| `alteracoes-modelagem-vdev-quest.md` | Especificação do estado alvo: transações, unicidade, check-in, importação, RLS e migração. |
| `README.md` | Mapeamento do domínio, regras entre tabelas, projeções, acesso e publicação. |

## Visão do modelo

O esquema foi separado por responsabilidade:

- `core`: usuários e papéis (`manager` = Administrador no produto);
- `quests`: missões, fases, recorrência, submissões e evidências por fase;
- `avatar`: catálogo Mana Seed e aparência escolhida;
- `gamification`: níveis, badges, titles e livro-razão de EXP.

São 16 tabelas. Ranking, mural, perfil e gestão administrativa são leituras derivadas dessas fontes. Não existe fila de aprovação: XP é concedido no envio; cancelamento e invalidação geram movimentos negativos no livro-razão.

## Mapeamento de `src/types`

| Contrato TypeScript | Persistência ou projeção |
| --- | --- |
| `MissionFormData`, `Mission` | `quests.missions` + `quests.mission_phases` + `quests.mission_weekdays`. Recompensa por fase; `is_checkin` e `allows_multiple_submissions` em `missions`. Status `active`/`invalidated`. Datas viram `date` e `updatedAt` vira `timestamptz`. `hasProgress` é derivado por `EXISTS`. |
| `MuralSubmission`, `EvidenceSubmission` | `quests.submissions` + `quests.submission_phase_evidences` + `missions.evidence_type`. A submissão guarda `current_phase` e `occurrence_date`; a evidência fica na tabela filha. O `kind` da resposta é derivado (`photo`/`pdf` → `file`; `link` → `link`; `text` → `text`). Título, colaborador e `previewUrl` são montados pela API. |
| `MuralMission`, `FeedEntry` | Projeções de missão `active` + submissões do colaborador autenticado. Não criam tabelas. |
| `Collaborator` | Projeção de `core.users`; `email` é a chave do usuário, `initials` é calculado de `name` e o e-mail não é exposto. |
| `RankingLeader`, `RankingEntry` | Projeção de usuários (`name`, `xp`), nível, badge(s), title ativo e avatar. Desempate por contagem de submissões `active`, depois nome. `position`, `progress` e `exp` formatada são calculados. |
| `ManaSeedItem`, `ManaSeedSlotDefinition` | Catálogo em `avatar.items` e `avatar.slot_definitions`. |
| `ManaSeedAppearance`, `ManaSeedColors`, `BodyType` | `avatar.user_avatars` + `avatar.user_slot_settings`. Uma linha por slot evita JSONB e permite FKs. |
| `Lobby*`, `ManaSeedLayer`, `ManaSeedRecolor`, `ManaSeedFrame`, direções e poses | Estado de navegação/renderização; permanece no frontend. |
| Filtros, labels, `EvidenceInput`, presets e auras | Configuração ou estado efêmero de UI; permanece no código enquanto não houver edição administrativa. |

Os enums persistidos usam valores estáveis em inglês. A API traduz, por exemplo, `active`/`cancelled`/`invalidated` e `photo` para os rótulos em português do produto.

## Decisões de PostgreSQL

- O e-mail normalizado é a PK de `core.users`; as FKs de usuário são `text` e usam nomes explícitos como `collaborator_email` e `user_email`. As demais tabelas usam UUIDv7.
- E-mail como PK é uma decisão acoplada e sensível: e-mails devem ser normalizados em minúsculas, tratados como chave e alterados apenas por uma operação transacional controlada. As FKs usam `ON UPDATE CASCADE` quando a troca for autorizada.
- Para as demais entidades, habilite `pg_uuidv7` e confirme a função `uuid_generate_v7()` no ambiente alvo.
- Identificadores usam minúsculas e `snake_case`; não exigem aspas em consultas.
- Strings usam `text`; datas civis usam `date`; instantes usam `timestamptz`; EXP e tamanhos usam tipos numéricos.
- Toda FK possui um índice cujo primeiro campo é a coluna referenciada, isoladamente ou em índice composto.
- `core.users.xp` é o saldo materializado; após cada transação deve igualar a soma de `gamification.xp_awards.amount` do usuário. Somente o backend escreve `xp`.
- `gamification.xp_awards` é livro-razão imutável: créditos (recompensa) e débitos (reversão/correção), com `movement_type` e `related_award_id` nas compensações.
- `gamification.user_badges` e `gamification.user_titles` permanecem para leitura; não há atribuição no MVP. Um title ativo por usuário (índice único parcial).
- `quests.mission_phases` é a fonte única de `phase_number`, `phase_title` e `xp_reward`.
- `quests.missions.evidence_type` é a única fonte do tipo de evidência. `file`/`link`/`text` é projeção de resposta.
- Evidências enviadas pelo mural ficam em `quests.submission_phase_evidences`; importação `.xlsx` não cria evidência.
- A aparência usa tabelas normalizadas. JSONB só deve ser reconsiderado se slots ou atributos passarem a ser verdadeiramente dinâmicos.
- `attachment_object_key` guarda uma chave privada do storage. URLs temporárias, miniaturas em base64 e URLs assinadas não são persistidas.
- Badges exigem `image_path` obrigatório.

## Regras que atravessam tabelas

DBML documenta bem restrições locais, mas estas regras precisam de transação, trigger ou função de serviço na migration. O detalhe está em [`alteracoes-modelagem-vdev-quest.md`](./alteracoes-modelagem-vdev-quest.md).

1. Enviar evidência e avançar fase: bloquear missão/submissão/usuário; validar missão `active`, vigência e ocorrência; gravar evidência; atualizar `current_phase`; inserir movimento positivo; incrementar `core.users.xp` — tudo na mesma transação.
2. O valor da concessão copia `mission_phases.xp_reward`; o cliente não informa XP. O `amount` histórico não muda se a missão for editada depois.
3. Toda submissão referencia uma fase existente da mesma missão por `(mission_id, current_phase)`. Fases começam em 1, são sequenciais e sem lacunas.
4. O payload em `submission_phase_evidences` corresponde a `missions.evidence_type`: foto/PDF usam anexo; link/texto usam `evidence_value`. Exatamente um modo por linha.
5. Links aceitam apenas HTTP(S); anexos aceitam os MIME types previstos e no máximo 3 MiB.
6. Missão `weekly` exige ao menos um `mission_weekdays`; os outros tipos não aceitam dias. Cada dia semanal gera ocorrência independente.
7. Após a primeira submissão, evidência, fases, XP, recorrência, dias, datas, check-in e multiplicidade ficam imutáveis.
8. Missão recorrente ou check-in tem exatamente uma fase; toda missão tem ao menos uma.
9. Check-in exige `recurrence_type = monthly`, vigência no mês civil e no máximo uma missão de check-in por mês/ano (mesmo invalidada).
10. Cancelar/invalidar submissão: marcar estado, inserir movimentos negativos ligados aos positivos ainda não compensados, atualizar saldo; se for check-in, recalcular marcos.
11. Invalidar missão: marcar `invalidated`, invalidar submissões `active`, compensar XP ainda válido; sem justificativa.
12. Importação `.xlsx` é atômica, sem evidência, com avanço FIFO pela submissão `active` mais antiga.
13. A peça escolhida deve pertencer ao mesmo slot. A FK composta em DBML já representa essa regra.
14. Um trigger compartilhado deve atualizar `updated_at` em toda alteração das tabelas que possuem essa coluna.

Índices parciais e de unicidade que o DBML documenta por nota (sintaxe limitada no dbdiagram):

```sql
create unique index missions_one_checkin_per_month_uidx
on quests.missions (
  (extract(year from start_date)),
  (extract(month from start_date))
)
where is_checkin = true;

create index submissions_fifo_active_idx
on quests.submissions (
  mission_id,
  collaborator_email,
  current_phase,
  submitted_at asc
)
where status = 'active';

create unique index submissions_one_active_occurrence_uidx
on quests.submissions (mission_id, collaborator_email, occurrence_date)
where status = 'active' and occurrence_date is not null;

create index users_xp_desc_idx
on core.users (xp desc);

create unique index user_titles_one_active_per_user_uidx
on gamification.user_titles (user_email)
where is_active = true;
```

A unicidade de missão não recorrente quando `allows_multiple_submissions = false` é regra transacional (lock da missão + consulta), eventualmente apoiada por índice em `(mission_id, collaborator_email, status)`.

## Projeções esperadas

### Fases, recorrência e check-in

`quests.mission_phases` divide a missão em etapas ordenadas por `(mission_id, phase_number)`. `quests.submissions.current_phase` é a fase atual da mesma submissão; a FK composta impede fase inexistente na missão.

`occurrence_date` identifica a ocorrência diária, semanal, mensal ou a data escolhida do check-in. É obrigatória para recorrências e check-ins; nula em missão não recorrente.

`quests.missions.is_checkin` classifica a missão: exige recorrência mensal e vigência no mês. A fase única tem XP configurável (o front sugere 1 XP). Bônus recalculáveis: +10 em 10 check-ins, +5 em 15, +5 em 20. Não existe coluna `checkin_month`.

### Avatar Mana Seed

As quatro tabelas de `avatar` separam catálogo da escolha de cada usuário:

- `avatar.slot_definitions`: uma linha por slot; rótulo, pasta de assets, ordem de desenho e ícone.
- `avatar.items`: uma linha por peça; `slot`, `code`, caminhos de folha e flags de composição.
- `avatar.user_avatars`: corpo e cor da pele (1:1 por usuário).
- `avatar.user_slot_settings`: uma linha por slot e usuário; `item_id` nulo = slot vazio.

A decomposição evita JSONB porque os slots são conhecidos e cada peça pertence a um slot. Metadados de sprite (`shaped_file_path`, `under_file_path`, `hides_hair`, `hidden_by_hats`, `draw_order`, `icon_code`) servem ao renderer; não são preferência do usuário. Se os assets permanecerem versionados com a aplicação, o catálogo pode sair do PostgreSQL e restar apenas `user_avatars` + `user_slot_settings`.

### Badges e titles

`gamification.badges` e `gamification.titles` são catálogos. Badges exigem `image_path`. `user_badges` e `user_titles` registram conquistas; `user_titles.is_active` indica o title exibido no ranking. No MVP não há atribuição automática dessas relações.

### XP configurado, livro-razão e saldo

`quests.mission_phases.xp_reward` é a promessa da fase. No envio/avanço, a função de domínio:

1. copia `xp_reward` para um movimento positivo em `gamification.xp_awards`;
2. registra `movement_type` (`phase_reward`, marcos de check-in etc.);
3. incrementa `core.users.xp` pelo mesmo valor.

Cancelamento, invalidação e correção de bônus inserem movimentos negativos apontando para o crédito original via `related_award_id`. O ranking lê o saldo materializado; o livro-razão serve a auditoria e reconciliação (`sum(amount) = users.xp`).

### Ranking

Lê `core.users.xp` em ordem decrescente, desempata pela contagem de submissões `active`, depois por nome. Resolve nível, title ativo, badges e avatar. Nunca expõe e-mail.

### Mural e perfil

O mural consulta apenas missões `active`. Disponibilidade deriva de vigência, recorrência, ocorrência, submissão atual e próxima fase.

O perfil lista submissões do usuário em `submitted_at desc`, com evidências por fase e movimentos de XP. Estados `cancelled` e `invalidated` continuam visíveis.

### Gestão administrativa

Consulta submissões por missão, colaborador, estado e data. Não há fila de aprovação; a ação sobre submissão `active` é invalidar (com justificativa na invalidação administrativa direta).

## RLS e privilégios

Ative e force RLS nas tabelas que carregam dados de usuário. Funções de política devem obter a identidade uma vez por consulta e as colunas usadas nas políticas já devem estar indexadas.

| Recurso | Colaborador | Administrador (`manager`) | Serviço privilegiado |
| --- | --- | --- | --- |
| Usuários | Ler o próprio perfil e projeções públicas. | Ler dados necessários à gestão. | Criar por SSO, alterar papel e atualizar XP. |
| Missões | Ler missões disponíveis. | Criar, editar e invalidar. | Executar invalidação em lote. |
| Submissões | Criar, ler e cancelar apenas as próprias. | Ler e invalidar conforme gestão. | Executar transações de XP/importação. |
| Evidências | Criar e ler apenas as próprias. | Ler evidências necessárias à invalidação. | Gerar URLs temporárias. |
| Livro-razão | Ler projeção própria, se exposta pela API. | Consultar para auditoria. | Único escritor. |
| Avatar | Ler/escrever o próprio. | Sem acesso especial. | Administrar catálogo fora do MVP. |
| Catálogos | Ler. | Criar titles e badges. | Seeds e manutenção técnica. |

Não dê `ALL` ao papel da aplicação. Revogue os defaults de `public`, conceda acesso por schema/tabela e mantenha funções `security definer` em schema privado, com `search_path = ''` e `EXECUTE` revogado de papéis não autorizados.

## dbdiagram e dbdocs

O DBML segue a documentação atual de [dbdiagram](https://docs.dbdiagram.io/) e [dbdocs](https://docs.dbdocs.io/): `Project` com `database_type`, schemas qualificados, `Enum`, `Table`, `Indexes`, `checks`, `Ref`, `TableGroup` e notas Markdown.

Para visualizar, importe `docs/database/vdev-quest.dbml` no dbdiagram. Para validar e publicar no dbdocs:

```bash
bunx dbdocs@1.5.0 validate docs/database/vdev-quest.dbml
bunx dbdocs@1.5.0 login
bunx dbdocs@1.5.0 build docs/database/vdev-quest.dbml --project vdev-quest
```

Projetos dbdocs são públicos por padrão. Antes de publicar dados internos, configure senha no projeto ou confirme que apenas o esquema — sem segredos nem dados reais — será enviado. Em CI, use `DBDOCS_TOKEN` como secret e nunca o grave no repositório.

Para verificar se o DBML pode ser convertido para PostgreSQL sem publicar nada:

```bash
bunx @dbml/cli@10.1.1 docs/database/vdev-quest.dbml --postgres
```

## Antes da primeira migration

- definir se o provedor de autenticação aceitará o e-mail normalizado como identidade canônica;
- definir o fluxo transacional e as permissões para troca de e-mail (`ON UPDATE CASCADE`);
- escolher o object storage e as políticas de acesso aos anexos;
- definir o algoritmo/faixas reais de nível e os títulos editáveis;
- implementar as funções transacionais de envio, importação, cancelamento, invalidação e recálculo de check-in;
- aplicar políticas RLS e testes de autorização/concorrência/idempotência descritos em `alteracoes-modelagem-vdev-quest.md`.
