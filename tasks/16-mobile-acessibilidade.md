# 16: Mobile-first e acessibilidade dos fluxos essenciais

**What to build:** Mural, ranking, perfil, envios e painéis de gestão funcionam bem no celular e por teclado, com nomes acessíveis, foco visível, sem depender só de cor, respeitando redução de movimento.

**Blocked by:** 10: Perfil com histórico filtrável; 13: Ranking global; 14: Personalizar e persistir personagem

**Status:** ready-for-agent

- [ ] Fluxos essenciais usáveis em navegador móvel e só com teclado
- [ ] Controles com nome acessível, alvo de toque adequado e foco visível
- [ ] Estados não dependem apenas de cor
- [ ] `prefers-reduced-motion` é respeitado (animações essenciais reduzidas/desligadas)
- [ ] Layout prioriza smartphone e adapta para desktop em ranking, mural, perfil e gestão
- [ ] Badges e personagem com textos alternativos
- [ ] Listas longas paginadas quando a API definir limite
- [ ] Smoke dos fluxos críticos (login → mural → envio → perfil → ranking) em viewport móvel
