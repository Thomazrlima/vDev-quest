# 14: Personalizar e persistir personagem

**What to build:** O colaborador monta o personagem (corpo, slots, cores), vê prévia, salva e restaura o padrão. A aparência reaparece no perfil, lobby e ranking. Todo o catálogo está disponível; sem loja nem desbloqueio.

**Blocked by:** 01: Entrar com SSO e ver perfil mínimo

**Status:** ready-for-agent

- [ ] Escolha de tipo de corpo e peças por slot (cabelo, cabeça, rosto, camisa, calças, saia, sobreposição, meias, calçados, mãos, pescoço)
- [ ] Cores de pele e de peças compatíveis; ordem de desenho e regras visuais respeitadas
- [ ] Remover peça quando o slot aceita vazio; restaurar aparência padrão
- [ ] Catálogo inteiro disponível a todos; sem inventário/loja/desbloqueio por XP
- [ ] Persistência no banco (`user_avatars` + `user_slot_settings` ou equivalente do modelo)
- [ ] Item não equipa em slot diferente do catálogo
- [ ] Aparência salva aparece no perfil e no ranking (quando ranking existir)
- [ ] Direção/animação da prévia são só estado de front
- [ ] Alt text adequado para o personagem nas telas de exibição
