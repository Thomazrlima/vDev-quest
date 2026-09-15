# 11: Check-in mensal com bônus e recálculo

**What to build:** O administrador cria a missão de check-in de um mês; o colaborador registra check-ins no mês corrente (data de 1 até hoje), ganha XP-base e bônus nos marcos 10/15/20. Cancelar ou invalidar recalcula o mês inteiro no ledger.

**Blocked by:** 02: Criar missão simples e ver no mural; 08: Cancelar submissão e reverter XP

**Status:** ready-for-agent

- [ ] Toggle check-in preenche mês/ano (editável); vigência = 1º..último dia do mês
- [ ] Fase única; XP-base sugerido 1 (editável); tipo de evidência escolhível
- [ ] `is_checkin` exige recorrência mensal
- [ ] No máximo uma missão check-in por mês/ano, mesmo se a anterior estiver invalidada
- [ ] Colaborador só envia na missão do mês/ano corrente
- [ ] Data escolhida ∈ [1º dia do mês, hoje] em `America/Sao_Paulo`; futuras e outro mês rejeitadas
- [ ] No máximo um check-in `active` por colaborador e data (`occurrence_date`)
- [ ] Envio concede XP-base; ao atingir 10/15/20 válidos no mês concede +10/+5/+5
- [ ] Exemplo canônico: 20×base1 = 40 XP; remover um → 19 = 34 XP (delta −6)
- [ ] Cancelar/invalidar libera a data no mês atual e dispara recálculo mensal (correções no ledger)
- [ ] Check-in não é importável por planilha (rejeição preparada / alinhada ao ticket 12)
- [ ] Movimentos tipados: base, marco e correção de bônus / reversões
