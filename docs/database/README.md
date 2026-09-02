# Banco de dados do vDev Quest

Este diretório descreve o futuro banco PostgreSQL a partir do domínio existente em [`src/types`](../../src/types). O arquivo [`vdev-quest.dbml`](./vdev-quest.dbml) é a fonte única para o diagrama no dbdiagram e para a documentação publicada no dbdocs.

O modelo é conceitual e ainda não é uma migration executável. Ele registra as decisões necessárias para que a futura implementação SQL não dependa de inferências feitas a partir das telas ou dos mocks.

## Artefatos

| Arquivo | Finalidade |
| --- | --- |
| `vdev-quest.dbml` | Entidades, enums, restrições, índices, relações, notas e grupos visuais em DBML. |
| `README.md` | Mapeamento do domínio, regras entre tabelas, acesso, publicação e decisões pendentes. |

## Visão do modelo

O esquema foi separado por responsabilidade:

- `core`: usuários e papéis;
- `quests`: missões, fases, recorrência e submissões;
- `avatar`: catálogo Mana Seed e aparência escolhida;
- `gamification`: níveis, badges, titles e concessões imutáveis de EXP.

São 15 tabelas. Ranking, mural, feed e fila de moderação são leituras derivadas dessas fontes.

## Mapeamento de `src/types`

| Contrato TypeScript | Persistência ou projeção |
| --- | --- |
| `MissionFormData`, `Mission` | `quests.missions` + `quests.mission_phases` + `quests.mission_weekdays`. O antigo `xp` único deve evoluir para fases; `is_checkin` fica em `missions`. Datas viram `date` e `updatedAt` vira `timestamptz`. `hasProgress` é derivado por `EXISTS`. |
| `MuralSubmission`, `EvidenceSubmission` | `quests.submissions` + `missions.evidence_type` + `submissions.phase`. O `kind` da resposta é derivado (`photo`/`pdf` → `file`; `link` → `link`; `text` → `text`). Formato em português, título da missão, fase, colaborador e `previewUrl` são montados pela API. |
| `MuralMission`, `FeedEntry` | Projeções de missão + submissões filtradas pelo colaborador autenticado. Não criam tabelas. |
| `Collaborator` | Projeção de `core.users`; `email` é a chave do usuário, `initials` é calculado de `name` e o e-mail não é exposto. |
| `RankingLeader`, `RankingEntry` | Projeção de usuários (`name`, `xp`), nível, badge(s), title ativo e avatar. `position`, `progress` e `exp` formatada são calculados. |
| `ManaSeedItem`, `ManaSeedSlotDefinition` | Catálogo em `avatar.items` e `avatar.slot_definitions`. |
| `ManaSeedAppearance`, `ManaSeedColors`, `BodyType` | `avatar.user_avatars` + `avatar.user_slot_settings`. Uma linha por slot evita JSONB e permite FKs. |
| `Lobby*`, `ManaSeedLayer`, `ManaSeedRecolor`, `ManaSeedFrame`, direções e poses | Estado de navegação/renderização; permanece no frontend. |
| Filtros, labels, `EvidenceInput`, presets e auras | Configuração ou estado efêmero de UI; permanece no código enquanto não houver edição administrativa. |

Os enums persistidos usam valores estáveis em inglês. A API traduz `pending/approved/rejected` para “Pendente/Aprovada/Recusada” e `photo` para “Foto (PNG, JPEG)”.

## Decisões de PostgreSQL

- O e-mail normalizado é a PK de `core.users`; as FKs de usuário são `text` e usam nomes explícitos como `collaborator_email` e `user_email`. As demais tabelas continuam usando UUIDv7 para seus IDs.
- E-mail como PK é uma decisão acoplada e sensível: e-mails devem ser normalizados em minúsculas, tratados como chave e alterados apenas por uma operação transacional controlada. As FKs usam `ON UPDATE CASCADE` para manter referências quando uma troca for autorizada.
- Para as demais entidades, habilite `pg_uuidv7` e confirme a função `uuid_generate_v7()` no ambiente alvo.
- Identificadores usam minúsculas e `snake_case`; não exigem aspas em consultas.
- Strings usam `text`; datas civis usam `date`; instantes usam `timestamptz`; EXP e tamanhos usam tipos numéricos.
- Toda FK possui um índice cujo primeiro campo é a coluna referenciada, isoladamente ou em índice composto.
- `core.users.xp` é o total materializado para o ranking; `xp_awards.submission_id` é a trilha de auditoria e chave de idempotência. Repetir uma aprovação não pode conceder EXP duas vezes.
- `gamification.user_badges` e `gamification.user_titles` são relações de conquista. Um usuário pode ter vários badges e titles; apenas um title fica ativo para o ranking.
- `quests.mission_phases` é a fonte única de `phase_number`, `phase_title` e `xp_reward`; a missão não mantém uma segunda recompensa concorrente.
- `quests.missions.evidence_type` é a única fonte do tipo de evidência exigido. O antigo `evidence_kind` não é coluna: `file/link/text` é uma projeção de resposta e não pode divergir da missão.
- A aparência usa tabelas normalizadas. JSONB só deve ser reconsiderado se slots ou atributos passarem a ser verdadeiramente dinâmicos e, nesse caso, as consultas de contenção precisam de GIN.
- `attachment_object_key` guarda uma chave privada do storage. URLs temporárias, miniaturas em base64 e URLs assinadas não são persistidas.

## Regras que atravessam tabelas

DBML documenta bem restrições locais, mas estas regras precisam de transação, trigger ou função de serviço na migration:

1. Aprovar uma submissão deve bloquear a linha, verificar que ela ainda está `pending`, gravar revisor/data, inserir `gamification.xp_awards` e incrementar `core.users.xp` na mesma transação.
2. O valor da concessão deve copiar `mission_phases.xp_reward` da fase da submissão; cliente algum escolhe a quantidade de EXP. O `amount` histórico não muda se a missão for editada depois.
3. Toda submissão deve referenciar uma fase existente da mesma missão por `(mission_id, phase)`. A fase 1 deve ser criada para missões sem divisão explícita.
4. O payload deve corresponder a `missions.evidence_type`: foto/PDF usam os campos de anexo, link usa `evidence_value` como URL e texto usa `evidence_value` como relato. A API deriva `kind` apenas para o contrato do frontend.
5. Links aceitam apenas HTTP(S); anexos aceitam os MIME types previstos e no máximo 10 MiB.
6. Missão `weekly` exige ao menos um `mission_weekdays`; os outros tipos não aceitam dias.
7. Uma missão que já possui submissão ou concessão de EXP não pode ter campos de negócio editados. Correções administrativas devem ser auditadas em uma migration ou tabela de versões futura.
8. Uma missão deve possuir ao menos uma fase; se a regra de negócio exigir sequência sem lacunas, a validação deve ocorrer no serviço de escrita.
9. A peça escolhida deve pertencer ao mesmo slot. A FK composta em DBML já representa essa regra.
10. Um trigger compartilhado deve atualizar `updated_at` em toda alteração das tabelas que possuem essa coluna.

O comportamento atual do mural considera a primeira aprovação como conclusão definitiva da missão. Portanto, a migration deve incluir estes índices parciais, que não foram colocados no DBML para manter compatibilidade entre dbdiagram e dbdocs:

```sql
create unique index submissions_one_pending_per_collaborator_mission_phase_uidx
on quests.submissions (mission_id, phase, collaborator_email)
where status = 'pending';

create unique index submissions_one_approval_per_collaborator_mission_phase_uidx
on quests.submissions (mission_id, phase, collaborator_email)
where status = 'approved';

create unique index user_titles_one_active_per_user_uidx
on gamification.user_titles (user_email)
where is_active = true;
```

Se uma recorrência puder premiar a mesma pessoa mais de uma vez, essa premissa muda: crie `quests.mission_occurrences`, associe cada submissão a uma ocorrência e inclua `occurrence_id` nos dois índices antes de implementar o banco.

## Projeções esperadas

### Fases e check-ins

`quests.mission_phases` permite dividir uma missão em etapas ordenadas. Cada linha pertence a uma missão e é identificada por `(mission_id, phase_number)`:

- `phase_number`: número inteiro da etapa, começando em 1;
- `phase_title`: título mostrado para aquela etapa;
- `xp_reward`: XP concedido quando uma submissão aprovada conclui aquela etapa.

`quests.submissions.phase` guarda a etapa entregue. A FK composta `(mission_id, phase)` → `(mission_id, phase_number)` impede que alguém envie a fase 3 de outra missão. O default `1` mantém compatibilidade com missões simples; a criação de uma missão deve sempre criar ao menos a fase 1.

`quests.missions.is_checkin` é um booleano de classificação: `false` representa a missão normal e `true` identifica uma missão de check-in. Ele não substitui `status`, não indica aprovação e não define sozinho qual evidência será enviada. O comportamento específico do check-in (por exemplo, se exige apenas presença ou também evidência) precisa ser implementado na regra de domínio.

### Avatar Mana Seed

As quatro tabelas de `avatar` separam catálogo (administrado pelo produto) da escolha de cada usuário:

- `avatar.slot_definitions`: uma linha por slot (`hair`, `shirt`, `boots` etc.). Guarda o rótulo, a pasta de assets, a ordem de desenho e o ícone. É o equivalente persistente de `ManaSeedSlotDefinition`.
- `avatar.items`: uma linha por peça disponível. `slot` liga a peça ao slot correto; `code` é o identificador usado pelo frontend; `file_path` é a folha normal, enquanto `shaped_file_path` é a variação para o corpo `heroine` e `under_file_path` é a camada desenhada abaixo das demais. Os booleanos reproduzem as regras de esconder cabelo (`hides_hair`/`hidden_by_hats`).
- `avatar.user_avatars`: uma linha 1:1 por usuário para o corpo (`body_type`) e a cor da pele (`skin_color_index`).
- `avatar.user_slot_settings`: até 13 linhas por usuário, uma para cada slot. `item_id` nulo significa slot vazio; `color_index` preserva a rampa escolhida mesmo quando o slot está vazio. A FK composta `(item_id, slot)` impede equipar uma peça no slot errado.

Exemplo conceitual: para o usuário `u1`, `user_avatars` pode guardar `(hero, 5)`; `user_slot_settings` guarda `(hair, dapper, 37)`, `(shirt, shortshirt, 6)` e `(pants, longpants, 5)`, além das linhas vazias dos demais slots. A API recompõe isso em `ManaSeedAppearance` e `ManaSeedColors` e chama o renderer; nenhuma imagem ou camada calculada precisa ser gravada.

Essa decomposição foi escolhida em vez de um JSONB porque os slots são conhecidos, cada peça pertence a um slot e as alterações são parciais. Assim o banco pode validar FKs, indexar escolhas e aplicar RLS por usuário. JSONB só faria sentido se o catálogo se tornasse arbitrariamente extensível.

Os campos de catálogo que parecem “detalhes de sprite” têm funções práticas no renderer atual:

- `shaped_file_path`: algumas roupas têm uma folha alternativa para `heroine` (por exemplo, a versão com silhueta de busto). Quando o corpo é `heroine`, `getManaSeedItemSrc` escolhe esse caminho; para `hero`, usa `file_path`. É opcional e fica nulo para peças sem corte alternativo.
- `under_file_path`: capas divididas possuem uma folha companheira desenhada na camada `00undr`, abaixo do corpo e das roupas. O renderer adiciona essa folha antes da peça principal; a maioria dos itens não possui uma.
- `hides_hair`: regra da peça de cabeça. Bandana e lenço, por exemplo, escondem o cabelo quando equipados.
- `hidden_by_hats`: regra da peça de cabelo. O moicano marcado assim é omitido quando qualquer chapéu está equipado. As duas flags permitem representar as exceções do catálogo sem codificar nomes de itens no renderer.
- `draw_order`: ordem numérica das camadas, do fundo para o topo. O corpo fica antes da camisa, a camisa antes das calças e assim por diante; `getManaSeedLayers` ordena por esse campo para evitar que uma roupa seja desenhada por cima de outra incorretamente.
- `icon_code`: identificador do ícone mostrado no seletor de slots (`hair`, `pants`, `glove` etc.). É metadado de apresentação, não regra de negócio. Se o catálogo continuar fixo no código, pode permanecer apenas no frontend; só precisa estar no banco se o catálogo for administrável/dinâmico.

Em resumo, `shaped_file_path`, `under_file_path` e as duas flags são metadados de composição de assets; `draw_order` e `icon_code` são metadados de renderização/UI. Nenhum deles é uma preferência do usuário. Se os assets permanecerem versionados junto com a aplicação, podemos retirar o catálogo `avatar.slot_definitions`/`avatar.items` do PostgreSQL e manter apenas `user_avatars` e `user_slot_settings` com `slot` + `code`.

### Badges e titles

`gamification.badges` e `gamification.titles` são catálogos, equivalentes a “Champion”, “Guardian” ou “Arquiteto da Guilda”. `user_badges` e `user_titles` registram quais conquistas cada usuário possui. Como `RankingPlayer.title` é singular, `user_titles.is_active` indica qual title deve ser exibido; um índice único parcial garante no máximo um ativo por usuário. Badges não precisam de flag ativa porque o ranking mostra a coleção inteira.

### XP configurado, XP concedido e XP total

`quests.mission_phases.xp_reward` é a promessa da fase (por exemplo, 500 EXP). Ele não prova que alguém concluiu a fase. Quando o gestor aprova uma submissão, a função de domínio deve:

1. localizar a fase por `(submission.mission_id, submission.phase)` e copiar seu `xp_reward` para `gamification.xp_awards.amount`;
2. inserir a submissão como chave do award (a PK impede duplicidade);
3. somar 500 em `core.users.xp`.

Logo, o ranking consulta rapidamente `core.users.xp`, enquanto `xp_awards` permite auditoria e reconciliação: descobrir qual submissão e fase geraram cada ponto, corrigir divergências e tornar retries seguros. Se o produto decidir que não precisa de histórico, essa tabela pode ser removida e a função deverá proteger o incremento de XP por outro mecanismo de idempotência; mantê-la é a opção mais segura para moderação concorrente.

### Ranking

A consulta lê `core.users.xp`, resolve o maior nível cujo `minimum_xp` não ultrapassa o total, busca o `user_titles` ativo, agrega os badges e anexa o avatar. `rank()` ou `dense_rank()` calcula a posição. Pontuação e progresso continuam numéricos até o frontend formatá-los. `xp_awards` fica disponível para auditoria, não para o caminho quente do ranking.

### Mural e feed

O mural parte de missões publicadas dentro da janela de datas e faz `LEFT JOIN` nas submissões do usuário atual. O estado é derivado na ordem usada pelo domínio: qualquer aprovação → concluída; pendência → aguardando; última submissão recusada → recusada; caso contrário → disponível. O feed é o mesmo histórico, ordenado por `submitted_at desc`.

### Moderação

A fila filtra `submissions.status = 'pending'` e ordena por `submitted_at asc`. O histórico filtra os demais estados e ordena por `reviewed_at desc`. Os índices do DBML refletem essas consultas.

## RLS e privilégios

Ative e force RLS nas tabelas que carregam dados de usuário. Funções de política devem obter a identidade uma vez por consulta e as colunas usadas nas políticas já devem estar indexadas.

| Recurso | Colaborador | Gestor | Escrita privilegiada |
| --- | --- | --- | --- |
| `core.users` | Ler/editar o próprio nome/e-mail; nunca alterar `xp` ou `role`. Leitura pública limitada por uma view de ranking. | Ler usuários para gestão. | Criação, alteração de papel, alteração de e-mail e atualização de XP somente pelo backend. |
| Missões publicadas e dias | Ler missões disponíveis. | Criar, publicar e editar enquanto não houver progresso. | Scheduler pode controlar ocorrências futuramente. |
| Submissões | Inserir e ler somente as próprias; não alterar veredito. | Ler fila/histórico e moderar pendências. | Função transacional de aprovação/recusa. |
| Avatar do usuário | Ler ranking público e escrever apenas o próprio avatar. | Sem permissão especial. | Catálogos alterados somente por papel administrativo. |
| EXP, badges e titles | Ler os próprios dados e projeções públicas mínimas. | Consultar. | Somente função de aprovação/serviço ou rotina administrativa; clientes não alteram `xp` nem atribuem conquistas diretamente. |

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
- definir o fluxo transacional e as permissões para troca de e-mail, pois ele atualiza todas as FKs com `ON UPDATE CASCADE`;
- resolver a semântica de premiação de missões recorrentes;
- definir o algoritmo/faixas reais de nível e os títulos editáveis;
- escolher o object storage e as políticas de acesso aos anexos;
- transformar este modelo em migrations, políticas RLS e testes de autorização/concorrência.
