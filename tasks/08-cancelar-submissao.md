# 08: Cancelar submissão e reverter XP

**What to build:** O colaborador cancela a própria submissão ativa (inteira, qualquer fase). O registro fica `cancelled`, evidências permanecem, todo XP da submissão é revertido no ledger e no saldo, sem poder reativar nem debitar duas vezes.

**Blocked by:** 03: Enviar evidência (texto) e ganhar XP

**Status:** ready-for-agent

- [ ] Somente o dono cancela; sem pedido/aprovação administrativa
- [ ] Afeta a submissão inteira; status `cancelled` com auditoria (`user_cancellation`, ator = colaborador)
- [ ] Sem justificativa obrigatória no cancelamento
- [ ] Para cada crédito ainda não compensado, insere débito com `related_award_id` e tipo de reversão por cancelamento
- [ ] `users.xp` atualiza na mesma transação; saldo ≥ 0
- [ ] Evidências e histórico permanecem
- [ ] Segunda chamada de cancelamento não retira XP de novo (idempotente)
- [ ] Submissão cancelada não volta a `active`
- [ ] Se for ocorrência recorrente ainda vigente, novo envio é permitido
- [ ] Submissões `cancelled` não contam no desempate futuro do ranking
