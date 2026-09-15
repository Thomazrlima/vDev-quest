# 00: Prefactor — alinhar UI ao domínio do PRD

**What to build:** O frontend deixa de falar em aprovação, espera e recusa. Colaborador e administrador veem os estados reais do produto (Disponível, Em andamento, Concluída, Cancelada, Invalidada) e a área antes chamada de moderação passa a ser gestão/invalidação, sem fila de aprovação.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Filtros e badges do mural usam apenas: Disponível, Em andamento, Concluída, Cancelada, Invalidada
- [ ] Não existe copy nem fluxo de “aguardando aprovação”, “aprovar” ou “recusar” evidência
- [ ] Área administrativa de submissões está nomeada/orientada a consulta e invalidação
- [ ] Textos de “temporada” no ranking foram removidos ou preparados para remoção (ranking acumulado)
- [ ] Contratos/mocks de status de submissão usam `active` | `cancelled` | `invalidated` (ou equivalente de UI mapeado a esses valores)
- [ ] Missão no mock/gestão não depende de rascunho/publicação; nasce disponível/`active`
