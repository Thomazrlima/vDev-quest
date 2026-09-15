# Character Base (`char_a_*`)

512×512 sprite sheets, 8×8 grid of 64×64 frames. Each sheet is one **page** (a batch of
related animations) for one **part** in one **colour variant**.

```
char_a_p1_4har_pon1_v03.png
└┬─┘ │  │    │    └ variant  — colour swap
 │   │  │    └────── item    — the specific hair/hat/outfit
 │   │  └─────────── layer   — which paper-doll layer it belongs on
 │   └────────────── page    — which animation set
 └────────────────── char sheet, type a
```

## Folder layout

```
layers/<layer>/<item>/char_a_<page>_<layer>_<item>_v<NN>.png
guides/            animation maps, layer-order references, timing gifs, palette
effects-and-props/ jump shadow, standalone weapon sprites, slash effects
outfit-canvases/   Aseprite sources for drawing your own compatible parts
COVERAGE.md        which parts exist on which pages — read this before designing the UI
```

## Draw order

Bottom to top. Note `0bot` sits **behind** the body, everything else in front:

```
0bot-behind-character   long cloak, tail-end of back-heavy items
0bas-body               the character body  ← skin tone lives here
1out-outfit             the whole-body outfit
2clo-cloak              cloaks, capes, mantles
3fac-face               glasses, goggles, masks
4har-hair               hair
5hat-hat                hats and hoods
6tla-tool-main          primary weapon / tool
7tlb-tool-offhand       shield, quiver, off-hand
```

Two exceptions the author calls out, both needing per-frame handling:

- A big hat or hair can cover the tool layer when facing **north** — move `6tla`/`7tlb`
  below it for those frames.
- Some hats clip through hair and require the hair layer to be hidden entirely.

`guides/layer order, *.png` shows, frame by frame, when the tool goes in front of or behind
the body on the combat pages.

## Pages

| Page        | Animations                                       |
| ----------- | ------------------------------------------------ |
| `p1`        | walk, run, push, pull, jump                      |
| `p1B`       | alt page 1 — carrying a two-handed tool/weapon   |
| `p1C`       | same as `p1B`, different standing frame          |
| `p2`        | farming, mining, woodcutting                     |
| `p3`        | fishing                                          |
| `p4`        | misc — smithing, climbing, toe tap               |
| `pBOW1/2/3` | bow: draw & idle / shooting / hurt & death       |
| `pONE1/2/3` | one-handed: draw & idle / attacks / hurt & death |
| `pPOL1/2/3` | polearm: draw & idle / attacks / hurt & death    |

**Every layer you draw must come from the same page.** A `p1` body with a `p2` hat is
garbage — the frames mean different things.

`p1` needs one extra step: the run cycle reuses walk frames. Rows 5–8, frames 1–6 are the
walk; frames 7–8 are run-only. Walk plays `1,2,3,4,5,6`; run plays `1,2,7,4,5,8`.
See `guides/using this base.txt` for that and the full timing table.

## Skin, outfits, hair — what the player can pick

- **Skin tone** — `layers/0bas-body/humn-human/`, variants `v00`–`v10` (11 tones), present
  on every page. `gbln-goblin` and `demn-demon` are alternate bodies but only exist on
  `p1`/`p1B`/`p1C`, so a character using them cannot farm, fish or fight.
- **Outfit** — `layers/1out-outfit/`, 8 outfits. `undi` and `boxr` are the underwear you
  show when nothing is equipped.
- **Hair** — `layers/4har-hair/`, 7 styles × 14 colours (`v00`–`v13`). `pon1-ponytail` also
  ships `v11a`/`v11b` as two takes on the same colour.
- **Hat** — `layers/5hat-hat/`, 7 items. `hddn`/`hdpl` (hood down / hood up) are meant to be
  worn over a cloak or mantle from `2clo`, never bare — see
  `guides/stacking layers (cloak & hood).txt`.

**The catch:** combat pages have far thinner coverage than movement pages. Only 2 of 7
hairstyles, 4 of 8 outfits and 2 of 7 hats were drawn for the bow / sword / polearm pages.
`COVERAGE.md` has the full matrix. Either restrict the character creator to the
combat-complete set, or hide the missing parts while weapons are drawn.

Colour variants are **pre-baked PNGs**, not runtime palette swaps. To offer arbitrary
colours you would recolour against the ramps in `guides/color ramps and v00.png` and
`guides/mana seed, sprites.pal`.
