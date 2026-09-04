# PRD — v(dev) Quest

**Versão:** 1.0  
**Status:** pronto para validação  
**Idioma:** Português do Brasil  
**Última atualização:** 03/09/2026  
**Fonte das decisões:** [`decisoes-gamificacao.md`](./decisoes-gamificacao.md)  
**Modelo atual:** [`database/vdev-quest.dbml`](./database/vdev-quest.dbml)  
**Alterações futuras do banco:** [`database/alteracoes-modelagem-vdev-quest.md`](./database/alteracoes-modelagem-vdev-quest.md)

## 1. Resumo

O v(dev) Quest é um sistema interno de gamificação que transforma atividades da
empresa em missões com fases e recompensas de experiência (XP). Colaboradores
acompanham missões, enviam evidências, personalizam o personagem e consultam o
ranking; administradores criam missões e catálogos, importam conclusões e
invalidam registros incorretos.

Este PRD define o comportamento completo do MVP, incluindo progressão de
fases, recorrência, check-ins mensais, cancelamentos, invalidações e auditoria
de XP. Quando houver diferença entre o mockup atual e este documento, este PRD
prevalece como regra de produto; o banco atual é a referência do ponto de
partida, e suas mudanças estão documentadas separadamente.

## 2. Propostas de valor

| Público | Necessidade | Entrega de valor |
| --- | --- | --- |
| Colaborador | Saber o que fazer e quanto ganhará | Mural com próxima fase, evidência exigida, prazo e XP. |
| Colaborador | Sentir progresso e reconhecimento | Nível, barra de progresso, ranking, título, badges e personagem. |
| Colaborador | Entender mudanças no saldo | Histórico com submissões ativas, canceladas e invalidadas e XP retirado. |
| Administrador | Criar desafios sem depender de desenvolvimento | Gestão de missão, fases, recorrência, evidência e recompensa. |
| Administrador | Registrar atividades de sistemas externos | Importação atômica de `.xlsx` com avanço FIFO. |
| Administrador | Corrigir erros | Invalidação lógica com reversão completa e auditável de XP. |
| Empresa | Confiar no ranking | Total materializado para leitura rápida e livro-razão para auditoria. |

O diferencial central não é apenas mostrar pontos. É manter o ranking simples
para o usuário e, ao mesmo tempo, explicar tecnicamente cada ponto concedido ou
retirado.

## 3. Solução

### 3.1 Experiência e fluxos

#### 3.1.1 Estrutura de navegação

O produto deve preservar a linguagem visual gamificada do mockup e oferecer
acesso responsivo às seguintes áreas:

- mural de missões;
- ranking;
- perfil;
- personalização do personagem;
- gestão de missões, submissões, importações, titles e badges para
  administradores.

#### 3.1.2 Fluxo do colaborador

```text
SSO corporativo
  → Mural
  → Escolher missão disponível
  → Consultar próxima fase, XP e evidência
  → Enviar evidência
  → Receber XP imediatamente
  → Acompanhar fase, nível, perfil e ranking
  → Opcionalmente cancelar a própria submissão
```

#### 3.1.3 Fluxo do check-in

```text
Abrir missão de check-in do mês atual
  → Escolher uma data entre o primeiro dia do mês e hoje
  → Enviar a evidência exigida
  → Receber XP-base da missão
  → Receber bônus se alcançar o 10º, 15º ou 20º check-in válido
```

#### 3.1.4 Fluxo administrativo de importação

```text
Selecionar arquivo .xlsx
  → Validar todas as linhas em ordem
  → Simular criação/avanço FIFO
  → Se houver qualquer erro: rejeitar tudo e informar os erros
  → Se estiver válido: gravar todas as mudanças e o XP em uma transação
```

#### 3.1.5 Fluxo de correção

```text
Colaborador cancela a própria submissão
ou administrador invalida uma submissão
  → Preservar o registro
  → Registrar movimentos negativos de XP
  → Recalcular bônus mensais, quando for check-in
  → Atualizar nível e ranking
```

### 3.2 Funcionalidades e requisitos

#### RF-01 — Autenticação e papéis

O acesso deve ocorrer por SSO corporativo.

Requisitos:

- O primeiro acesso cria o usuário, se ele ainda não existir.
- A identificação canônica é o e-mail corporativo normalizado em minúsculas e
  sem espaços nas pontas.
- O nome pode ser atualizado a partir do provedor corporativo.
- Todo novo usuário recebe o papel `collaborator`.
- O papel administrativo é `manager` no banco e **Administrador** na interface.
- A concessão ou remoção do papel administrativo é feita diretamente no banco
  no MVP.
- E-mail, papel e XP não podem ser alterados diretamente pelo cliente.

Critérios de aceite:

- Um colaborador não acessa rotas ou operações administrativas.
- Um administrador consegue executar todos os fluxos de gestão.
- Um e-mail com letras maiúsculas não cria um segundo usuário.
- O ranking nunca expõe o e-mail.

#### RF-02 — Ranking global

O ranking deve mostrar o pódio com os três primeiros e uma tabela com todos os
jogadores.

Campos exibidos:

- posição;
- personagem;
- nome;
- title ativo, quando houver;
- badges conquistados, quando houver;
- nível;
- XP total;
- progresso para o próximo nível.

Regras:

- O ranking é global e acumulado; não há temporadas no MVP.
- A ordenação usa, nesta ordem: maior XP, maior quantidade de submissões
  válidas e nome em ordem alfabética.
- Apenas submissões `active` contam no desempate.
- A posição é única depois da aplicação dos critérios de desempate.
- O nível é o maior nível cujo `minimum_xp` seja menor ou igual ao XP atual.
- No nível máximo, a interface deve indicar que não existe próximo nível.
- A atualização ocorre após a conclusão de qualquer transação que mude XP.
- O cliente recebe números; a formatação visual é responsabilidade do front.
- Textos de “temporada” presentes no mockup devem ser removidos.

Critérios de aceite:

- Um ganho ou perda de XP muda o ranking na próxima leitura.
- Dois usuários com o mesmo XP são ordenados pela quantidade de submissões
  válidas; persistindo o empate, pelo nome.
- Usuários sem title ou badge aparecem sem espaço quebrado ou informação
  inventada.

#### RF-03 — Perfil do colaborador

O perfil reúne identidade gamificada, progresso e histórico.

Deve exibir:

- nome e personagem atual;
- XP total;
- nível atual e progresso para o próximo;
- total de submissões válidas/concluídas;
- title ativo e badges, quando existirem;
- histórico de submissões e fases;
- evidências enviadas em cada fase;
- registros cancelados pelo colaborador;
- registros invalidados pelo administrador, com justificativa;
- XP retirado em cancelamentos e invalidações.

O histórico deve aceitar filtros por missão e estado. Registros não são
apagados da visão histórica apenas porque deixaram de valer.

#### RF-04 — Personalização do personagem

O colaborador pode personalizar o personagem e ver uma prévia antes de salvar.

Requisitos:

- Escolher tipo de corpo disponível no catálogo.
- Escolher peças por slot, incluindo cabelo, cabeça, rosto, camisa, calças,
  saia, sobreposição, meias, calçados, mãos e pescoço.
- Escolher cores de pele e das peças compatíveis.
- Respeitar ordem de desenho e regras visuais de cada item.
- Permitir remover uma peça de um slot quando o catálogo aceitar slot vazio.
- Permitir restaurar a aparência padrão.
- Disponibilizar todos os itens do catálogo para todos os colaboradores.
- Não criar inventário, loja ou desbloqueio por XP no MVP.
- Persistir as escolhas no banco; direção e animação da prévia são apenas
  estados do front.

Critérios de aceite:

- A aparência salva é exibida novamente no perfil, lobby e ranking.
- Um item não pode ser equipado em um slot diferente daquele definido no
  catálogo.

#### RF-05 — Criação de missão

Somente o administrador pode criar missões. A missão nasce `active`; não há
rascunho nem etapa de publicação.

Campos gerais:

- título;
- descrição;
- tipo de evidência: foto PNG/JPEG, PDF, link ou texto;
- data inicial e final;
- recorrência: nenhuma, diária, semanal ou mensal;
- dias da semana, quando a recorrência for semanal;
- permissão de múltiplas submissões independentes pelo mesmo colaborador;
- uma ou mais fases para missões não recorrentes;
- nome e recompensa de XP de cada fase;
- opção “Missão de check-in”.

Regras:

- Toda missão possui pelo menos a fase 1.
- Números de fase são positivos, sequenciais e sem lacunas.
- Cada fase possui nome e XP maior que zero.
- A data final não pode ser anterior à inicial.
- Missões recorrentes e check-ins possuem somente uma fase.
- Missão semanal exige pelo menos um dia da semana.
- Missões não semanais não guardam dias da semana.
- O backend gera o identificador e o `slug` técnico.
- A criação deve ser atômica: missão, fases e agenda são gravadas juntas.

#### RF-06 — Check-in mensal

Ao selecionar “Missão de check-in”, o formulário deve:

- preencher inicialmente o mês e o ano atuais;
- permitir que o administrador escolha outro mês e ano;
- transformar a seleção no primeiro e no último dia daquele mês;
- criar uma fase única;
- preencher a recompensa-base com 1 XP;
- permitir que o administrador altere a recompensa-base;
- permitir a escolha do tipo de evidência;
- impedir que já exista outra missão de check-in para o mesmo mês/ano, mesmo
  que a anterior tenha sido invalidada.

Regras para o colaborador:

- Só é possível enviar check-in para a missão do mês/ano corrente.
- O colaborador escolhe a data do check-in.
- A data pode variar do primeiro dia do mês até o dia atual.
- Datas futuras e datas de outro mês são recusadas.
- Pode existir no máximo um check-in `active` por colaborador e data.
- Se o check-in daquela data for cancelado ou invalidado, a data volta a ficar
  disponível para novo envio enquanto o mês ainda for o atual.

Regras de bônus, fixas no backend:

| Quantidade de check-ins válidos no mês | Bônus obtido ao alcançar o marco |
| --- | --- |
| 10 | +10 XP |
| 15 | +5 XP |
| 20 | +5 XP |

O bônus soma à recompensa-base. Se a recompensa-base for 1 XP, o 10º check-in
concede 11 XP naquele momento.

O direito aos bônus depende da quantidade atual de check-ins válidos. Ao
cancelar ou invalidar um check-in, o backend recalcula o mês inteiro. Exemplo:
20 check-ins com base de 1 XP valem 40 XP; ao remover um deles, restam 19 e o
saldo passa a 34 XP. O sistema retira 6 XP: 1 da submissão e 5 do marco de 20.

#### RF-07 — Recorrência de missões

Recorrência cria oportunidades separadas de submissão:

- `daily`: uma submissão válida por dia dentro da vigência;
- `weekly`: uma submissão válida em cada data cujo dia da semana foi
  selecionado; se segunda e quarta forem selecionadas, há duas oportunidades
  por semana;
- `monthly`: uma submissão válida por mês durante a vigência;
- check-in: exceção mensal que permite um registro por data escolhida no mês
  atual.

Uma missão recorrente só aparece como disponível quando a data atual pertence
à vigência e à ocorrência aplicável. Todas as decisões de dia, semana e mês
usam `America/Sao_Paulo`.

Missões recorrentes possuem fase única. A unicidade considera apenas
submissões `active`; uma ocorrência cancelada ou invalidada pode ser reenviada
enquanto ainda estiver disponível.

#### RF-08 — Edição e invalidação de missão

O administrador pode editar uma missão antes da primeira submissão.

Depois da primeira submissão, devem ficar bloqueados:

- tipo de evidência;
- fases e ordem das fases;
- recompensa de XP;
- recorrência e dias da semana;
- datas de vigência;
- opção de check-in;
- opção de múltiplas submissões.

Título e descrição podem ser corrigidos sem alterar a regra histórica. Toda
tentativa de alterar um campo bloqueado deve ser recusada também pelo backend.

“Excluir missão” significa invalidá-la logicamente:

- somente o administrador pode executar a ação;
- o front mostra o impacto e pede confirmação;
- não exige justificativa;
- a missão passa para `invalidated` e deixa de aparecer como disponível;
- todas as submissões `active` da missão são invalidadas;
- todos os XP concedidos por elas são retirados;
- bônus de check-in são recalculados quando necessário;
- missão, submissões, evidências e movimentos de XP permanecem no histórico;
- não há restauração de missão no MVP.

#### RF-09 — Mural de missões

O mural lista missões `active` de acordo com vigência e recorrência.

Cada cartão deve informar, quando aplicável:

- título e descrição resumida;
- próxima fase;
- recompensa da próxima fase;
- tipo de evidência;
- prazo ou data da ocorrência;
- situação do colaborador naquela missão.

Estados de apresentação:

- **Disponível:** existe uma fase ou ocorrência que pode ser enviada.
- **Em andamento:** uma submissão multifase possui fases concluídas e uma
  próxima fase disponível.
- **Concluída:** a última fase foi alcançada ou a ocorrência foi concluída.
- **Cancelada:** o colaborador cancelou a submissão.
- **Invalidada:** o administrador invalidou a submissão ou a missão.

Os filtros do mockup que tratam aprovação, espera e recusa devem ser adaptados
para esses estados. Não existe “aguardando aprovação” no MVP.

#### RF-10 — Envio de evidência e avanço de fase

Ao abrir uma missão, o colaborador vê somente a próxima fase elegível. Ele não
pode escolher uma fase anterior, pular uma fase ou informar a quantidade de
XP.

Fluxo:

1. O backend determina se deve criar uma submissão ou continuar uma submissão
   `active`.
2. O front exibe a próxima fase, a recompensa e o tipo de evidência.
3. O colaborador preenche a evidência.
4. O backend valida missão, vigência, ocorrência, fase e payload.
5. Na mesma transação, grava a evidência da fase, atualiza `current_phase`,
   registra o movimento positivo de XP e atualiza `core.users.xp`.
6. A resposta devolve a fase atual, o XP ganho e o novo total.

Evidências:

- Foto: somente PNG ou JPEG.
- PDF: somente `application/pdf`.
- Link: somente URL HTTP ou HTTPS válida.
- Texto: conteúdo não vazio após remoção de espaços nas pontas.
- Arquivos têm limite máximo de 10 MiB.
- O banco guarda a chave privada e estável do objeto; URLs temporárias são
  geradas somente para visualização autorizada.
- Cada fase com envio pelo mural cria uma linha em
  `quests.submission_phase_evidences`.
- Uma fase importada não cria evidência.

Para missão de submissão única, o colaborador não inicia outra submissão
enquanto houver uma `active`. Para missão configurada com múltiplas submissões,
cada novo início de fase 1 cria uma submissão independente.

#### RF-11 — Cancelamento pelo colaborador

O colaborador pode cancelar diretamente uma submissão própria. Não existe
pedido de cancelamento nem aprovação administrativa.

Regras:

- A ação afeta a submissão inteira, em qualquer fase.
- A submissão passa para `cancelled` e não é apagada.
- Todos os XP acumulados por suas fases são retirados.
- As evidências permanecem no histórico.
- Se for check-in, o mês inteiro é recalculado e os bônus não mais devidos são
  retirados.
- Se for uma ocorrência recorrente ainda disponível, o colaborador pode
  enviar novamente.
- Uma submissão cancelada não pode ser reativada.
- A mesma operação repetida não pode retirar XP duas vezes.

#### RF-12 — Invalidação de submissão pelo administrador

O administrador pode consultar submissões e invalidar uma que esteja `active`.
Esse fluxo substitui a fila de aprovação do mockup.

Requisitos:

- Permitir busca e filtros por colaborador, missão, estado e data.
- Exibir missão, colaborador, fase atual, fases concluídas, evidências e XP
  concedido.
- Exigir justificativa para invalidar a submissão.
- Registrar administrador, justificativa e data.
- Marcar a submissão como `invalidated` sem apagá-la.
- Retirar todos os XP concedidos pelas fases dessa submissão.
- Recalcular bônus mensais quando for check-in.
- Permitir novo envio da ocorrência/fase aplicável conforme as demais regras.
- Não permitir restauração no MVP.
- Impedir que duas requisições invalidem ou retirem XP da mesma submissão duas
  vezes.

#### RF-13 — Importação de planilha

Somente administradores podem importar. O arquivo deve ser `.xlsx` e conter
as colunas obrigatórias, com estes nomes exatos:

| Coluna | Tipo | Regra |
| --- | --- | --- |
| `mission_id` | UUID | Deve identificar missão `active`, não recorrente e não check-in. |
| `email` | Texto | Deve identificar usuário existente com papel `collaborator`. |
| `phase` | Inteiro positivo | Deve existir na missão e ser alcançável naquele ponto do arquivo. |

Regras gerais:

- Check-ins e qualquer missão recorrente não podem ser importados.
- A importação não cria usuários.
- Não há tela de prévia.
- Todas as linhas são validadas antes da gravação.
- Qualquer linha inválida rejeita o arquivo inteiro.
- A rejeição não cria submissão, não avança fase e não concede XP.
- O retorno deve listar número da linha, campo e motivo de cada erro encontrado.
- Se o arquivo estiver válido, todas as linhas são aplicadas em uma única
  transação.
- Importação não exige nem cria evidência.
- Cada fase aplicada gera o XP configurado para aquela fase.

Processamento FIFO, isto é, primeiro a entrar, primeiro a sair:

1. As linhas são simuladas de cima para baixo.
2. Fase 1 cria uma nova submissão quando a missão permite múltiplas submissões.
3. Em missão de submissão única, fase 1 só cria quando ainda não existe uma
   submissão válida para o colaborador.
4. Uma fase posterior procura a submissão `active` mais antiga, do mesmo
   colaborador e missão, que esteja exatamente na fase anterior.
5. Encontrada a submissão, `current_phase` é atualizado e o XP da nova fase é
   concedido.
6. Se não houver candidata, o arquivo é inválido.

Exemplo com duas indicações:

```text
linha 1: missão X, ana@empresa.com, fase 1 → cria Indicação #1
linha 2: missão X, ana@empresa.com, fase 1 → cria Indicação #2
linha 3: missão X, ana@empresa.com, fase 2 → avança Indicação #1
linha 4: missão X, ana@empresa.com, fase 2 → avança Indicação #2
```

A planilha não identifica a pessoa indicada. O produto acompanha apenas as
submissões internas “Indicação #1”, “Indicação #2” e assim por diante.

#### RF-14 — Livro-razão de XP

`core.users.xp` guarda o saldo atual para tornar ranking e perfil rápidos.
`gamification.xp_awards` funciona como livro-razão imutável e explica cada
mudança.

Cada movimento contém:

- identificador próprio;
- usuário;
- submissão relacionada;
- fase, quando aplicável;
- valor positivo ou negativo;
- tipo do movimento;
- referência ao movimento original, quando for reversão;
- data/hora.

Tipos mínimos:

- recompensa de fase;
- XP-base de check-in;
- bônus de marco 10, 15 ou 20;
- reversão por cancelamento do colaborador;
- reversão por invalidação administrativa;
- reversão causada pela invalidação da missão;
- correção de bônus de check-in.

Regras:

- `amount` nunca pode ser zero.
- Movimentos antigos não podem ser atualizados ou apagados.
- Uma reversão aponta para o movimento positivo que compensa.
- A soma dos movimentos de um usuário deve ser igual a `core.users.xp`.
- O saldo nunca pode ficar negativo.
- A operação de negócio e a atualização do saldo ocorrem na mesma transação.
- Deve existir rotina de reconciliação para detectar divergências.

#### RF-15 — Níveis

- Níveis são configurados diretamente em `gamification.levels`.
- Não haverá tela administrativa de níveis no MVP.
- Cada nível possui número, XP mínimo e nome.
- Deve existir nível inicial com XP mínimo igual a zero.
- O nível do usuário é derivado do saldo atual; não é persistido em
  `core.users`.
- Ganhos e reversões de XP podem subir ou reduzir o nível imediatamente.

#### RF-16 — Criação de titles e badges

Somente o administrador pode criar itens dos catálogos.

Title:

- nome obrigatório;
- descrição opcional;
- `code` técnico gerado pelo backend a partir do nome, com tratamento de
  colisão.

Badge:

- nome obrigatório;
- descrição opcional;
- caminho de imagem obrigatório;
- `code` técnico gerado pelo backend a partir do nome, com tratamento de
  colisão.

Fora do escopo:

- editar ou excluir itens;
- atribuir manualmente;
- criar regras de conquista;
- ativar um title pelo usuário.

As relações existentes de usuários com titles e badges podem continuar sendo
lidas. O MVP não oferece uma funcionalidade para alimentá-las.

#### RF-17 — Transparência e histórico

O sistema deve preservar e apresentar:

- fase atual da submissão;
- evidências das fases enviadas pelo mural;
- fases registradas por importação, identificáveis pelos movimentos de XP;
- data de criação e avanço;
- estado ativo, cancelado ou invalidado;
- justificativa de invalidação de submissão;
- XP concedido e retirado.

Uma fase importada não cria uma linha vazia na tabela de evidências. Seu avanço
fica representado por `current_phase` e pelos movimentos do livro-razão.

### 3.3 Requisitos técnicos

#### 3.3.1 Fonte de verdade e transações

- PostgreSQL é a fonte de verdade do domínio.
- `core.users.xp` é o saldo materializado; o livro-razão é a trilha de auditoria.
- Criar/avançar submissão, registrar evidência, registrar XP e atualizar saldo
  é uma operação atômica.
- Cancelar ou invalidar submissão ou missão, registrar valores negativos e
  atualizar saldo também é uma operação atômica.
- Importação valida tudo antes e grava tudo em uma única transação.
- Linhas relevantes devem ser bloqueadas durante mudanças de XP para evitar
  corrida entre requisições.

#### 3.3.2 Segurança

- Ativar e forçar RLS nas tabelas que contêm dados de usuário.
- Colaborador lê e grava apenas as próprias submissões, evidências e avatar.
- Administrador acessa as operações administrativas necessárias.
- Clientes não escrevem em `core.users.xp`, papéis ou livro-razão.
- Anexos ficam em armazenamento privado; acesso usa URL temporária.
- Chaves, tokens e URLs assinadas nunca são persistidos em campos públicos.
- As respostas do ranking expõem apenas os dados públicos necessários.

#### 3.3.3 Desempenho

- Ranking e mural devem responder em até 2 segundos no percentil 95 sob a
  carga esperada do MVP. A carga esperada deve ser estimada no refinamento.
- Listas devem ser paginadas quando o volume exceder o limite definido pela
  API.
- Consultas de ranking, histórico e seleção FIFO devem usar os índices
  documentados no plano de banco.
- Processos de invalidação de missão com grande volume podem ser executados em
  lote interno, mas a missão deve deixar de aceitar novos envios imediatamente.

#### 3.3.4 Acessibilidade e responsividade

O desenvolvimento deve ser mobile-first, garantindo que todas as telas e
fluxos do produto funcionem perfeitamente em dispositivos móveis como foco
principal da experiência.

Todos os fluxos essenciais devem ser plenamente funcionais em navegadores
móveis e por teclado.

Controles e elementos interativos devem possuir nome acessível, alvo de toque
adequado para telas sensíveis ao toque e foco visível.

Os estados da interface não podem depender apenas de cor e o produto deve
respeitar a configuração de redução de movimento do sistema.

Ranking, mural, perfil e painéis de gestão devem ter layout otimizado
primariamente para smartphones, adaptando-se secundariamente para desktop.

Imagens de badge e personagem devem contar com textos alternativos apropriados
para leitores de tela.

### 3.4 Regras consolidadas

| Tema | Regra final |
| --- | --- |
| Administrador | Chamado de Administrador no produto; persistido como `manager`. |
| Aprovação | Não existe. Submissões válidas concedem XP imediatamente. |
| Cancelamento | Feito diretamente pelo colaborador na própria submissão. |
| Invalidação de submissão | Feita pelo administrador, definitiva e com justificativa. |
| Invalidação de missão | Exclusão lógica, definitiva, sem justificativa e com confirmação no front. |
| Ranking | Global, sem temporada. Ordena por XP, submissões válidas e nome. |
| Fases | Sequenciais; uma submissão única avança e acumula XP por fase. |
| Evidências | Uma linha por submissão/fase apenas quando houve envio pelo mural. |
| Importação | `.xlsx`, atômica, sem evidência, somente para missões não recorrentes. |
| FIFO | Linhas de cima para baixo; avança a submissão elegível mais antiga. |
| Recorrência | Diária por dia; semanal por dia selecionado; mensal uma vez por mês. |
| Check-in | Uma missão por mês, uma submissão válida por data, somente no mês atual. |
| Calendário | Sempre `America/Sao_Paulo`. |
| XP | Saldo materializado e movimentos imutáveis positivos/negativos. |
| Níveis | Derivados de tabela administrada diretamente no banco. |
| Avatar | Catálogo inteiro disponível, sem desbloqueios. |
| Titles/badges | Criação de catálogo apenas; sem atribuição no MVP. |

## 4. Lançamento

### 4.1 Conteúdo do MVP

- SSO e papéis.
- Ranking global.
- Perfil e histórico.
- Personalização completa do personagem.
- Criação, edição controlada e invalidação de missões.
- Fases e evidências.
- Mural e submissões.
- Cancelamento pelo colaborador.
- Invalidação pelo administrador.
- Recorrências.
- Check-in mensal com bônus e recálculo.
- Importação atômica `.xlsx` com FIFO.
- Livro-razão de XP e níveis.
- Criação de titles e badges.

### 4.2 Fora do MVP

- Aprovação ou recusa de submissões.
- Temporadas de ranking e reinício de XP.
- Gestão de níveis pela interface.
- Atribuição automática ou manual de titles e badges.
- Loja, inventário ou desbloqueio de itens de avatar.
- Restauração de submissões ou missões invalidadas/canceladas.
- Importação de missões recorrentes ou check-ins.
- Mapa navegável.

### 4.3 Sequência recomendada

1. **Fundação:** migration, RLS, SSO, catálogo de níveis e livro-razão de XP.
2. **Missões:** gestão, fases, evidências, mural, progressão e recorrências.
3. **Correções:** cancelamento, invalidação, reconciliação e histórico.
4. **Check-in:** competência diária, bônus, recálculo e testes de calendário.
5. **Importação:** parser `.xlsx`, validação atômica e avanço FIFO.
6. **Gamificação visual:** ranking, perfil, avatar, titles e badges.
Cada etapa depende dos testes automatizados da etapa anterior. O produto pode
ser liberado para um grupo piloto depois que os fluxos de XP, cancelamento,
invalidação e reconciliação estiverem estáveis; a liberação geral ocorre após
a validação do piloto e dos resultados-chave técnicos.

### 4.4 Critérios de prontidão

- Todas as regras RF-01 a RF-17 possuem testes de aceite.
- RLS foi validada para colaborador e administrador.
- Ganho, reversão e recálculo de XP foram testados com concorrência.
- Importação foi testada com arquivos válidos, inválidos, repetidos e fora de
  ordem.
- Check-in foi testado em mudança de dia, mês e horário de verão aplicável ao
  fuso configurado.
- Ranking foi reconciliado contra o livro-razão.
- Fluxos críticos foram validados em celular, computador e teclado.
