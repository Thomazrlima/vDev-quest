# 02: Criar missão simples e ver no mural

**What to build:** O administrador cria uma missão que nasce ativa (sem rascunho), com pelo menos a fase 1, evidência e XP. O colaborador a vê no mural com próxima fase, recompensa, tipo de evidência e situação.

**Blocked by:** 01: Entrar com SSO e ver perfil mínimo

**Status:** ready-for-agent

- [ ] Somente administrador cria missão; status inicial `active`
- [ ] Campos: título, descrição, tipo de evidência, datas início/fim, recorrência `none`, fases (mín. 1)
- [ ] Fase com número positivo, título e `xp_reward` > 0; fases sequenciais sem lacuna
- [ ] Data final ≥ data inicial
- [ ] Backend gera id e `slug`; criação atômica (missão + fases)
- [ ] Colaborador não cria missão
- [ ] Mural lista missão `active` dentro da vigência
- [ ] Cartão mostra título, resumo, próxima fase, XP da próxima fase, tipo de evidência, prazo e situação do colaborador
- [ ] Estado inicial no mural: Disponível (sem submissão) ou equivalente correto
- [ ] Missão fora da vigência não aparece como disponível