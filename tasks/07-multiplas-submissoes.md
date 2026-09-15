# 07: Múltiplas submissões independentes

**What to build:** Em missão com `allows_multiple_submissions`, o colaborador inicia várias submissões independentes (ex.: Indicação #1, #2). Cada uma avança suas próprias fases; missão sem a flag continua bloqueando segunda `active`.

**Blocked by:** 03: Enviar evidência (texto) e ganhar XP

**Status:** ready-for-agent

- [ ] Flag `allows_multiple_submissions` configurável na criação (e editável só antes da 1ª submissão)
- [ ] Com flag true, cada novo início da fase 1 cria submissão independente
- [ ] Com flag false, não inicia outra enquanto houver `active`
- [ ] UI distingue as submissões (ex.: Indicação #1, #2) sem exigir identificador externo da pessoa indicada
- [ ] Avanço de fase posterior age sobre a submissão correta (a que está na fase anterior), não mistura cadeias
- [ ] Cada submissão tem seu próprio XP no ledger ligado ao seu id
