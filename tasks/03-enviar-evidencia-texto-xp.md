# 03: Enviar evidência (texto) e ganhar XP

**What to build:** O colaborador abre a missão, vê só a próxima fase elegível, envia evidência em texto e recebe XP na hora. Fase, evidência, movimento no livro-razão e saldo atualizam na mesma transação; o ranking/perfil leem o novo total.

**Blocked by:** 02: Criar missão simples e ver no mural

**Status:** ready-for-agent

- [ ] UI e API expõem apenas a próxima fase; cliente não informa XP nem escolhe fase anterior
- [ ] Texto: obrigatório após trim; vazio é rejeitado
- [ ] Mesma transação: evidência em `submission_phase_evidences`, `current_phase`, crédito no ledger (`phase_reward`), incremento de `users.xp`
- [ ] Resposta devolve fase atual, XP ganho e novo total
- [ ] Falha ao gravar evidência não concede XP; falha ao gravar XP não avança fase
- [ ] Retentativa / idempotência não duplica recompensa
- [ ] Em missão de submissão única, segunda submissão `active` é bloqueada enquanto houver uma ativa
- [ ] Locks impedem corrida que corrompa unicidade ou saldo
- [ ] Soma do ledger do usuário = `users.xp` após o envio
- [ ] Saldo nunca fica negativo
- [ ] Movimentos do ledger são imutáveis (sem update/delete); `amount` nunca zero
