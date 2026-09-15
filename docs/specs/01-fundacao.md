# Spec 01 — Fundação

**Status:** ready-for-agent  
**Ordem:** 1/6  
**Stories:** US-01, US-02, US-05  
**RF:** RF-01, RF-14, RF-15  

## Problem Statement

A empresa precisa de uma base confiável para gamificar atividades internas: usuários autenticados por SSO, papéis claros, saldo de XP auditável e níveis derivados. Hoje o produto só existe como mock no frontend, sem PostgreSQL, sem RLS e sem livro-razão — qualquer ranking ou missão construída em cima disso não seria confiável.

## Solution

Implantar a fundação do MVP: schema PostgreSQL alinhado ao modelo alvo, SSO corporativo com criação automática de colaborador, papéis `collaborator`/`manager` (Administrador na UI), saldo materializado em `core.users.xp`, livro-razão imutável em `gamification.xp_awards`, catálogo de níveis e políticas RLS. Ao final desta etapa, o sistema autentica, autoriza e consegue registrar/reconciliar XP sem ainda expor mural completo nem gestão de missões.

## User Stories

1. Como Colaborador, quero entrar com o login corporativo (SSO), para acessar o v(dev) Quest sem criar senha nova.
2. Como Colaborador novo, quero ser provisionado automaticamente no primeiro acesso, para começar a jogar sem cadastro manual.
3. Como Colaborador, quero que meu e-mail seja normalizado (minúsculas, sem espaços nas pontas), para não existir conta duplicada se eu digitar maiúsculas.
4. Como Colaborador, quero receber o papel `collaborator` por padrão, para ter acesso às áreas de jogador.
5. Como Colaborador, quero alterar meu nome de exibição no sistema, para personalizar como apareço sem depender do SSO.
6. Como Colaborador, quero que e-mail, papel e XP não possam ser alterados pelo cliente, para evitar fraude no ranking.
7. Como Administrador, quero que apenas quem tem papel `manager` acesse operações administrativas, para proteger missões e invalidações.
8. Como Administrador, quero que a concessão/remoção do papel administrativo seja feita no banco no MVP, para não precisar de tela de gestão de papéis ainda.
9. Como Empresa, quero que cada ganho ou retirada de XP gere um movimento imutável no livro-razão, para auditar o saldo de cada pessoa.
10. Como Empresa, quero que cada movimento tenha id, usuário, submissão, fase (quando aplicável), valor ≠ 0, tipo, referência ao movimento original em reversões e data/hora, para explicar qualquer mudança.
11. Como Empresa, quero que a soma dos movimentos de um usuário seja sempre igual a `core.users.xp`, para confiar no ranking.
12. Como Empresa, quero que o saldo nunca fique negativo, para manter a integridade do jogo.
13. Como Empresa, quero que operação de negócio e atualização de saldo ocorram na mesma transação, para não haver XP órfão.
14. Como Empresa, quero uma rotina de reconciliação que detecte divergências entre saldo e livro-razão, para corrigir antes de espalhar erro no ranking.
15. Como Colaborador, quero que meu nível seja derivado do XP e da tabela de níveis (não persistido no usuário), para que ganhos e reversões ajustem o nível imediatamente.
16. Como Empresa, quero um nível inicial com `minimum_xp = 0` e faixas administradas direto no banco, para configurar progressão sem UI de níveis no MVP.
17. Como Colaborador, quero que o ranking futuro nunca exponha meu e-mail, para preservar privacidade já nas projeções públicas desta fundação.
18. Como Desenvolvedor, quero RLS forçada nas tabelas com dados de usuário, para que colaborador só leia/escreva o que é dele e administrador só o necessário à gestão.
19. Como Desenvolvedor, quero que clientes nunca escrevam em `core.users.xp`, papéis ou livro-razão, para centralizar mutações no serviço privilegiado.
20. Como Desenvolvedor, quero índices de ranking e reconciliação previstos no modelo, para leituras futuras não degradarem.

## Implementation Decisions

- PostgreSQL é a fonte de verdade; o DBML e `alteracoes-modelagem-vdev-quest.md` descrevem o estado alvo da migration.
- Schemas: `core`, `quests`, `avatar`, `gamification`.
- Identidade canônica: e-mail normalizado como PK de `core.users`; FKs de usuário usam `text` com nomes explícitos (`collaborator_email`, `user_email`).
- Demais PKs: UUIDv7 (`pg_uuidv7` / `uuid_generate_v7()`).
- Papel `manager` = **Administrador** na interface; `collaborator` = Colaborador.
- SSO corporativo no primeiro acesso cria usuário com `collaborator` se não existir.
- Nome do usuário é editável no sistema e independente do SSO; e-mail/papel/XP não são mutáveis pelo cliente.
- `core.users.xp` é saldo materializado (≥ 0); único escritor é o backend privilegiado.
- `gamification.xp_awards` é livro-razão imutável (créditos e débitos). PK própria; `amount <> 0`; `related_award_id` liga reversão ao crédito original.
- Tipos mínimos de movimento: `phase_reward`, `checkin_base_reward`, `checkin_milestone_reward`, `user_cancellation_reversal`, `admin_invalidation_reversal`, `mission_invalidation_reversal`, `checkin_bonus_correction`.
- Níveis em `gamification.levels` (número, `minimum_xp`, nome); nível do usuário = maior nível com `minimum_xp ≤ xp` atual.
- RLS ativada e forçada; revogar defaults de `public`; funções privilegiadas em schema privado com `security definer` e `search_path = ''`.
- Índice `users_xp_desc_idx` em `core.users (xp DESC)`.
- Nesta etapa, endpoints mínimos: sessão autenticada, leitura do próprio perfil básico, eventual escrita de nome, e infraestrutura interna de ledger/reconciliação (mesmo que missões completas venham na spec 02).
- Calendário oficial do produto: `America/Sao_Paulo` (já fixar timezone nas funções de domínio).
- Anexos/object storage podem ser só preparados (chave privada); upload completo entra com envio de evidência (spec 02).

## Testing Decisions

- Bom teste: comportamento externo (HTTP status/corpo, linhas no banco, igualdade saldo ↔ soma do ledger). Não assertar implementação interna de SQL.
- Módulo sob teste: serviços privilegiados de autenticação/provisionamento, mutação controlada de XP (helpers de ledger) e políticas RLS.
- Prior art: ainda não há suite de backend no repo; seguir oráculos do PRD §10 de `alteracoes-modelagem` (reconciliação, checks, saldo ≥ 0).
- Casos obrigatórios:
  - SSO cria usuário uma vez; e-mail com maiúsculas não duplica.
  - Colaborador não acessa rota/operação administrativa.
  - Inserir crédito e débito no ledger atualiza `users.xp` atomicamente.
  - `amount = 0` é rejeitado; update/delete de movimento é impossível ou rejeitado.
  - Soma do ledger = `users.xp` após sequência de movimentos.
  - Saldo nunca negativo.
  - Nível derivado correto nos limiares e no nível máximo.
  - RLS: colaborador A não lê dados privados de B.

## Out of Scope

- Criação/edição de missões, mural, submissões e evidências (spec 02).
- Cancelamento/invalidação de negócio completo (spec 03) — apenas a capacidade estrutural do ledger.
- Check-in e importação.
- Ranking UI, avatar completo, titles/badges.
- Gestão de níveis pela interface.
- Temporadas e reinício de XP.

## Further Notes

- Critério de prontidão desta etapa: migration aplicada, RLS validada para os dois papéis, ledger + reconciliação com testes, SSO provisionando colaborador.
- Sem esta fundação, as specs seguintes não devem começar a conceder XP por caminhos paralelos.
- Referências: PRD RF-01/14/15; US-01/02/05; seções 3–8 e 10 de `alteracoes-modelagem-vdev-quest.md`.
