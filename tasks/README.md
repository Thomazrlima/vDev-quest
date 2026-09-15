# Tickets — v(dev) Quest MVP

Fatias verticais derivadas de [`docs/specs/`](../../docs/specs/). Tracker local (sem GitHub Issues).

## Seam

API / serviços de domínio: HTTP + efeitos no PostgreSQL + projeções.

## Ordem e bloqueios

| # | Ticket | Blocked by |
| --- | --- | --- |
| 00 | Prefactor UI domínio PRD | — |
| 01 | SSO e perfil mínimo | — |
| 02 | Criar missão e mural | 01 |
| 03 | Enviar evidência texto + XP | 02 |
| 04 | Evidências arquivo/link | 03 |
| 05 | Multifase e edição bloqueada | 03 |
| 06 | Recorrência no mural | 03 |
| 07 | Múltiplas submissões | 03 |
| 08 | Cancelar submissão | 03 |
| 09 | Invalidar submissão e missão | 08 |
| 10 | Perfil histórico | 08, 09 |
| 11 | Check-in mensal | 02, 08 |
| 12 | Importação FIFO | 05, 07 |
| 13 | Ranking global | 03 |
| 14 | Personagem | 01 |
| 15 | Titles e badges | 01 |
| 16 | Mobile e a11y | 10, 13, 14 |

## Fronteira atual

Podem começar agora: **00** e **01**.

## Cobertura

Mapeia RF-01…RF-17 e US-01…US-21 das specs. Fora do MVP permanece fora (aprovação, temporadas, loja, atribuição de badges, mapa navegável, etc.).
