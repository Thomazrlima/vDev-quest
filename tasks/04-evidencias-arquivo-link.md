# 04: Evidências arquivo/link e storage privado

**What to build:** Além de texto, o colaborador envia foto (PNG/JPEG), PDF ou link HTTP(S), com limite de 3 MiB. O banco guarda só a chave privada do objeto; a visualização usa URL temporária autorizada.

**Blocked by:** 03: Enviar evidência (texto) e ganhar XP

**Status:** ready-for-agent

- [ ] Foto: somente `image/png` ou `image/jpeg`
- [ ] PDF: somente `application/pdf`
- [ ] Link: somente URL HTTP ou HTTPS válida
- [ ] Arquivos rejeitados acima de 3 MiB
- [ ] Payload arquivo XOR `evidence_value` (nunca os dois / nunca nenhum quando exigido)
- [ ] Persistência de `attachment_object_key` (e metadados de arquivo); sem URL assinada permanente no banco
- [ ] Visualização autorizada gera URL temporária; colaborador lê a própria evidência; admin lê o necessário à gestão
- [ ] Tipo exigido respeita `missions.evidence_type`
- [ ] Envio inválido não avança fase nem concede XP
