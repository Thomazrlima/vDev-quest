# User Stories — v(dev) Quest

**Produto:** v(dev) Quest  
**Idioma:** Português do Brasil  
**Fonte:** [`PRD-vDev-Quest.md`](../PRD-vDev-Quest.md) e [`decisoes-de-produto.md`](../decisoes-de-produto.md)  
**Premissas:** SSO corporativo; fuso `America/Sao_Paulo`; sem aprovação de submissões; papel `manager` aparece como Administrador; XP imediato no envio; ranking global sem temporada.

---

## Papéis

| Papel na UI | Papel no banco | Quem é |
| --- | --- | --- |
| Colaborador | `collaborator` | Pessoa que joga, envia evidências e acompanha progresso |
| Administrador | `manager` | Pessoa que cria missões, importa planilhas e invalida registros |

---

## Épico A — Fundação e acesso

### US-01 — Entrar com SSO corporativo

**Título:** Entrar com SSO corporativo

**Descrição:** Como Colaborador, quero entrar com meu login da empresa, para acessar o v(dev) Quest sem criar senha nova.

**Acceptance Criteria:**
1. O acesso ocorre somente por SSO corporativo.
2. No primeiro acesso, o sistema cria o usuário se ele ainda não existir.
3. Todo usuário novo recebe o papel `collaborator`.
4. A identidade canônica é o e-mail corporativo em minúsculas e sem espaços nas pontas.
5. Um e-mail com letras maiúsculas não cria um segundo usuário.
6. E-mail, papel e XP não podem ser alterados diretamente pelo cliente.

---

### US-02 — Restringir rotas por papel

**Título:** Restringir rotas por papel

**Descrição:** Como Administrador, quero que só quem tem papel administrativo acesse as telas de gestão, para proteger missões, importações e invalidações.

**Acceptance Criteria:**
1. Um colaborador não acessa rotas nem operações administrativas.
2. Um administrador consegue executar todos os fluxos de gestão do MVP.
3. A concessão ou remoção do papel administrativo é feita diretamente no banco no MVP (fora da interface).
4. O nome do usuário pode ser alterado no sistema de forma independente do SSO.

---

## Épico B — Ranking, nível e transparência de XP

### US-03 — Ver ranking global

**Título:** Ver ranking global

**Descrição:** Como Colaborador, quero ver o ranking global com pódio e tabela, para comparar meu progresso com o da equipe.

**Acceptance Criteria:**
1. A tela mostra o pódio com os três primeiros e uma tabela com todos os jogadores.
2. Cada linha exibe posição, personagem, nome, title ativo (se houver), badges (se houver), nível, XP total e progresso para o próximo nível.
3. A ordenação usa, nesta ordem: maior XP, maior quantidade de submissões `active` e nome em ordem alfabética.
4. A posição é única após os critérios de desempate.
5. O ranking nunca expõe o e-mail.
6. Textos de “temporada” do mockup não aparecem; o ranking é acumulado e sem temporada.

---

### US-04 — Atualizar ranking após mudança de XP

**Título:** Atualizar ranking após mudança de XP

**Descrição:** Como Colaborador, quero que o ranking reflita ganhos e perdas de XP na próxima leitura, para confiar na classificação.

**Acceptance Criteria:**
1. Um ganho ou perda de XP muda o ranking na próxima leitura.
2. Dois usuários com o mesmo XP são ordenados pela quantidade de submissões válidas; persistindo o empate, pelo nome.
3. Usuários sem title ou badge aparecem sem espaço quebrado e sem informação inventada.
4. No nível máximo, a interface indica que não existe próximo nível.
5. O nível é o maior cujo `minimum_xp` seja menor ou igual ao XP atual.

---

### US-05 — Registrar movimentos no livro-razão de XP

**Título:** Registrar movimentos no livro-razão de XP

**Descrição:** Como Empresa, quero que cada ganho ou retirada de XP fique registrado de forma imutável, para auditar o ranking e o saldo de cada pessoa.

**Acceptance Criteria:**
1. Cada movimento possui identificador próprio, usuário, submissão relacionada, fase quando aplicável, valor positivo ou negativo, tipo, referência ao movimento original quando for reversão, e data/hora.
2. `amount` nunca é zero; movimentos antigos não são atualizados nem apagados.
3. A soma dos movimentos de um usuário é igual a `core.users.xp`.
4. O saldo nunca fica negativo.
5. A operação de negócio e a atualização do saldo ocorrem na mesma transação.
6. Existe rotina de reconciliação para detectar divergências entre saldo e livro-razão.

---

## Épico C — Perfil e personagem

### US-06 — Ver perfil gamificado

**Título:** Ver perfil gamificado

**Descrição:** Como Colaborador, quero ver meu perfil com progresso, title, badges e histórico, para entender meu status e o que já fiz.

**Acceptance Criteria:**
1. O perfil exibe nome, personagem atual, XP total, nível e progresso para o próximo nível.
2. O perfil mostra total de submissões válidas/concluídas, title ativo e badges quando existirem.
3. O histórico lista submissões e fases, incluindo evidências enviadas, cancelamentos e invalidações com justificativa quando houver.
4. O histórico mostra XP retirado em cancelamentos e invalidações.
5. É possível filtrar o histórico por missão e estado.
6. Registros cancelados ou invalidados continuam visíveis no histórico.

---

### US-07 — Personalizar personagem

**Título:** Personalizar personagem

**Descrição:** Como Colaborador, quero montar meu personagem com prévia antes de salvar, para aparecer do meu jeito no ranking, perfil e mural.

**Acceptance Criteria:**
1. É possível escolher tipo de corpo e peças por slot (cabelo, cabeça, rosto, camisa, calças, saia, sobreposição, meias, calçados, mãos e pescoço).
2. É possível escolher cores de pele e das peças compatíveis, respeitando ordem de desenho e regras visuais.
3. É possível remover peça de um slot quando o catálogo aceitar slot vazio e restaurar a aparência padrão.
4. Todos os itens do catálogo ficam disponíveis para todos; não há inventário, loja nem desbloqueio por XP.
5. A aparência salva reaparece no perfil, lobby e ranking.
6. Um item não pode ser equipado em um slot diferente do definido no catálogo.

---

## Épico D — Gestão de missões

### US-08 — Criar missão com fases

**Título:** Criar missão com fases

**Descrição:** Como Administrador, quero criar missões com fases, evidência e recompensa, para publicar desafios sem depender de desenvolvimento.

**Acceptance Criteria:**
1. Somente o administrador cria missões; a missão nasce `active` (sem rascunho nem publicação).
2. Campos gerais incluem título, descrição, tipo de evidência, datas inicial/final, recorrência, múltiplas submissões e fases.
3. Toda missão tem pelo menos a fase 1; números de fase são positivos, sequenciais e sem lacunas; cada fase tem nome e XP maior que zero.
4. A data final não pode ser anterior à inicial.
5. O backend gera o identificador e o `slug` técnico.
6. A criação é atômica: missão, fases e agenda são gravadas juntas.

---

### US-09 — Configurar recorrência da missão

**Título:** Configurar recorrência da missão

**Descrição:** Como Administrador, quero definir se a missão se repete diária, semanal ou mensalmente, para criar oportunidades claras de envio.

**Acceptance Criteria:**
1. Recorrência pode ser nenhuma, diária, semanal ou mensal.
2. Missão semanal exige pelo menos um dia da semana; missões não semanais não guardam dias da semana.
3. Missões recorrentes possuem somente uma fase.
4. `daily` permite uma submissão válida por dia; `weekly` por cada dia selecionado; `monthly` uma por mês, dentro da vigência.
5. Todas as decisões de dia, semana e mês usam `America/Sao_Paulo`.
6. A unicidade considera apenas submissões `active`; ocorrência cancelada ou invalidada pode ser reenviada enquanto estiver disponível.

---

### US-10 — Criar missão de check-in mensal

**Título:** Criar missão de check-in mensal

**Descrição:** Como Administrador, quero criar a missão de check-in de um mês, para incentivar presença diária com XP-base e bônus.

**Acceptance Criteria:**
1. Ao marcar “Missão de check-in”, o formulário preenche mês/ano atuais e permite escolher outro mês/ano.
2. A seleção vira o primeiro e o último dia daquele mês; a missão tem fase única com recompensa-base pré-preenchida em 1 XP (editável).
3. O administrador escolhe o tipo de evidência.
4. Não pode existir outra missão de check-in para o mesmo mês/ano, mesmo que a anterior tenha sido invalidada.
5. Check-in possui somente uma fase.
6. Missões de check-in não são importáveis por planilha.

---

### US-11 — Editar missão com campos bloqueados após a primeira submissão

**Título:** Editar missão com bloqueio pós-submissão

**Descrição:** Como Administrador, quero corrigir título e descrição mesmo depois do primeiro envio, sem alterar regras históricas já usadas.

**Acceptance Criteria:**
1. Antes da primeira submissão, o administrador pode editar a missão completa.
2. Depois da primeira submissão, ficam bloqueados: tipo de evidência, fases e ordem, XP, recorrência e dias da semana, datas de vigência, opção de check-in e múltiplas submissões.
3. Título e descrição podem ser corrigidos após a primeira submissão.
4. Toda tentativa de alterar campo bloqueado é recusada também pelo backend.

---

### US-12 — Invalidar (excluir logicamente) uma missão

**Título:** Invalidar missão

**Descrição:** Como Administrador, quero invalidar uma missão, para tirá-la do mural e corrigir XP concedido por engano.

**Acceptance Criteria:**
1. Somente o administrador executa a ação; o front mostra o impacto e pede confirmação.
2. Não exige justificativa.
3. A missão passa para `invalidated` e deixa de aparecer como disponível.
4. Todas as submissões `active` da missão são invalidadas e todo o XP concedido por elas é retirado.
5. Bônus de check-in são recalculados quando necessário.
6. Missão, submissões, evidências e movimentos de XP permanecem no histórico; não há restauração no MVP.

---

## Épico E — Mural e submissões

### US-13 — Ver mural de missões disponíveis

**Título:** Ver mural de missões

**Descrição:** Como Colaborador, quero ver no mural as missões ativas com próxima fase, XP e evidência, para saber o que posso fazer agora.

**Acceptance Criteria:**
1. O mural lista missões `active` conforme vigência e recorrência.
2. Cada cartão informa, quando aplicável: título, descrição resumida, próxima fase, recompensa, tipo de evidência, prazo/ocorrência e situação do colaborador.
3. Estados de apresentação são: Disponível, Em andamento, Concluída, Cancelada e Invalidada.
4. Não existe estado “aguardando aprovação”.
5. Filtros do mockup de aprovação/espera/recusa são adaptados para esses estados.
6. Missão recorrente só aparece disponível quando a data atual pertence à vigência e à ocorrência aplicável (`America/Sao_Paulo`).

---

### US-14 — Enviar evidência e avançar fase

**Título:** Enviar evidência e avançar fase

**Descrição:** Como Colaborador, quero enviar a evidência da próxima fase e receber XP na hora, para progredir sem esperar aprovação.

**Acceptance Criteria:**
1. Ao abrir a missão, o colaborador vê somente a próxima fase elegível; não pode pular fase nem informar o XP.
2. O backend cria ou continua uma submissão `active`, valida missão/vigência/ocorrência/fase/payload e, na mesma transação, grava evidência, atualiza fase, registra XP e atualiza o saldo.
3. Foto aceita só PNG/JPEG; PDF só `application/pdf`; link só HTTP/HTTPS válido; texto não vazio após trim; arquivos no máximo 3 MiB.
4. Cada fase enviada pelo mural cria linha em `quests.submission_phase_evidences`; fase importada não cria evidência.
5. Em missão de submissão única, não se inicia outra enquanto houver `active`; com múltiplas submissões, cada novo início da fase 1 cria submissão independente.
6. A resposta devolve fase atual, XP ganho e novo total.

---

### US-15 — Fazer check-in do mês atual

**Título:** Fazer check-in do mês atual

**Descrição:** Como Colaborador, quero registrar check-in em uma data do mês corrente e receber XP-base e bônus de marco, para ser recompensado pela constância.

**Acceptance Criteria:**
1. Só é possível enviar check-in para a missão do mês/ano corrente.
2. A data escolhida vai do primeiro dia do mês até hoje; datas futuras e de outro mês são recusadas.
3. Existe no máximo um check-in `active` por colaborador e data.
4. Ao enviar, o colaborador recebe o XP-base da missão; ao alcançar 10, 15 ou 20 check-ins válidos no mês, recebe +10, +5 e +5 XP respectivamente.
5. Se o check-in daquela data for cancelado ou invalidado, a data volta a ficar disponível enquanto o mês ainda for o atual.
6. O bônus depende da quantidade atual de check-ins válidos; cancelar/invalidar recalcula o mês inteiro.

---

### US-16 — Cancelar a própria submissão

**Título:** Cancelar a própria submissão

**Descrição:** Como Colaborador, quero cancelar minha submissão diretamente, para corrigir um envio errado e devolver o XP.

**Acceptance Criteria:**
1. O colaborador cancela somente submissão própria; não há pedido nem aprovação.
2. A ação afeta a submissão inteira, em qualquer fase; o estado passa para `cancelled` e o registro não é apagado.
3. Todos os XP acumulados pelas fases da submissão são retirados; evidências permanecem no histórico.
4. Se for check-in, o mês é recalculado e bônus não devidos são retirados.
5. Se a ocorrência recorrente ainda estiver disponível, o colaborador pode enviar novamente.
6. Submissão cancelada não pode ser reativada; repetir a operação não retira XP duas vezes.

---

## Épico F — Correções administrativas

### US-17 — Consultar e invalidar submissão

**Título:** Invalidar submissão como administrador

**Descrição:** Como Administrador, quero buscar submissões e invalidar uma ativa com justificativa, para corrigir erros sem apagar o histórico.

**Acceptance Criteria:**
1. É possível buscar e filtrar por colaborador, missão, estado e data.
2. A tela exibe missão, colaborador, fase atual, fases concluídas, evidências e XP concedido.
3. Invalidar exige justificativa e registra administrador, justificativa e data.
4. A submissão passa para `invalidated` sem ser apagada; todo o XP das fases é retirado.
5. Em check-in, os bônus mensais são recalculados; a ocorrência/fase aplicável pode ser reenviada conforme as demais regras.
6. Não há restauração no MVP; duas requisições não invalidam nem retiram XP da mesma submissão duas vezes.

---

## Épico G — Importação

### US-18 — Importar conclusões via planilha .xlsx

**Título:** Importar conclusões via planilha

**Descrição:** Como Administrador, quero importar um `.xlsx` com conclusões de sistemas externos, para registrar fases e conceder XP em lote de forma segura.

**Acceptance Criteria:**
1. Somente administradores importam; o arquivo é `.xlsx` com colunas exatas `mission_id`, `email` e `phase`.
2. A missão deve ser `active`, não recorrente e não check-in; o e-mail deve ser de colaborador existente; a importação não cria usuários.
3. Todas as linhas são validadas antes da gravação; qualquer erro rejeita o arquivo inteiro sem criar submissão, avançar fase ou conceder XP.
4. O retorno lista número da linha, campo e motivo de cada erro; não há tela de prévia.
5. Se válido, todas as linhas são aplicadas em uma única transação, sem criar evidência, gerando o XP configurado de cada fase.
6. O processamento é FIFO: fase 1 cria submissão (respeitando múltiplas/única); fase posterior avança a submissão `active` mais antiga elegível na fase anterior; sem candidata, o arquivo é inválido.

---

## Épico H — Catálogos de title e badge

### US-19 — Criar title no catálogo

**Título:** Criar title no catálogo

**Descrição:** Como Administrador, quero cadastrar titles, para preparar o catálogo que o ranking e o perfil poderão exibir.

**Acceptance Criteria:**
1. Somente o administrador cria titles.
2. Nome é obrigatório; descrição é opcional.
3. O backend gera o `code` técnico a partir do nome, com tratamento de colisão.
4. Não é possível editar, excluir, atribuir manualmente nem criar regras de conquista no MVP.
5. Relações já existentes de usuários com titles podem ser lidas; o MVP não oferece fluxo para alimentá-las.

---

### US-20 — Criar badge no catálogo

**Título:** Criar badge no catálogo

**Descrição:** Como Administrador, quero cadastrar badges com imagem, para preparar o catálogo exibido no ranking e no perfil.

**Acceptance Criteria:**
1. Somente o administrador cria badges.
2. Nome e caminho de imagem são obrigatórios; descrição é opcional.
3. O backend gera o `code` técnico a partir do nome, com tratamento de colisão.
4. Não é possível editar, excluir, atribuir manualmente nem criar regras de conquista no MVP.
5. Imagens de badge possuem texto alternativo apropriado nas telas de exibição.

---

## Épico I — Qualidade transversal (não funcional)

### US-21 — Usar o produto no celular com acessibilidade básica

**Título:** Experiência mobile-first e acessível

**Descrição:** Como Colaborador, quero usar mural, ranking, perfil e envios no celular com teclado e leitores de tela, para participar de qualquer lugar.

**Acceptance Criteria:**
1. Fluxos essenciais funcionam em navegadores móveis e por teclado.
2. Controles têm nome acessível, alvo de toque adequado e foco visível.
3. Estados da interface não dependem apenas de cor; o produto respeita redução de movimento.
4. Ranking, mural, perfil e painéis de gestão priorizam layout para smartphone e adaptam para desktop.
5. Imagens de badge e personagem têm textos alternativos apropriados.
6. Ranking e mural respondem em até 2 segundos no percentil 95 sob a carga esperada do MVP (carga a estimar no refinamento).

---

## Mapa rápido RF → US

| RF do PRD | User Stories |
| --- | --- |
| RF-01 Autenticação e papéis | US-01, US-02 |
| RF-02 Ranking global | US-03, US-04 |
| RF-03 Perfil | US-06 |
| RF-04 Personagem | US-07 |
| RF-05 Criação de missão | US-08 |
| RF-06 Check-in mensal | US-10, US-15 |
| RF-07 Recorrência | US-09, US-13 |
| RF-08 Edição e invalidação de missão | US-11, US-12 |
| RF-09 Mural | US-13 |
| RF-10 Envio e avanço de fase | US-14 |
| RF-11 Cancelamento | US-16 |
| RF-12 Invalidação de submissão | US-17 |
| RF-13 Importação | US-18 |
| RF-14 Livro-razão | US-05 |
| RF-15 Níveis | US-04, US-05 |
| RF-16 Titles e badges | US-19, US-20 |
| RF-17 Transparência e histórico | US-06, US-16, US-17 |
| NF Acessibilidade / desempenho | US-21 |

---

## Ordem sugerida de entrega (alinhada ao PRD §4.3)

1. US-01, US-02, US-05  
2. US-08, US-09, US-11, US-13, US-14  
3. US-16, US-17, US-12, US-06  
4. US-10, US-15  
5. US-18  
6. US-03, US-04, US-07, US-19, US-20, US-21  

---

## Fora do escopo destas stories (MVP)

- Aprovação ou recusa de submissões  
- Temporadas de ranking e reinício de XP  
- Gestão de níveis pela interface  
- Atribuição automática ou manual de titles e badges  
- Loja, inventário ou desbloqueio de avatar  
- Restauração de submissões ou missões canceladas/invalidadas  
- Importação de missões recorrentes ou check-ins  
- Mapa navegável  
