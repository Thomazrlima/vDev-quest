# Especificações de desenvolvimento — v(dev) Quest

**Status:** prontas para agente  
**Idioma:** Português do Brasil  
**Fontes:** [`../prd.md`](../prd.md), [`../stories/user-stories-vdev-quest.md`](../stories/user-stories-vdev-quest.md), [`../decisoes-de-produto.md`](../decisoes-de-produto.md), [`../database/`](../database/)

## Seam de teste (única)

Toda spec abaixo é validada pela **API / serviços de domínio do backend**:

- status e corpo das respostas;
- efeitos no PostgreSQL (missão, submissão, evidência, livro-razão, saldo XP);
- projeções de leitura (mural, ranking, perfil, gestão).

Não criar seams extras em repositórios internos, SQL helpers ou componentes React isolados, salvo se essa seam ficar inviável.

## Glossário rápido

| Termo no produto | Termo no banco / API |
| --- | --- |
| Administrador | papel `manager` |
| Colaborador | papel `collaborator` |
| Missão | `quests.missions` |
| Submissão | `quests.submissions` (`active` / `cancelled` / `invalidated`) |
| Evidência | `quests.submission_phase_evidences` |
| Livro-razão de XP | `gamification.xp_awards` |
| Saldo de XP | `core.users.xp` |
| Fuso | sempre `America/Sao_Paulo` |

## Ordem de entrega

| # | Spec | Escopo | Stories (US) |
| --- | --- | --- | --- |
| 01 | [Fundação](./01-fundacao.md) | Migration, RLS, SSO, níveis, livro-razão | US-01, US-02, US-05 |
| 02 | [Missões e mural](./02-missoes-e-mural.md) | Gestão, fases, recorrência, mural, envio | US-08, US-09, US-11, US-13, US-14 |
| 03 | [Correções e histórico](./03-correcoes-e-historico.md) | Cancelar, invalidar, perfil histórico | US-16, US-17, US-12, US-06 |
| 04 | [Check-in](./04-check-in.md) | Missão mensal, bônus, recálculo | US-10, US-15 |
| 05 | [Importação](./05-importacao.md) | Planilha `.xlsx` atômica + FIFO | US-18 |
| 06 | [Gamificação visual](./06-gamificacao-visual.md) | Ranking, avatar, titles, badges, a11y | US-03, US-04, US-07, US-19, US-20, US-21 |

Cada etapa depende dos testes automatizados da etapa anterior.

## Estado atual do código

O repositório hoje é um frontend mockado (Vite + React + TanStack Router). Não há backend, migration executável nem RLS. O mock ainda usa linguagem de “aprovação/moderação”; o PRD prevalece: XP imediato e invalidação administrativa.

## Fora do MVP (todas as specs)

- Aprovação/recusa de submissões  
- Temporadas de ranking e reinício de XP  
- Gestão de níveis pela UI  
- Atribuição de titles/badges  
- Loja, inventário ou desbloqueio de avatar  
- Restauração de registros cancelados/invalidados  
- Importação de missões recorrentes ou check-ins  
- Mapa navegável  
