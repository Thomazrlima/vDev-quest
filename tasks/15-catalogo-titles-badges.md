# 15: Catálogo de titles e badges

**What to build:** O administrador cadastra titles e badges no catálogo (`code` gerado; badge com imagem). Ranking e perfil leem vínculos existentes; não há atribuição, edição nem exclusão no MVP.

**Blocked by:** 01: Entrar com SSO e ver perfil mínimo

**Status:** ready-for-agent

- [ ] Só administrador cria title: nome obrigatório, descrição opcional
- [ ] Backend gera `code` a partir do nome com tratamento de colisão
- [ ] Só administrador cria badge: nome, descrição opcional, `image_path` obrigatório
- [ ] Badge sem imagem é rejeitado
- [ ] Não há editar, excluir, atribuir manualmente nem regras de conquista no MVP
- [ ] Relações `user_titles` / `user_badges` existentes podem ser lidas (title ativo no ranking)
- [ ] Imagens de badge têm texto alternativo nas telas
- [ ] Colaborador não cria itens de catálogo
