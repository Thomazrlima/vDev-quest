# v(dev) Quest

Frontend mockado em React, Vite, Bun, TanStack Router e Tailwind CSS para uma plataforma gamificada com estética medieval em pixel art.

## Executar

```bash
bun install
bun run dev
```

Abra `http://localhost:3000/ranking`.

Para gerar a versão de produção e visualizá-la localmente:

```bash
bun run build
bun run preview
```

## Arquitetura

O projeto segue Atomic Design. O diretório `src/routes/` contém exclusivamente a camada de páginas e roteamento; regras, estado e interface ficam fora dele.

```text
src/routes/                  páginas e rotas do TanStack Router
src/components/
  atoms/                     elementos indivisíveis
  molecules/                 combinações pequenas de atoms
  organisms/                 blocos funcionais de interface
  templates/                 composição e estado das páginas
src/data/                    dados estáticos e mocks
src/services/                acesso a dados e simulação das APIs
src/types/                   contratos de domínio
src/utils/                   funções puras compartilhadas
public/                      assets servidos pela aplicação
```

Dependências devem apontar para baixo na hierarquia: páginas consomem templates; templates compõem organisms; organisms usam molecules e atoms. Serviços não importam componentes.

## Rotas

- `/ranking` — ranking e pódio.
- `/perfil` — perfil, indicadores e acesso ao criador.
- `/characters` — criador de personagem por camadas.
- `/missions` — gestão de missões e acesso à moderação.
- `/missions/new` e `/missions/:id/edit` — formulário de missão.
- `/moderation` e `/moderation/:id` — fila e detalhe de evidências.

Como a aplicação é uma SPA estática, o hosting deve redirecionar URLs que não sejam assets para `index.html`. Isso permite atualizar diretamente uma rota interna sem receber 404.

## Dados mockados

`src/services/mission-service.ts` simula a BE-01 e persiste missões no `localStorage`. `src/services/moderation-service.ts` simula a BE-02 com filtros e ordenação. Os registros iniciais ficam em `src/data/` e os contratos em `src/types/`.

## Sprites

Os personagens usam as folhas do **Mana Seed Farmer Sprite – Free Sample** presentes em `public/images/sprites/mana-seed-free/`. A configuração da folha fica em `src/data/mana-seed.ts`; cálculo de frames e composição de camadas ficam em `src/utils/mana-seed.ts`.
