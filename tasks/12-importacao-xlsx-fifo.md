# 12: Importação .xlsx atômica com FIFO

**What to build:** O administrador importa um `.xlsx` com `mission_id`, `email` e `phase`. Ou o arquivo inteiro é válido e aplica fases/XP sem evidência em uma transação (FIFO), ou qualquer erro rejeita tudo com relatório linha a linha.

**Blocked by:** 05: Missões multifase e edição bloqueada; 07: Múltiplas submissões independentes

**Status:** ready-for-agent

- [ ] Somente administrador importa; arquivo `.xlsx`
- [ ] Colunas exatas: `mission_id`, `email`, `phase`
- [ ] Missão deve ser `active`, não recorrente, não check-in
- [ ] E-mail deve ser colaborador existente; importação não cria usuário
- [ ] Validação + simulação de todas as linhas antes de gravar
- [ ] Qualquer erro rejeita o arquivo inteiro sem side-effects; resposta lista linha, campo e motivo
- [ ] Sem tela de prévia além do resultado
- [ ] Sucesso: uma transação; sem criar `submission_phase_evidences`; XP por fase aplicado no ledger e saldo
- [ ] FIFO: fase 1 cria submissão (respeitando múltiplas/única); fase posterior avança a `active` mais antiga elegível na fase anterior (`submitted_at`, desempate por id)
- [ ] Sem candidata FIFO → arquivo inválido
- [ ] Exemplo canônico de duas indicações (4 linhas) passa
- [ ] Concorrência não consome a mesma candidata FIFO duas vezes
- [ ] Colaborador recebe bloqueio ao tentar importar
