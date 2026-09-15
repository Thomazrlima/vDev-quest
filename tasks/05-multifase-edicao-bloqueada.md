# 05: Missões multifase e edição bloqueada

**What to build:** O administrador configura várias fases; o colaborador avança uma a uma na mesma submissão. Depois da primeira submissão, regras de negócio ficam imutáveis no backend; título e descrição ainda podem ser corrigidos.

**Blocked by:** 03: Enviar evidência (texto) e ganhar XP

**Status:** ready-for-agent

- [ ] Missão não recorrente aceita 2+ fases sequenciais sem lacunas
- [ ] Cada avanço vai somente para `current_phase + 1` na mesma submissão
- [ ] Cada fase enviada pelo mural cria evidência própria; XP de cada fase é o `xp_reward` daquela fase no momento do envio
- [ ] Antes da primeira submissão, admin edita configuração completa
- [ ] Após a primeira submissão, API rejeita mudança em: tipo de evidência, fases/ordem/XP, recorrência/dias, datas, check-in, múltiplas submissões
- [ ] Título e descrição permanecem editáveis após a primeira submissão
- [ ] Missão recorrente/check-in continua restrita a uma fase (validação na criação/edição)
- [ ] Cartão/mural mostra “Em andamento” com próxima fase quando houver fases concluídas e próxima disponível
- [ ] “Concluída” quando a última fase foi alcançada
