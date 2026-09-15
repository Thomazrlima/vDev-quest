# 01: Entrar com SSO e ver perfil mínimo

**What to build:** A pessoa entra com SSO corporativo, é provisionada como colaborador no primeiro acesso e vê um perfil mínimo com nome editável, XP e nível. Administrador (`manager`) acessa gestão; colaborador não. E-mail, papel e XP não são mutáveis pelo cliente.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Acesso somente via SSO corporativo
- [ ] Primeiro acesso cria usuário inexistente com papel `collaborator`
- [ ] E-mail canônico normalizado (minúsculas, trim); maiúsculas não duplicam usuário
- [ ] Nome de exibição editável no sistema, independente do SSO
- [ ] Cliente não altera e-mail, papel nem XP
- [ ] Colaborador recebe 403/bloqueio em rotas e operações administrativas
- [ ] Administrador (`manager`) consegue acessar área de gestão
- [ ] Concessão/remoção de `manager` é feita no banco (fora da UI) no MVP
- [ ] Perfil mínimo exibe nome, XP (saldo materializado) e nível derivado de `gamification.levels`
- [ ] Existe nível com `minimum_xp = 0`; nível = maior faixa com mínimo ≤ XP atual
- [ ] Schema fundacional aplicado (core/quests/avatar/gamification conforme modelo alvo) com RLS forçada nas tabelas de usuário
- [ ] Clientes não escrevem em `core.users.xp` nem no livro-razão; só serviço privilegiado
- [ ] Índice de ranking por XP e estrutura de `gamification.xp_awards` (ledger imutável, `amount <> 0`) existem
- [ ] Rotina ou cheque de reconciliação detecta divergência entre soma do ledger e `users.xp`
