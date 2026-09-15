# Spec 05 — Importação .xlsx

**Status:** ready-for-agent  
**Ordem:** 5/6  
**Stories:** US-18  
**RF:** RF-13  

## Problem Statement

Parte das conclusões vem de sistemas externos. O administrador precisa registrar fases e conceder XP em lote sem evidência, com segurança: ou o arquivo inteiro vale, ou nada é gravado. Sem validação atômica e avanço FIFO, indicações múltiplas e fases fora de ordem corrompem submissões e o ranking.

## Solution

Endpoint/administração de importação de `.xlsx` com colunas exatas `mission_id`, `email`, `phase`. Valida todas as linhas, simula FIFO, rejeita o arquivo inteiro se houver qualquer erro; se válido, aplica tudo numa transação sem criar evidência. Só missões `active`, não recorrentes e não check-in; só e-mails de colaboradores existentes.

## User Stories

1. Como Administrador, quero importar um arquivo `.xlsx`, para registrar conclusões externas em lote.
2. Como Administrador, quero que as colunas obrigatórias tenham nomes exatos `mission_id`, `email` e `phase`, para o parser ser previsível.
3. Como Administrador, quero que `mission_id` aponte para missão `active`, não recorrente e não check-in, para não importar o que o modelo não cobre.
4. Como Administrador, quero que `email` identifique colaborador existente, para não criar usuários pela planilha.
5. Como Administrador, quero que `phase` seja inteiro positivo existente e alcançável naquele ponto do arquivo, para respeitar a progressão.
6. Como Administrador, quero validação de todas as linhas antes de gravar, para atomicidade.
7. Como Administrador, quero que qualquer linha inválida rejeite o arquivo inteiro sem criar submissão, avançar fase ou conceder XP, para não ficar estado parcial.
8. Como Administrador, quero um retorno listando número da linha, campo e motivo de cada erro, para corrigir a planilha.
9. Como Administrador, quero que não exista tela de prévia/confirmação além do resultado da importação, para o fluxo ser direto.
10. Como Administrador, quero que, se válido, todas as linhas sejam aplicadas em uma única transação, para consistência.
11. Como Administrador, quero que a importação não crie evidência, para distinguir de envio pelo mural.
12. Como Administrador, quero que cada fase aplicada gere o XP configurado daquela fase no ledger e no saldo, para o ranking atualizar.
13. Como Administrador, quero processamento FIFO de cima para baixo, para o avanço ser determinístico.
14. Como Administrador, quero que fase 1 crie nova submissão quando a missão permite múltiplas; em submissão única, só crie se ainda não houver válida, para respeitar a configuração.
15. Como Administrador, quero que fase posterior avance a submissão `active` mais antiga do mesmo colaborador/missão que esteja exatamente na fase anterior, para o exemplo de Indicação #1/#2.
16. Como Administrador, quero que ausência de candidata FIFO torne o arquivo inválido, para não pular etapas.
17. Como Colaborador, quero que minhas fases importadas apareçam no histórico via `current_phase` e movimentos de XP (sem linha vazia de evidência), para transparência.
18. Como Empresa, quero locks e desempate estável (`submitted_at`, depois `id`) na escolha FIFO, para concorrência segura com envios manuais.
19. Como Administrador, quero que colaborador não possa importar, para proteger o fluxo.
20. Como Empresa, quero que a planilha não identifique a pessoa indicada externamente — só as submissões internas — para manter o escopo do MVP.

## Implementation Decisions

- Formato: apenas `.xlsx`; cabeçalhos exatos; sem criação de usuário.
- Pipeline: parse → validar+simular em memória → commit único ou erro agregado.
- FIFO: índice parcial `submissions_fifo_active_idx` (missão, colaborador, current_phase, submitted_at ASC) WHERE active.
- Sem `submission_phase_evidences` nas linhas importadas.
- Movimentos `phase_reward` (ou equivalente) por fase aplicada.
- UI admin: upload + relatório de erros/sucesso; sem preview passo-a-passo.
- Exemplo canônico de duas indicações (4 linhas) do PRD deve ser teste de aceite.

## Testing Decisions

- Seam: API/domínio com arquivos fixture.
- Casos obrigatórios (modelagem §10 Importação):
  - Cabeçalhos ausentes, UUID inválido, e-mail inexistente, fase inexistente, missão recorrente/check-in → rejeição total.
  - Fase fora de ordem → rejeição total.
  - Fases 1 repetidas com `allows_multiple_submissions` → submissões distintas; depois fase 2 avança a mais antiga primeiro.
  - Nenhuma linha cria evidência.
  - Duas importações/envios concorrentes não consomem a mesma candidata FIFO duas vezes.
  - Colaborador recebe 403.
- Oráculos: zero efeito no banco em rejeição; em sucesso, submissões/fases/XP/ledger coerentes e ranking refletindo saldo.

## Out of Scope

- CSV ou outros formatos.
- Importação de recorrentes/check-ins.
- Tela de prévia linha a linha.
- Identificador externo da pessoa indicada.
- Criação de usuários via planilha.

## Further Notes

- A planilha acompanha apenas “Indicação #1”, “#2” etc. como submissões internas.
- Referências: PRD RF-13; US-18; decisões de importação atômica/FIFO.
