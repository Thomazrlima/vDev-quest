# v(dev) Quest

Interface mockada em Next.js, App Router e Tailwind CSS para uma plataforma de evolução dev com estética medieval em pixel art.

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000/login`. O login é demonstrativo; preencha qualquer e-mail e senha válidos ou use o botão SSO.

## Rotas

- `/login` — entrada da guilda, formulário local e SSO mockado.
- `/dashboard` — perfil, nível, insígnias e trilha interativa.
- `/characters` — criador local com as variações liberadas no Free Sample.
- `/ranking` — pódio animado, filtro local e posições 4–10.

## Personagens Mana Seed (Free Sample)

Os personagens utilizam exclusivamente folhas originais do **Mana Seed Farmer Sprite – Free Sample**, copiadas sem alteração para `public/sprites/mana-seed-free/`: corpo humano, sapatos, calça longa, duas camisas, dois cabelos e o chapéu cowboy.

`lib/manaSeed.ts` centraliza as dimensões das células (64×64), a grade 16×16, a pilha de camadas, o frame estático e a animação do pódio. A amostra gratuita libera somente walk e jump; por isso, o pódio usa o ciclo walk `[048, 051, 049, 052, 050]` a 240 ms por frame e os avatares estáticos usam o frame `048` com recorte ampliado do rosto.

O cenário de fundo em `public/art/` é independente. O atlas `adventurer-atlas.png` não é mais referenciado pela interface.

O logo original fornecido está disponível em `public/quest-logo.png`.
