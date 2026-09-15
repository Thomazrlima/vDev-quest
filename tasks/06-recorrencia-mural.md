# 06: Recorrência no mural (diária, semanal, mensal)

**What to build:** Missões recorrentes geram oportunidades por ocorrência no fuso `America/Sao_Paulo`. O mural só disponibiliza quando a data atual cai na vigência e na ocorrência; há no máximo uma submissão `active` por ocorrência.

**Blocked by:** 03: Enviar evidência (texto) e ganhar XP

**Status:** ready-for-agent

- [ ] Recorrência `daily`: uma submissão `active` por dia civil SP dentro da vigência
- [ ] Recorrência `weekly`: exige ≥ 1 dia em `mission_weekdays`; cada dia selecionado é ocorrência independente
- [ ] Missões não semanais não guardam dias da semana
- [ ] Recorrência `monthly`: uma submissão `active` por mês civil SP na vigência
- [ ] Missão recorrente tem exatamente uma fase
- [ ] `occurrence_date` preenchida; unicidade parcial por (missão, colaborador, occurrence_date) onde `active`
- [ ] Mural só marca Disponível na ocorrência aplicável “hoje”
- [ ] Decisões de calendário usam exclusivamente `America/Sao_Paulo`
- [ ] Após cancelamento/invalidação (quando existirem), a mesma ocorrência pode ser reenviada se ainda vigente — unicidade ignora não-`active`
