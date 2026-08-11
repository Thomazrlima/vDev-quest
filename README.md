# v(dev) Quest

Frontend mockado em Next.js, App Router, React e Tailwind CSS para uma plataforma gamificada com estética medieval em pixel art.

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000/ranking`.

## Arquitetura

O projeto segue Atomic Design. O diretório `app/` é exclusivamente a camada de páginas e roteamento do Next; regras, estado e interface ficam fora dele.

```text
app/                         páginas e rotas do App Router
components/
  atoms/                     elementos indivisíveis
  molecules/                 combinações pequenas de atoms
  organisms/                 blocos funcionais de interface
  templates/                 composição e estado das páginas
data/                        dados estáticos e mocks
services/                    acesso a dados e simulação das APIs
types/                       contratos de domínio
utils/                       funções puras compartilhadas
public/                      assets servidos pela aplicação
```

Dependências devem apontar para baixo na hierarquia: páginas consomem templates; templates compõem organisms; organisms usam molecules e atoms. Serviços não importam componentes.

## Rotas

- `/ranking` — ranking e pódio.
- `/perfil` — perfil, indicadores e acesso ao criador.
- `/characters` — criador de personagem por camadas.
- `/missions` — gestão de missões e acesso à moderação.
- `/missions/new` e `/missions/[id]/edit` — formulário de missão.
- `/moderation` e `/moderation/[id]` — fila e detalhe de evidências.

## Dados mockados

`services/mission-service.ts` simula a BE-01 e persiste missões no `localStorage`. `services/moderation-service.ts` simula a BE-02 com filtros e ordenação. Os registros iniciais ficam em `data/` e os contratos em `types/`.

## Sprites

Os personagens usam as folhas do **Mana Seed Farmer Sprite – Free Sample** presentes em `public/sprites/mana-seed-free/`. A configuração da folha fica em `data/mana-seed.ts`; cálculo de frames e composição de camadas ficam em `utils/mana-seed.ts`.
