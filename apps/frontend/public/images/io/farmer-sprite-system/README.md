# Farmer Sprite System (`fbas_*`)

One sheet per part, sliced into **64×64 cells**. Unlike the Character Base there are no
pages — every animation for a part lives on its single sheet, so equipping a part is one
texture, not one-per-animation.

```
fbas_14head_headscarf_00b_e.png
└┬─┘ └──┬─┘ └───┬───┘ └┬┘ └┬┘
 │      │       │      │   └ special flag (see below)
 │      │       │      └──── version + palette-ramp code
 │      │       └─────────── item name
 │      └─────────────────── layer (numbered in draw order)
 └────────────────────────── farmer base
```

## Folder layout

```
layers/<NN><layer>-<description>/fbas_*.png
effects-and-props/   tools, props, icons, slash & fishing effects, arrows, bows
guides/              animation guide, cell reference, colour ramps, palettes
customizer/          Seliel's GUI preview tool (PC + Mac builds)
fbas_XXfldr_blank_sheet.png   empty template for drawing your own part
```

## Draw order

Folders are numbered, so sorting them alphabetically _is_ the draw order, bottom to top:

| Layer    | Holds                                                                 |
| -------- | --------------------------------------------------------------------- |
| `00undr` | under everything — back wing, back half of a cloak                    |
| `01body` | the body ← skin tone lives here                                       |
| `02sock` | socks, stockings, hose                                                |
| `03fot1` | footwear small enough to sit under the pant leg                       |
| `04lwr1` | most pants & shorts                                                   |
| `05shrt` | most shirts & blouses                                                 |
| `06lwr2` | pants with an upper part — overalls, shortalls                        |
| `07fot2` | footwear big enough to go over the pant leg                           |
| `08lwr3` | most skirts & dresses                                                 |
| `09hand` | gloves, bracers                                                       |
| `10outr` | coats, jackets, vests, suspenders                                     |
| `11neck` | cloak, scarf — over all other clothes                                 |
| `12face` | glasses, masks                                                        |
| `13hair` | hair                                                                  |
| `14head` | hats, hoods, horns                                                    |
| `15over` | over everything — front wing, magic effects (empty; for your own art) |

`04lwr1`, `06lwr2` and `08lwr3` are all "legs" — pick **one**. A character can't wear both
pants and overalls.

## Two rules that bite

**`_e` suffix — hair and hats that refuse to coexist.**

- On a **hat** (`fbas_14head_headscarf_00b_e`): hide the `13hair` layer entirely while it's worn.
- On a **hair** (`fbas_13hair_mohawk_00_e`): hide the hair whenever any hat is worn.

**Split parts.** Some clothing needs two layers on at once. `cloakplain` and
`cloakwithmantleplain` each exist in both `00undr` _and_ `11neck`; draw both or the cloak
looks wrong.

## Skin, outfits, hair — what the player can pick

There is **one** body sheet (`01body/fbas_01body_human_00.png`) and one hair sheet per
style. Colour is not pre-baked here — you swap **palette ramps at runtime**, which is why
this system supports a free-form colour picker while the Character Base doesn't.

The trailing letter of the version code tells you which ramp layout a sheet uses:

| Code  | Ramp layout                                |
| ----- | ------------------------------------------ |
| `00a` | one 3-colour ramp                          |
| `00b` | one 4-colour ramp                          |
| `00c` | two 3-colour ramps                         |
| `00d` | one 4-colour ramp + one 3-colour ramp      |
| `00f` | one 4-colour ramp + the 5-colour hair ramp |

Read the code at load time and you know which colours to substitute. The exact ramps, and
the ready-made skin / hair / tool ramp sets to swap in, are in
`guides/Mana Seed color ramps.png` and `guides/palettes/`.

Items ending in `boobs` (`longshirtboobs`, `frillydressboobs`, …) are alternate cuts of the
same garment with a shaped chest — same slot, offer them as a body-shape toggle rather than
as separate clothing.

## Building animations

Slice the body sheet at 64×64, then read `guides/farmer base cell reference.png` alongside
`guides/farmer base animation guide.png` — the cell reference names each cell, the animation
guide says which cells make up each animation. Every other layer uses the identical
arrangement, so the same frame index works across all of them.

Props and effects labelled in **bright green** on the animation guide have a preconfigured
layout and can be stacked like a clothing layer. Everything else is positioned by hand.

Some animations need frames played out of order or mirrored, and props moved in front of or
behind the character mid-animation. This is not a plug-and-play asset — see
`guides/Farmer Sprite System readme.txt`.
