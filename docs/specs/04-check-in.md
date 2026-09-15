# Spec 04 — Check-in mensal

**Status:** ready-for-agent  
**Ordem:** 4/6  
**Stories:** US-10, US-15  
**RF:** RF-06  

## Problem Statement

A empresa quer incentivar presença/constância com check-ins diários no mês, XP-base e bônus em marcos (10/15/20). Sem regras claras de data, unicidade mensal da missão e recálculo de bônus após cancelar/invalidar, o saldo de check-in fica incorreto e o ranking perde credibilidade.

## Solution

Administrador cria missão de check-in para um mês/ano (vigência do 1º ao último dia, fase única, XP-base sugerido 1). Colaborador só checka no mês corrente, escolhendo data entre o dia 1 e hoje. Bônus fixos no backend (+10/+5/+5). Cancelar ou invalidar recalcula o mês inteiro e ajusta o livro-razão.

## User Stories

1. Como Administrador, quero marcar “Missão de check-in” no formulário, para criar o desafio mensal especial.
2. Como Administrador, quero que o formulário preencha mês/ano atuais e permita escolher outro, para planejar o mês.
3. Como Administrador, quero que a seleção vire `start_date` no 1º dia e `end_date` no último dia do mês, para vigência civil correta.
4. Como Administrador, quero fase única com recompensa-base pré-preenchida em 1 XP (editável) e tipo de evidência escolhível, para configurar o check-in.
5. Como Administrador, quero que não exista outra missão de check-in para o mesmo mês/ano, mesmo se a anterior estiver invalidada, para evitar duplicidade.
6. Como Administrador, quero que check-in exija recorrência mensal e uma única fase, para bater com o modelo.
7. Como Colaborador, quero enviar check-in só na missão do mês/ano corrente, para não registrar competência errada.
8. Como Colaborador, quero escolher a data do check-in do dia 1 até hoje (fuso SP), para registrar dias passados do mês atual.
9. Como Colaborador, quero que datas futuras e de outro mês sejam recusadas, para impedir fraude de calendário.
10. Como Colaborador, quero no máximo um check-in `active` por mim e por data, para não duplicar o dia.
11. Como Colaborador, quero receber o XP-base da fase ao enviar, para ser recompensado na hora.
12. Como Colaborador, quero receber +10 XP ao alcançar 10 check-ins válidos no mês, +5 no 15º e +5 no 20º, para ser premiado pela constância.
13. Como Colaborador, quero que o bônus some à base no momento do marco (ex.: base 1 → 10º check-in concede 11 XP naquele envio), para feedback claro.
14. Como Colaborador, quero que, ao cancelar/invalidar um check-in, a data volte a ficar disponível enquanto o mês for o atual, para poder reenviar.
15. Como Colaborador, quero que cancelar/invalidar recalcule o mês inteiro (base × válidos + marcos ainda atingidos), para o saldo ficar certo.
16. Como Empresa, quero movimentos tipados de base, marco e correção de bônus no livro-razão, para auditar o mês.
17. Como Empresa, quero o exemplo canônico: 20 check-ins com base 1 = 40 XP; remover um → 19 = 34 XP (delta −6), para validar o recálculo.
18. Como Administrador, quero que check-ins não sejam importáveis por planilha, para não misturar com FIFO da spec 05.
19. Como Colaborador, quero ver a missão de check-in no mural quando for o mês vigente, com evidência exigida e estado, para saber o que fazer.
20. Como Desenvolvedor, quero unicidade de missão check-in por ano/mês via índice único em `start_date`, sem coluna `checkin_month`, para manter o modelo enxuto.

## Implementation Decisions

- `is_checkin = true` ⇒ `recurrence_type = monthly`; vigência no mês civil; fase única.
- Unicidade: índice único em `(year(start_date), month(start_date)) WHERE is_checkin`.
- `occurrence_date` na submissão = data escolhida pelo colaborador; unicidade `active` por (missão, colaborador, occurrence_date).
- Bônus fixos no backend (não configuráveis por UI no MVP): 10→+10, 15→+5, 20→+5.
- Tipos de movimento: `checkin_base_reward`, `checkin_milestone_reward`, `checkin_bonus_correction` (e reversões já existentes ao cancelar/invalidar).
- Serviço de recálculo mensal (por usuário + missão check-in): contar `active` com datas distintas → devido = base×qtd + marcos → inserir deltas no ledger → atualizar saldo.
- Front: seletor mês/ano na criação; no envio, date picker limitado a [1º dia do mês … hoje] no mês corrente.
- Check-in usa o mesmo fluxo transacional de envio/cancelamento/invalidação das specs 02–03, com o gancho de recálculo.

## Testing Decisions

- Seam: API/domínio; congelar/relógio em `America/Sao_Paulo`.
- Casos obrigatórios (modelagem §10 Check-in):
  - Data de outro mês / futura rejeitada; passada do mês atual aceita.
  - Segundo `active` na mesma data rejeitado; após cancelar, data libera.
  - Marcos 10/15/20 concedem +10/+5/+5.
  - 20→19 retira base + bônus do marco 20 (delta −6 com base 1).
  - Duas missões check-in no mesmo mês/ano rejeitadas (mesmo após invalidar a primeira).
  - Mudança de dia/mês e horário de verão aplicável ao fuso configurado.
- Oráculos: ledger + `users.xp` + disponibilidade da data no mural.

## Out of Scope

- Importação de check-ins.
- Bônus configuráveis ou fases múltiplas em check-in.
- Check-in fora do mês corrente.
- Temporadas.

## Further Notes

- O direito aos bônus depende da quantidade **atual** de válidos; bônus não são irrevogáveis.
- Referências: PRD RF-06; US-10, US-15; decisões 2026-09-03; modelagem §5.5.
