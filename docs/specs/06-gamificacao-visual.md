# Spec 06 — Gamificação visual

**Status:** ready-for-agent  
**Ordem:** 6/6  
**Stories:** US-03, US-04, US-07, US-19, US-20, US-21  
**RF:** RF-02, RF-04, RF-16; NF acessibilidade/desempenho  

## Problem Statement

Com XP e missões confiáveis, ainda falta a camada que gera reconhecimento e pertencimento: ranking global legível, personagem personalizado, catálogos de title/badge e experiência mobile-first acessível. O mock mostra temporada e detalhes que o PRD remove; o avatar ainda não persiste no banco conforme o modelo.

## Solution

Entregar ranking global (pódio + tabela) ordenado por XP, submissões `active` e nome; personalização completa do personagem Mana Seed persistida; criação administrativa de titles e badges (sem atribuição); e critérios mobile-first/a11y nos fluxos essenciais. Leituras usam saldo materializado e projeções públicas sem expor e-mail.

## User Stories

1. Como Colaborador, quero ver o ranking global com pódio dos três primeiros e tabela de todos, para comparar progresso.
2. Como Colaborador, quero ver posição, personagem, nome, title ativo (se houver), badges (se houver), nível, XP total e progresso ao próximo nível, para entender cada linha.
3. Como Colaborador, quero ordenação por maior XP, depois mais submissões `active`, depois nome A→Z, para empates justos.
4. Como Colaborador, quero posição única após desempate, para não haver “empate visual” confuso.
5. Como Colaborador, quero que o ranking nunca mostre e-mails, para privacidade.
6. Como Colaborador, quero que textos de “temporada” do mock sumam, pois o ranking é acumulado sem temporada.
7. Como Colaborador, quero que ganho ou perda de XP mude o ranking na próxima leitura, para confiar na classificação.
8. Como Colaborador, quero que usuários sem title/badge apareçam sem layout quebrado nem dado inventado, para UI limpa.
9. Como Colaborador, quero indicação de “sem próximo nível” no nível máximo, para não mostrar barra falsa.
10. Como Colaborador, quero personalizar corpo, peças por slot (cabelo, cabeça, rosto, camisa, calças, saia, sobreposição, meias, calçados, mãos, pescoço) e cores, para aparecer do meu jeito.
11. Como Colaborador, quero prévia antes de salvar, respeitando ordem de desenho e regras visuais, para não gravar surpresa.
12. Como Colaborador, quero remover peça quando o slot aceitar vazio e restaurar aparência padrão, para desfazer escolhas.
13. Como Colaborador, quero todo o catálogo disponível sem inventário/loja/desbloqueio por XP, para personalizar livremente no MVP.
14. Como Colaborador, quero que a aparência salva apareça no perfil, lobby e ranking, para identidade consistente.
15. Como Colaborador, quero que um item não possa ir em slot errado, para integridade do catálogo.
16. Como Administrador, quero criar titles com nome obrigatório e descrição opcional, para montar o catálogo.
17. Como Administrador, quero que o backend gere `code` a partir do nome com tratamento de colisão, para não inventar códigos.
18. Como Administrador, quero criar badges com nome, descrição opcional e `image_path` obrigatório, para o ranking/perfil exibirem imagem.
19. Como Administrador, quero que no MVP não exista editar/excluir/atribuir titles e badges nem regras de conquista, para manter escopo.
20. Como Colaborador, quero que relações já existentes de title/badge possam ser lidas se houver dados, mesmo sem fluxo de atribuição no MVP.
21. Como Colaborador, quero usar mural, ranking, perfil e envios no celular com teclado e leitores de tela, para participar de qualquer lugar.
22. Como Colaborador, quero controles com nome acessível, alvo de toque adequado e foco visível, para a11y básica.
23. Como Colaborador, quero que estados não dependam só de cor e que redução de movimento seja respeitada, para inclusão.
24. Como Colaborador, quero layouts priorizando smartphone e adaptando para desktop, para mobile-first.
25. Como Colaborador, quero textos alternativos em badges e personagem, para leitores de tela.
26. Como Empresa, quero ranking e mural respondendo em até 2s no p95 sob carga do MVP (estimar no refinamento), para UX aceitável.
27. Como Colaborador, quero listas paginadas quando o volume exigir, para não travar o cliente.
28. Como Desenvolvedor, quero direção/animação da prévia só no front (não persistidas), para não poluir o banco.

## Implementation Decisions

- Ranking: projeção de `users.xp` + contagem de submissões `active` + nome; resolve nível, title ativo, badges, avatar; nunca e-mail.
- Remover copy de temporada do mock.
- Avatar: `user_avatars` + `user_slot_settings`; catálogo em `slot_definitions` / `items` (ou assets versionados + só preferências no banco, conforme decisão de deployment dos sprites).
- Titles/badges: endpoints de criação admin; `code` gerado; badge exige `image_path`.
- `user_titles` / `user_badges` somente leitura no MVP (sem atribuição).
- Persistir aparência; preview direction/pose = estado de UI.
- Desempenho: índices de ranking já criados na fundação; paginação nas listagens grandes.
- A11y: nomes acessíveis, foco, `prefers-reduced-motion`, alt texts.
- Lobby/mapa navegável permanece fora do MVP de produto; se o mock do mapa existir, não é requisito desta spec expandi-lo.

## Testing Decisions

- Seam: API/domínio para persistência de avatar, criação de catálogos e projeção de ranking; UI com testes de comportamento onde já houver harness (hoje o repo tem `bun test` no frontend).
- Oráculos de ranking: ordem com empates; ausência de e-mail; nível máximo; atualização após mudança de XP.
- Avatar: slot inválido rejeitado; save → reload no perfil/ranking; reset padrão.
- Titles/badges: só admin cria; colaborador 403; `code` único sob colisão de nome; badge sem imagem rejeitado.
- A11y smoke: fluxos essenciais por teclado; imagens com alt.
- Reconciliação: ranking usa saldo consistente com ledger (herdado das specs anteriores).

## Out of Scope

- Atribuição automática/manual de titles e badges.
- Loja, inventário, desbloqueio por XP.
- Gestão de níveis na UI.
- Temporadas / reset de XP.
- Mapa navegável como feature de produto.
- Edição/exclusão de titles e badges.

## Further Notes

- Esta é a última etapa da sequência do PRD §4.3; liberação geral após piloto estável de XP (specs 01–03) e validação desta camada visual.
- Critérios de prontidão do PRD §4.4 aplicam-se ao conjunto das seis specs.
- Referências: PRD RF-02, RF-04, RF-16, §3.3.3–3.3.4; US-03, 04, 07, 19, 20, 21.
