# Spec 02 — Missões e mural

**Status:** ready-for-agent  
**Ordem:** 2/6  
**Stories:** US-08, US-09, US-11, US-13, US-14  
**RF:** RF-05, RF-07, RF-08 (somente edição), RF-09, RF-10  

## Problem Statement

Colaboradores precisam saber o que fazer agora (próxima fase, evidência, prazo, XP). Administradores precisam criar missões com fases e recorrência sem depender de desenvolvimento. O mock atual fala em rascunho/publicação e “aguardando aprovação”; o produto real concede XP no envio e nasce `active`.

## Solution

Entregar gestão de missões (criar, editar com bloqueios pós-primeira-submissão), fases, recorrência, mural do colaborador e envio de evidência com avanço de fase e XP imediato na mesma transação. Missões recorrentes geram oportunidades por ocorrência em `America/Sao_Paulo`. Não há fila de aprovação.

## User Stories

1. Como Administrador, quero criar missões que nascem `active`, para publicá-las sem rascunho nem etapa de publicação.
2. Como Administrador, quero informar título, descrição, tipo de evidência, datas inicial/final, recorrência e se permite múltiplas submissões, para configurar o desafio completo.
3. Como Administrador, quero definir uma ou mais fases (não recorrentes) com nome e XP > 0, para recompensar progressão sequencial.
4. Como Administrador, quero que toda missão tenha pelo menos a fase 1, com números positivos, sequenciais e sem lacunas, para manter a progressão previsível.
5. Como Administrador, quero que a data final não possa ser anterior à inicial, para evitar vigência inválida.
6. Como Administrador, quero que o backend gere id e `slug` técnico, para não inventar identificadores na UI.
7. Como Administrador, quero criação atômica (missão + fases + agenda semanal), para não ficar missão pela metade.
8. Como Administrador, quero escolher recorrência nenhuma, diária, semanal ou mensal, para criar oportunidades claras de envio.
9. Como Administrador, quero que missão semanal exija ao menos um dia da semana e que não semanais não guardem dias, para não haver configuração ambígua.
10. Como Administrador, quero que missões recorrentes tenham somente uma fase, para simplificar unicidade por ocorrência.
11. Como Colaborador, quero uma submissão válida por dia (`daily`), por cada dia selecionado (`weekly`) ou por mês (`monthly`) dentro da vigência, para não ser bloqueado em ocorrências futuras.
12. Como Colaborador, quero que decisões de dia/semana/mês usem `America/Sao_Paulo`, para o mural bater com o calendário da empresa.
13. Como Colaborador, quero que só submissões `active` contem na unicidade, para poder reenviar após cancelamento/invalidação futura.
14. Como Administrador, quero editar a missão completa antes da primeira submissão, para corrigir configuração.
15. Como Administrador, quero que após a primeira submissão fiquem bloqueados: tipo de evidência, fases/ordem, XP, recorrência/dias, datas, check-in e múltiplas submissões, para preservar regras históricas.
16. Como Administrador, quero continuar podendo corrigir título e descrição após a primeira submissão, para ajustar textos sem mudar a regra.
17. Como Administrador, quero que o backend também recuse alteração de campo bloqueado, para a UI não ser o único guardião.
18. Como Colaborador, quero ver no mural missões `active` conforme vigência e recorrência, para saber o que posso fazer agora.
19. Como Colaborador, quero que cada cartão mostre título, descrição resumida, próxima fase, recompensa, tipo de evidência, prazo/ocorrência e minha situação, para decidir rapidamente.
20. Como Colaborador, quero estados Disponivel / Em andamento / Concluída / Cancelada / Invalidada (sem “aguardando aprovação”), para entender o progresso real.
21. Como Colaborador, quero filtros do mock adaptados a esses estados, para não ver linguagem de moderação.
22. Como Colaborador, quero abrir uma missão e ver só a próxima fase elegível, para não pular etapas nem informar XP.
23. Como Colaborador, quero enviar evidência e receber XP na hora, para progredir sem esperar aprovação.
24. Como Colaborador, quero que foto aceite só PNG/JPEG, PDF só `application/pdf`, link só HTTP(S), texto não vazio após trim, e arquivos ≤ 3 MiB, para evidências válidas.
25. Como Colaborador, quero que cada fase enviada pelo mural crie linha em evidências por fase, para o histórico não sobrescrever etapas.
26. Como Colaborador, quero que em missão de submissão única eu não inicie outra enquanto houver `active`, e com múltiplas submissões cada início da fase 1 crie submissão independente, para casos como várias indicações.
27. Como Colaborador, quero que a resposta do envio devolva fase atual, XP ganho e novo total, para feedback imediato.
28. Como Empresa, quero que envio, evidência, avanço de fase, movimento de XP e saldo ocorram na mesma transação com locks, para evitar corrida e XP inconsistente.
29. Como Colaborador, quero URLs temporárias só para visualização autorizada de anexos (chave privada no banco), para não vazar storage.
30. Como Administrador, quero listar e editar missões na área de gestão, para manter o catálogo de desafios.

## Implementation Decisions

- Estados de missão: `active` | `invalidated` (invalidação completa é spec 03; aqui só o ciclo de criação/edição e mural de `active`).
- Estados de submissão: `active` | `cancelled` | `invalidated` (nesta spec o colaborador cria/avança `active`; cancelar/invalidar na 03).
- `allows_multiple_submissions` em missão; padrão `false`.
- Submissão guarda `current_phase` e, em recorrências, `occurrence_date`.
- Evidências em `quests.submission_phase_evidences` (PK submissão+fase); payload arquivo XOR valor textual.
- Tipo de evidência só em `missions.evidence_type`: `photo` | `pdf` | `link` | `text`.
- XP da fase copia `mission_phases.xp_reward` no momento do envio; cliente nunca informa XP.
- Movimento tipicamente `phase_reward` (check-in entra na spec 04).
- Transação de envio: lock missão/submissão/usuário → validar → gravar evidência → atualizar `current_phase` → inserir ledger → incrementar `users.xp`.
- Storage privado para anexos; persistir só `attachment_object_key`.
- Frontend: remover linguagem de aprovação/espera/recusa; adaptar filtros do mural; gestão de missões alinhada ao formulário real (sem draft/publish).
- Substitui o fluxo de “moderação/aprovação” do mock por gestão + mural; a fila de aprovação deixa de existir como conceito de produto.
- Check-in (`is_checkin`) não é o foco desta spec; se o formulário já tiver o toggle, a regra completa fica na spec 04 (ou bloquear criação de check-in até lá).

## Testing Decisions

- Seam: API/domínio.
- Oráculos: missão criada atomicamente; mural lista só o disponível pela regra de calendário; envio concede XP e avança fase; falha em evidência não concede XP; retentativa não duplica recompensa; dois envios concorrentes respeitam unicidade.
- Casos de recorrência: daily/weekly/monthly com fuso SP; ocorrência fora da vigência não aparece/disponibiliza.
- Edição: campos bloqueados após primeira submissão rejeitados pela API.
- Evidência: MIME, tamanho, link inválido, texto vazio.
- Multiplicidade: segunda fase 1 permitida só se `allows_multiple_submissions`.
- Prior art de testes: critérios da seção 10 de modelagem (transações e unicidade) + US-08/09/11/13/14.

## Out of Scope

- Invalidação de missão e de submissão; cancelamento pelo colaborador (spec 03).
- Check-in mensal e bônus (spec 04).
- Importação `.xlsx` (spec 05).
- Ranking, avatar, titles/badges (spec 06).
- Aprovação/recusa de evidências.

## Further Notes

- Missão recorrente só aparece disponível quando a data atual pertence à vigência e à ocorrência aplicável.
- Invalidação/cancelamento futuros liberam reenvio da ocorrência enquanto vigente — a unicidade já deve considerar só `active`.
- Referências: PRD RF-05, RF-07, RF-08 (edição), RF-09, RF-10; US-08, 09, 11, 13, 14.
