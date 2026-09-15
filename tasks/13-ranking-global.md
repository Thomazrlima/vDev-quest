# 13: Ranking global

**What to build:** O colaborador vê o ranking acumulado (sem temporada): pódio dos três primeiros e tabela com posição, personagem, nome, title/badges se houver, nível, XP e progresso. Ordenação por XP, depois submissões `active`, depois nome; nunca e-mail.

**Blocked by:** 03: Enviar evidência (texto) e ganhar XP

**Status:** ready-for-agent

- [ ] Pódio com top 3 + tabela com demais (paginada se necessário)
- [ ] Campos: posição, personagem, nome, title ativo opcional, badges opcionais, nível, XP, progresso
- [ ] Ordenação: XP desc → contagem de submissões `active` desc → nome asc
- [ ] Posição única após desempate
- [ ] Sem exposição de e-mail
- [ ] Sem textos de temporada
- [ ] Ganho ou perda de XP reflete na próxima leitura
- [ ] Sem title/badge: layout sem buraco nem dado inventado
- [ ] Nível máximo indica ausência de próximo nível
- [ ] Cancelados/invalidados não contam no desempate
- [ ] Meta de desempenho: mural/ranking ≤ 2s p95 sob carga estimada do MVP (medir/estimar no refinamento)
