# Spec 03 — Correções e histórico

**Status:** ready-for-agent  
**Ordem:** 3/6  
**Stories:** US-16, US-17, US-12, US-06  
**RF:** RF-03, RF-08 (invalidação de missão), RF-11, RF-12, RF-17  

## Problem Statement

Erros acontecem: colaborador envia evidência errada; administrador precisa corrigir XP indevido; a empresa precisa explicar cada ponto retirado. Sem cancelamento, invalidação auditável e histórico transparente, o ranking perde confiança e o mock de “moderação” não resolve o problema real.

## Solution

Permitir que o colaborador cancele a própria submissão (sem pedido/aprovação), que o administrador invalide submissões `active` com justificativa e invalide missões logicamente (com confirmação e impacto no front), sempre revertendo XP via movimentos negativos no livro-razão na mesma transação. O perfil mostra histórico completo — inclusive cancelados e invalidados — com evidências e XP retirado.

## User Stories

1. Como Colaborador, quero cancelar diretamente minha submissão ativa, para corrigir um envio errado sem pedir aprovação.
2. Como Colaborador, quero que o cancelamento afete a submissão inteira em qualquer fase, para não ficar com fases órfãs.
3. Como Colaborador, quero que a submissão vá para `cancelled` sem ser apagada, para auditoria.
4. Como Colaborador, quero que todo XP acumulado nas fases dessa submissão seja retirado, para o ranking voltar ao correto.
5. Como Colaborador, quero que as evidências permaneçam no histórico após cancelar, para eu ver o que enviei.
6. Como Colaborador, quero poder reenviar a ocorrência recorrente se ela ainda estiver disponível, para não perder a chance do dia/semana/mês.
7. Como Colaborador, quero que submissão cancelada não possa ser reativada, para o fluxo ser simples e definitivo no MVP.
8. Como Colaborador, quero que repetir o cancelamento não retire XP duas vezes, para idempotência.
9. Como Administrador, quero buscar e filtrar submissões por colaborador, missão, estado e data, para achar o registro a corrigir.
10. Como Administrador, quero ver missão, colaborador, fase atual, fases concluídas, evidências e XP concedido, para decidir com contexto.
11. Como Administrador, quero invalidar uma submissão `active` com justificativa obrigatória, para corrigir erros com trilha.
12. Como Administrador, quero que fiquem registrados administrador, justificativa e data, para auditoria.
13. Como Administrador, quero que a submissão passe a `invalidated` sem apagar evidências, para transparência.
14. Como Administrador, quero que todo XP das fases seja retirado e que duas requisições não invalidem/retirem XP duas vezes, para segurança operacional.
15. Como Administrador, quero que não exista restauração no MVP, para evitar estados ambíguos.
16. Como Administrador, quero invalidar (excluir logicamente) uma missão com confirmação e aviso de impacto no front, para tirá-la do mural.
17. Como Administrador, quero invalidar missão sem justificativa obrigatória, para agilizar exclusão lógica.
18. Como Administrador, quero que a missão vá para `invalidated`, deixe de aceitar novos envios imediatamente e invalide todas as submissões `active`, revertendo XP, para correção completa.
19. Como Administrador, quero que missão, submissões, evidências e movimentos permaneçam no histórico, para auditoria.
20. Como Colaborador, quero ver no perfil nome, personagem (quando houver), XP, nível, progresso, total de submissões válidas, title/badges se existirem, para entender meu status.
21. Como Colaborador, quero histórico de submissões e fases com evidências, cancelamentos e invalidações (com justificativa quando houver), para entender mudanças no saldo.
22. Como Colaborador, quero ver XP retirado em cancelamentos e invalidações, para confiar no total.
23. Como Colaborador, quero filtrar o histórico por missão e estado, para achar um registro específico.
24. Como Colaborador, quero que registros cancelados/invalidados continuem visíveis, para nada “sumir” do histórico.
25. Como Empresa, quero movimentos de reversão tipados (`user_cancellation_reversal`, `admin_invalidation_reversal`, `mission_invalidation_reversal`) ligados aos créditos via `related_award_id`, para reconciliar.
26. Como Empresa, quero que cancelar/invalidar e atualizar saldo sejam atômicos com locks, para concorrência segura.
27. Como Desenvolvedor, quero que invalidação de missão com grande volume possa rodar em lote interno, desde que a missão pare de aceitar envios imediatamente, para não bloquear a API.

## Implementation Decisions

- Cancelamento: ator = colaborador da submissão; `status_change_source = user_cancellation`; sem justificativa.
- Invalidação de submissão: ator = administrador; `status_change_source = admin_invalidation`; justificativa obrigatória não vazia.
- Invalidação de missão: `missions.status = invalidated` + `invalidated_at` + `invalidated_by_email`; submissões ativas com `status_change_source = mission_invalidation` (sem justificativa por submissão).
- Fluxo de reversão: localizar créditos ainda não compensados da submissão → inserir débitos relacionados → atualizar `users.xp` → se check-in (spec 04), recalcular marcos.
- Substitui a fila de moderação do mock: a área administrativa passa a ser consulta + invalidação, não aprovação/recusa.
- Perfil: projeção de submissões do usuário ordenadas por `submitted_at desc`, com evidências e movimentos de XP; filtros por missão e estado.
- Personagem/title/badge no perfil podem aparecer se já existirem dados; personalização completa é spec 06.
- Índices: `submissions_collaborator_history_idx`; proteção de idempotência para não reverter o mesmo crédito duas vezes.

## Testing Decisions

- Seam: API/domínio.
- Oráculos: estado final da submissão/missão; movimentos negativos corretos; saldo; histórico ainda lista o registro; segunda chamada é no-op seguro.
- Casos obrigatórios:
  - Cancelar submissão multifase reverte todos os XP das fases alcançadas.
  - Invalidar submissão exige justificativa; sem ela falha.
  - Invalidar missão invalida N submissões ativas e remove exatamente o XP ainda válido.
  - Concorrência: duas invalidações/cancelamentos simultâneos não duplicam débito.
  - Colaborador não cancela submissão de outro; colaborador não invalida.
  - Perfil filtra por estado e mantém cancelados/invalidados.
- Prior art: seção 5.3–5.4 e 10 (transações/reconciliação) da modelagem; US-06/12/16/17.

## Out of Scope

- Recálculo completo de bônus de check-in (implementação detalhada na spec 04; se check-in já existir, chamar o mesmo serviço).
- Importação.
- Ranking visual, editor de avatar, criação de titles/badges.
- Restauração de missões/submissões.
- Aprovação/recusa.

## Further Notes

- Após esta etapa o produto pode ir a piloto quanto a confiança de XP (PRD §4.3).
- UI de moderação do mock deve ser renomeada/adaptada para “gestão de submissões / invalidação”.
- Referências: PRD RF-03, RF-08, RF-11, RF-12, RF-17; US-06, 12, 16, 17.
