# 09: Invalidar submissão e invalidar missão

**What to build:** O administrador busca submissões e invalida uma `active` com justificativa; ou invalida logicamente uma missão (com confirmação e impacto no front), derrubando todas as submissões ativas e o XP ainda válido. Sem restauração no MVP.

**Blocked by:** 08: Cancelar submissão e reverter XP

**Status:** ready-for-agent

- [ ] Admin filtra submissões por colaborador, missão, estado e data
- [ ] Detalhe mostra missão, colaborador, fase, evidências e XP concedido
- [ ] Invalidar submissão exige justificativa não vazia; registra admin, data e `admin_invalidation`
- [ ] Status `invalidated`; créditos não compensados viram débitos relacionados; saldo atualiza atomicamente
- [ ] Duas requisições concorrentes não invalidam/debitam duas vezes
- [ ] Colaborador não invalida
- [ ] Invalidar missão: confirmação no front com impacto; sem justificativa obrigatória
- [ ] Missão → `invalidated` (+ auditoria); deixa de aceitar envios imediatamente
- [ ] Todas as submissões `active` da missão são invalidadas com `mission_invalidation` (sem justificativa por submissão)
- [ ] XP ainda válido é revertido; histórico preservado; sem restauração
- [ ] Volume grande pode processar em lote interno desde que novos envios já estejam bloqueados
